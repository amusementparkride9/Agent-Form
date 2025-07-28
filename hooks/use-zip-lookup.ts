"use client"

import { useState } from "react"
import { zipCodeFallback } from "@/lib/zip-fallback"

interface ZipLocation {
  zipCode: string
  city: string
  state: string
}

interface ZipLookupResult {
  city: string | null
  state: string | null
  found: boolean
}

const useZipLookup = () => {
  const [lookupCache, setLookupCache] = useState<Map<string, ZipLocation>>(new Map())

  const lookupZip = async (zipCode: string): Promise<ZipLookupResult> => {
    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return { city: null, state: null, found: false }
    }

    // Check cache first
    const cached = lookupCache.get(zipCode)
    if (cached) {
      return {
        city: cached.city,
        state: cached.state,
        found: true
      }
    }

    try {
      // Try external APIs first
      let result = await tryZippopotamusAPI(zipCode)
      
      if (!result.found) {
        result = await tryPostalCodesAPI(zipCode)
      }
      
      if (!result.found) {
        result = await tryZipCodeStackAPI(zipCode)
      }

      // If all APIs fail, try our fallback database
      if (!result.found) {
        const fallbackData = zipCodeFallback[zipCode]
        if (fallbackData) {
          result = {
            city: fallbackData.city,
            state: fallbackData.state,
            found: true
          }
        }
      }

      // Cache the result if found
      if (result.found && result.city && result.state) {
        const newCache = new Map(lookupCache)
        newCache.set(zipCode, {
          zipCode,
          city: result.city,
          state: result.state
        })
        setLookupCache(newCache)
      }

      return result
    } catch (error) {
      console.error("Error looking up ZIP code:", error)
      
      // Try fallback as last resort
      const fallbackData = zipCodeFallback[zipCode]
      if (fallbackData) {
        return {
          city: fallbackData.city,
          state: fallbackData.state,
          found: true
        }
      }
      
      return { city: null, state: null, found: false }
    }
  }

  // Zippopotamus API (free, no key required)
  const tryZippopotamusAPI = async (zipCode: string): Promise<ZipLookupResult> => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.places && data.places.length > 0) {
          const place = data.places[0]
          return {
            city: place["place name"],
            state: place["state abbreviation"],
            found: true
          }
        }
      }
    } catch (error) {
      console.log("Zippopotamus API failed:", error)
    }
    return { city: null, state: null, found: false }
  }

  // PostalCodes.io API (backup)
  const tryPostalCodesAPI = async (zipCode: string): Promise<ZipLookupResult> => {
    try {
      const response = await fetch(`https://api.postal-codes.com/postal_code?code=${zipCode}&country=US`)
      if (response.ok) {
        const data = await response.json()
        if (data.city && data.state_code) {
          return {
            city: data.city,
            state: data.state_code,
            found: true
          }
        }
      }
    } catch (error) {
      console.log("PostalCodes API failed:", error)
    }
    return { city: null, state: null, found: false }
  }

  // ZipCodeStack API (another backup)
  const tryZipCodeStackAPI = async (zipCode: string): Promise<ZipLookupResult> => {
    try {
      const response = await fetch(`https://api.zipcodestack.com/v1/search?codes=${zipCode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results[zipCode] && data.results[zipCode].length > 0) {
          const result = data.results[zipCode][0]
          return {
            city: result.city,
            state: result.state_code,
            found: true
          }
        }
      }
    } catch (error) {
      console.log("ZipCodeStack API failed:", error)
    }
    return { city: null, state: null, found: false }
  }

  return { lookupZip }
}

export default useZipLookup

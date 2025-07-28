"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Wifi, AlertTriangle } from "lucide-react"
import useZipData, { type ZipResult, type ProviderData } from "@/hooks/use-zip-data"
import useZipLookup from "@/hooks/use-zip-lookup"

interface ZipCodeSectionProps {
  onZipResult: (result: ZipResult | null) => void
}

const ZipCodeSection: React.FC<ZipCodeSectionProps> = ({ onZipResult }) => {
  const [zipCode, setZipCode] = useState("")
  const { xfinityData, frontierFiberData, frontierCopperData, optimumData, metronetData, kineticData, brightspeedFiberData, brightspeedCopperData, spectrumData, altafiberData } = useZipData()
  const { lookupZip } = useZipLookup()
  const [zipResult, setZipResult] = useState<ZipResult | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)

  const providersData: ProviderData[] = [
    xfinityData,
    frontierFiberData,
    frontierCopperData,
    optimumData,
    metronetData,
    kineticData,
    brightspeedFiberData,
    brightspeedCopperData,
    spectrumData,
    altafiberData,
  ]

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{5}$/.test(zipCode)) {
      alert("Please enter a valid 5-digit ZIP code.")
      return
    }

    setIsLookingUp(true)
    
    try {
      // Use the ZIP lookup service to get accurate city and state
      const locationLookup = await lookupZip(zipCode)
      const city: string | null = locationLookup.city
      const state: string | null = locationLookup.state
      
      const availableProviders: string[] = []
      const debugInfo: { [provider: string]: number } = {}

      providersData.forEach((providerData) => {
        const { name, service, zipCodes } = providerData
        const zipMatch = zipCodes.includes(zipCode)
        debugInfo[name] = zipMatch ? 1 : 0

        if (zipMatch) {
          availableProviders.push(name + (service ? ` (${service})` : ""))
        }
      })

      // Add nationwide providers
      if (!availableProviders.some(p => p.includes("EarthLink"))) {
        availableProviders.push("EarthLink (Nationwide)")
        debugInfo["EarthLink"] = 1
      }
      if (!availableProviders.some(p => p.includes("DirecTV"))) {
        availableProviders.push("DirecTV (Nationwide)")
        debugInfo["DirecTV"] = 1
      }

      const result: ZipResult = {
        zipCode: zipCode,
        city: city,
        state: state,
        providers: availableProviders,
        debugInfo: debugInfo,
      }

      setZipResult(result)
      onZipResult(result)
    } catch (error) {
      console.error("Error looking up ZIP code:", error)
      alert("Error looking up ZIP code. Please try again.")
    } finally {
      setIsLookingUp(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="zip-code" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Enter ZIP Code *
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="zip-code"
                type="text"
                placeholder="e.g., 40505"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                required
                value={zipCode}
                onChange={handleZipChange}
                maxLength={5}
              />
              <Button type="submit" className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLookingUp}>
                {isLookingUp ? "Looking up..." : "Check Availability"}
              </Button>
            </div>
          </div>
        </form>

        {zipResult && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Service Providers in {zipResult.zipCode}
            </h3>
            {zipResult.city && zipResult.state && (
              <p className="text-gray-600">
                Location: {zipResult.city}, {zipResult.state}
              </p>
            )}
            {zipResult.providers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {zipResult.providers.map((provider, index) => (
                  <Badge key={index} variant="secondary">
                    {provider}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-md">
                <AlertTriangle className="w-4 h-4" />
                <p>No providers found for this ZIP code.</p>
              </div>
            )}

            <details className="mt-4">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">Debug Information</summary>
              <div className="mt-2 p-4 bg-gray-100 rounded-md text-xs">
                <p><strong>Location Lookup:</strong> {zipResult.city && zipResult.state ? "✅ Found" : "❌ Not Found"}</p>
                <p><strong>Provider Data Loaded:</strong></p>
                {Object.entries(zipResult.debugInfo).map(([provider, count]) => (
                  <p key={provider}>
                    {provider}: {count === 1 ? "✅" : "❌"}
                  </p>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ZipCodeSection

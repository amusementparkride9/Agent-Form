"use client"

import React, { useState, useEffect } from "react"
import { getProviderConfig } from "@/lib/admin-settings"
import type { ProviderConfig } from "@/lib/supabase"

export interface ProviderData {
  name: string
  city: string | null
  state: string | null
  service: string | null
  zipCodes: string[]
}

export interface ZipResult {
  zipCode: string
  city: string | null
  state: string | null
  providers: string[]
  debugInfo: {
    [provider: string]: number
  }
}

const useZipData = () => {
  const [xfinityData, setXfinityData] = useState<ProviderData>({
    name: "Xfinity",
    city: null,
    state: null,
    service: null,
    zipCodes: [],
  })
  const [frontierFiberData, setFrontierFiberData] = useState<ProviderData>({
    name: "Frontier Fiber",
    city: null,
    state: null,
    service: "Fiber",
    zipCodes: [],
  })
  const [frontierCopperData, setFrontierCopperData] = useState<ProviderData>({
    name: "Frontier Copper",
    city: null,
    state: null,
    service: "Copper",
    zipCodes: [],
  })
  const [optimumData, setOptimumData] = useState<ProviderData>({
    name: "Optimum",
    city: null,
    state: null,
    service: null,
    zipCodes: [],
  })
  const [metronetData, setMetronetData] = useState<ProviderData>({
    name: "Metronet",
    city: null,
    state: null,
    service: null,
    zipCodes: [],
  })
  const [kineticData, setKineticData] = useState<ProviderData>({
    name: "Kinetic",
    city: null,
    state: null,
    service: null,
    zipCodes: [],
  })
  const [brightspeedFiberData, setBrightspeedFiberData] = useState<ProviderData>({
    name: "BrightSpeed Fiber",
    city: null,
    state: null,
    service: "Fiber",
    zipCodes: [],
  })
  const [brightspeedCopperData, setBrightspeedCopperData] = useState<ProviderData>({
    name: "BrightSpeed Copper",
    city: null,
    state: null,
    service: "Copper",
    zipCodes: [],
  })
  const [spectrumData, setSpectrumData] = useState<ProviderData>({
    name: "Spectrum",
    city: null,
    state: null,
    service: "Cable",
    zipCodes: [],
  })
  const [altafiberData, setAltafiberData] = useState<ProviderData>({
    name: "Altafiber",
    city: null,
    state: null,
    service: "Fiber",
    zipCodes: [],
  })

  // Admin settings for enabled providers
  const [enabledProviders, setEnabledProviders] = useState<ProviderConfig[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)

  // Load enabled providers from admin settings
  useEffect(() => {
    const loadEnabledProviders = async () => {
      try {
        const providers = await getProviderConfig()
        setEnabledProviders(providers.filter(p => p.enabled))
      } catch (error) {
        console.error('Error loading enabled providers:', error)
        // Fallback to all providers enabled if there's an error
        setEnabledProviders([
          { id: 'xfinity', name: 'Xfinity', enabled: true, displayOrder: 1 },
          { id: 'spectrum', name: 'Spectrum', enabled: true, displayOrder: 2 },
          { id: 'frontier-fiber', name: 'Frontier Fiber', enabled: true, displayOrder: 3 },
          { id: 'frontier-copper', name: 'Frontier Copper', enabled: true, displayOrder: 4 },
          { id: 'brightspeed-fiber', name: 'BrightSpeed Fiber', enabled: true, displayOrder: 5 },
          { id: 'brightspeed-copper', name: 'BrightSpeed Copper', enabled: true, displayOrder: 6 },
          { id: 'altafiber', name: 'Altafiber', enabled: true, displayOrder: 7 },
          { id: 'metronet', name: 'Metronet', enabled: true, displayOrder: 8 },
          { id: 'optimum', name: 'Optimum', enabled: true, displayOrder: 9 },
          { id: 'kinetic', name: 'Kinetic', enabled: true, displayOrder: 10 },
          { id: 'earthlink', name: 'EarthLink', enabled: true, displayOrder: 11 },
          { id: 'directv', name: 'DirecTV', enabled: true, displayOrder: 12 }
        ])
      } finally {
        setIsLoadingProviders(false)
      }
    }

    loadEnabledProviders()
  }, [])
  // Check ZIP code against all providers
  const checkZip = (zipCode: string): ZipResult | null => {
    // Don't process if providers are still loading
    if (isLoadingProviders) {
      return null;
    }

    const providers: string[] = [];
    const debugInfo: { [provider: string]: number } = {};
    const enabledProviderNames = new Set(enabledProviders.map(p => p.name));

    const allProviders = [
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
    ];

    // Check regional providers - only include if enabled in admin settings
    allProviders.forEach((data) => {
      if (data.zipCodes.includes(zipCode) && enabledProviderNames.has(data.name)) {
        providers.push(data.name);
        debugInfo[data.name] = data.zipCodes.length;
      }
    });

    // Add nationwide providers only if they're enabled in admin settings
    if (enabledProviderNames.has("EarthLink")) {
      providers.push("EarthLink");
    }
    if (enabledProviderNames.has("DirecTV")) {
      providers.push("DirecTV");
    }

    if (providers.length === 0) {
      return null;
    }

    // Optionally, city/state could be looked up from the first matching provider
    let city: string | null = null;
    let state: string | null = null;
    for (const data of allProviders) {
      if (data.zipCodes.includes(zipCode)) {
        city = data.city;
        state = data.state;
        break;
      }
    }

    return {
      zipCode,
      city,
      state,
      providers,
      debugInfo,
    };
  };

  useEffect(() => {
    // Don't load data until we know which providers are enabled
    if (isLoadingProviders) {
      return;
    }

    const loadJSONData = async (url: string, provider: string, setData: (data: ProviderData) => void) => {
      try {
        const response = await fetch(url)
        const jsonData = await response.json()
        
        let dataArray: any[] = []
        let sheetName = ""
        
        // Handle different sheet name variations
        if (jsonData && jsonData["Sheet1"]) {
          dataArray = jsonData["Sheet1"]
          sheetName = "Sheet1"
        } else if (jsonData && jsonData["Sheet 1"]) {
          dataArray = jsonData["Sheet 1"]
          sheetName = "Sheet 1"
        } else if (jsonData && jsonData["Headend - City Level 10+ Hps"]) {
          dataArray = jsonData["Headend - City Level 10+ Hps"]
          sheetName = "Headend - City Level 10+ Hps"
        } else if (jsonData && jsonData["2-27-25 SEM"]) {
          dataArray = jsonData["2-27-25 SEM"]
          sheetName = "2-27-25 SEM"
        } else {
          console.error(`Failed to parse JSON data for ${provider}. Available keys:`, Object.keys(jsonData))
          return
        }

        // Extract ZIP codes, handling both string and number formats
        const zipCodes = dataArray
          .map((row) => {
            const zipCode = row.ZIP_Code
            if (zipCode === null || zipCode === undefined) return null
            return zipCode.toString().trim()
          })
          .filter((zip) => zip && zip.length === 5) // Ensure it's a valid 5-digit ZIP
        
        // Extract cities and states
        const cities = dataArray
          .map((row) => row.CITY_NAME?.toString().trim())
          .filter((city) => city)
        
        const states = dataArray
          .map((row) => row.ST_ABBREV?.toString().trim())
          .filter((state) => state)
        
        // Extract service information if available
        const serviceInfo = dataArray
          .map((row) => row.SERVICE_Avail?.toString().trim())
          .filter((service) => service)

        setData({
          name: provider,
          city: cities.length > 0 ? cities[0] : null,
          state: states.length > 0 ? states[0] : null,
          service: serviceInfo.length > 0 ? serviceInfo[0] : null,
          zipCodes: zipCodes,
        })
        
        console.log(`Loaded ${zipCodes.length} ZIP codes for ${provider} from ${sheetName}`)
      } catch (error) {
        console.error(`Error loading JSON data for ${provider}:`, error)
      }
    }

    // Get enabled providers to determine which files to load
    const enabledProviderNames = new Set(enabledProviders.map(p => p.name));

    // Only load data for enabled providers
    if (enabledProviderNames.has("Xfinity")) {
      loadJSONData("/data/xfinityZips-siSQcj7UKeMQ0DrMXzmRUmWIK7haNr.json", "Xfinity", setXfinityData)
    } else {
      setXfinityData({ name: "Xfinity", city: null, state: null, service: null, zipCodes: [] })
    }

    if (enabledProviderNames.has("Frontier Fiber")) {
      loadJSONData("/data/frontierFiberZips-xrIRFmUmIGQ94TZYoP0LF23R9WcXPN.json", "Frontier Fiber", setFrontierFiberData)
    } else {
      setFrontierFiberData({ name: "Frontier Fiber", city: null, state: null, service: "Fiber", zipCodes: [] })
    }

    if (enabledProviderNames.has("Frontier Copper")) {
      loadJSONData("/data/frontierCopperZips-OiL98fvOfxmGgE6s5UvT7LeQa4fbfJ.json", "Frontier Copper", setFrontierCopperData)
    } else {
      setFrontierCopperData({ name: "Frontier Copper", city: null, state: null, service: "Copper", zipCodes: [] })
    }

    if (enabledProviderNames.has("Optimum")) {
      loadJSONData("/data/optimumZips-Lb2XsvLAOwfpZV9sKn69EBo6njkFlq.json", "Optimum", setOptimumData)
    } else {
      setOptimumData({ name: "Optimum", city: null, state: null, service: null, zipCodes: [] })
    }

    if (enabledProviderNames.has("Metronet")) {
      loadJSONData("/data/metronetZips-lmFqkBNTp82dLOg20VkM9KzF0Ot9R7.json", "Metronet", setMetronetData)
    } else {
      setMetronetData({ name: "Metronet", city: null, state: null, service: null, zipCodes: [] })
    }

    if (enabledProviderNames.has("Kinetic")) {
      loadJSONData("/data/kineticZips-wn2vjsrpVBWRx2PTpbHibqjBv2XgPv.json", "Kinetic", setKineticData)
    } else {
      setKineticData({ name: "Kinetic", city: null, state: null, service: null, zipCodes: [] })
    }

    if (enabledProviderNames.has("BrightSpeed Fiber")) {
      loadJSONData("/data/brightspeedFiberZips-kJ8mNvQpRtUwXyZ5aBcDeFgHiLmOp2.json", "BrightSpeed Fiber", setBrightspeedFiberData)
    } else {
      setBrightspeedFiberData({ name: "BrightSpeed Fiber", city: null, state: null, service: "Fiber", zipCodes: [] })
    }

    if (enabledProviderNames.has("BrightSpeed Copper")) {
      loadJSONData("/data/brightspeedCopperZips-mP9nQwRsXyA1bCdEfG2hIjKlMnOpQr.json", "BrightSpeed Copper", setBrightspeedCopperData)
    } else {
      setBrightspeedCopperData({ name: "BrightSpeed Copper", city: null, state: null, service: "Copper", zipCodes: [] })
    }

    if (enabledProviderNames.has("Spectrum")) {
      loadJSONData("/data/spectrumCableZips-tZ3wQvBnMxL5yE8rF9gHjK2pAsD4eC.json", "Spectrum", setSpectrumData)
    } else {
      setSpectrumData({ name: "Spectrum", city: null, state: null, service: "Cable", zipCodes: [] })
    }

    if (enabledProviderNames.has("Altafiber")) {
      loadJSONData("/data/altafiberZips-aF7bGhK9mNpQrStV2wXyZ5cEdF8jLn.json", "Altafiber", setAltafiberData)
    } else {
      setAltafiberData({ name: "Altafiber", city: null, state: null, service: "Fiber", zipCodes: [] })
    }
  }, [enabledProviders, isLoadingProviders]) // Only run when providers are loaded

  return { xfinityData, frontierFiberData, frontierCopperData, optimumData, metronetData, kineticData, brightspeedFiberData, brightspeedCopperData, spectrumData, altafiberData, checkZip }
}

export default useZipData

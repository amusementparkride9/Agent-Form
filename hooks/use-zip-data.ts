"use client"

import { useState, useEffect } from "react"

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

  useEffect(() => {
    const loadJSONData = async (url: string, provider: string, setData: (data: ProviderData) => void) => {
      try {
        const response = await fetch(url)
        const jsonData = await response.json()
        if (jsonData && jsonData["Sheet1"]) {
          const zipCodes = (jsonData["Sheet1"] as any[])
            .map((row) => row.ZIP_Code?.toString().trim())
            .filter((zip) => zip)
          const cities = (jsonData["Sheet1"] as any[])
            .map((row) => row.CITY_NAME?.toString().trim())
            .filter((city) => city)
          const states = (jsonData["Sheet1"] as any[])
            .map((row) => row.ST_ABBREV?.toString().trim())
            .filter((state) => state)
          setData({
            name: provider,
            city: cities.length > 0 ? cities[0] : null,
            state: states.length > 0 ? states[0] : null,
            service: null,
            zipCodes: zipCodes,
          })
        } else if (jsonData && jsonData["Headend - City Level 10+ Hps"]) {
          const zipCodes = (jsonData["Headend - City Level 10+ Hps"] as any[])
            .map((row) => row.ZIP_Code?.toString().trim())
            .filter((zip) => zip)
          const cities = (jsonData["Headend - City Level 10+ Hps"] as any[])
            .map((row) => row.CITY_NAME?.toString().trim())
            .filter((city) => city)
          const states = (jsonData["Headend - City Level 10+ Hps"] as any[])
            .map((row) => row.ST_ABBREV?.toString().trim())
            .filter((state) => state)
          setData({
            name: provider,
            city: cities.length > 0 ? cities[0] : null,
            state: states.length > 0 ? states[0] : null,
            service: row.SERVICE_Avail,
            zipCodes: zipCodes,
          })
        } else if (jsonData && jsonData["2-27-25 SEM"]) {
          const zipCodes = (jsonData["2-27-25 SEM"] as any[])
            .map((row) => row.ZIP_Code?.toString().trim())
            .filter((zip) => zip)
          const cities = (jsonData["2-27-25 SEM"] as any[])
            .map((row) => row.CITY_NAME?.toString().trim())
            .filter((city) => city)
          const states = (jsonData["2-27-25 SEM"] as any[])
            .map((row) => row.ST_ABBREV?.toString().trim())
            .filter((state) => state)
          setData({
            name: provider,
            city: cities.length > 0 ? cities[0] : null,
            state: states.length > 0 ? states[0] : null,
            service: null,
            zipCodes: zipCodes,
          })
        } else {
          console.error(`Failed to parse JSON data for ${provider}`)
        }
      } catch (error) {
        console.error(`Error loading JSON data for ${provider}:`, error)
      }
    }

    loadJSONData("/data/xfinityZips-siSQcj7UKeMQ0DrMXzmRUmWIK7haNr.json", "Xfinity", setXfinityData)
    loadJSONData("/data/frontierFiberZips-xrIRFmUmIGQ94TZYoP0LF23R9WcXPN.json", "Frontier Fiber", setFrontierFiberData)
    loadJSONData(
      "/data/frontierCopperZips-OiL98fvOfxmGgE6s5UvT7LeQa4fbfJ.json",
      "Frontier Copper",
      setFrontierCopperData,
    )
    loadJSONData("/data/optimumZips-Lb2XsvLAOwfpZV9sKn69EBo6njkFlq.json", "Optimum", setOptimumData)
    loadJSONData("/data/metronetZips-lmFqkBNTp82dLOg20VkM9KzF0Ot9R7.json", "Metronet", setMetronetData)
    loadJSONData("/data/kineticZips-wn2vjsrpVBWRx2PTpbHibqjBv2XgPv.json", "Kinetic", setKineticData)
  }, [])

  return { xfinityData, frontierFiberData, frontierCopperData, optimumData, metronetData, kineticData }
}

export default useZipData

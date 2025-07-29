"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, MapPin, Wifi, Calendar, Phone, Mail, CreditCard, Settings, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import ZipCodeSection from "./components/zip-code-section"
import type { ZipResult } from "./hooks/use-zip-data"
import { useFormSubmission } from "./hooks/use-form-submission"

export default function InternetOrderForm() {
  const [movedLastYear, setMovedLastYear] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [zipResult, setZipResult] = useState<ZipResult | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [selectedDirectvPackage, setSelectedDirectvPackage] = useState<string>("")
  const [directvWithDevice, setDirectvWithDevice] = useState<boolean>(true)
  const [showProviderDetails, setShowProviderDetails] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [modalProvider, setModalProvider] = useState<string>("")
  const [forceSelectedProvider, setForceSelectedProvider] = useState<string | null>(null)

  // Form submission hook
  const { submitForm, isSubmitting, submissionResult, resetSubmission } = useFormSubmission()

  // Form data state
  const [formData, setFormData] = useState({
    agentName: '',
    agentId: '',
    customerName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    streetAddress: '',
    aptUnit: '',
    city: '',
    state: '',
    zipCode: '',
    prevStreetAddress: '',
    prevAptUnit: '',
    prevCity: '',
    prevState: '',
    prevZipCode: '',
  })

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Format SSN with dashes as user types
  const formatSSN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Limit to 9 digits
    const truncated = digits.slice(0, 9)
    
    // Add dashes in the right places
    if (truncated.length >= 6) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3, 5)}-${truncated.slice(5)}`
    } else if (truncated.length >= 4) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`
    } else if (truncated.length >= 1) {
      return truncated
    }
    return ''
  }

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value)
    updateFormData('ssn', formatted)
  }

  // Format phone number with formatting as user types
  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const truncated = digits.slice(0, 10)
    
    // Add formatting in the right places
    if (truncated.length >= 7) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`
    } else if (truncated.length >= 4) {
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`
    } else if (truncated.length >= 1) {
      return `(${truncated}`
    }
    return ''
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    updateFormData('phone', formatted)
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    updateFormData('dateOfBirth', dateValue)
    
    // Check if age is at least 18
    const age = calculateAge(dateValue)
    if (dateValue && age < 18) {
      // You could add an error state here or show a message
      console.warn('Customer must be at least 18 years old')
    }
  }

  // Dynamic package options based on selected provider
  const getPackageOptions = () => {
    if (!selectedProvider) return []
    
    const packagesByProvider: { [key: string]: Array<{value: string, label: string, speed: string, price: string}> } = {
      "Xfinity": [
        { value: "xfinity-400-1yr", label: "400 Mbps (1-Year Deal)", speed: "400 Mbps", price: "$40/mo" },
        { value: "xfinity-400-5yr", label: "400 Mbps (5-Year Guarantee)", speed: "400 Mbps", price: "$55/mo" },
        { value: "xfinity-600-1yr", label: "600 Mbps (1-Year Deal)", speed: "600 Mbps", price: "$45/mo" },
        { value: "xfinity-600-5yr", label: "600 Mbps (5-Year Guarantee)", speed: "600 Mbps", price: "$60/mo" },
        { value: "xfinity-1100-1yr", label: "1100 Mbps (1-Year Deal)", speed: "1100 Mbps", price: "$50/mo" },
        { value: "xfinity-1100-5yr", label: "1100 Mbps (5-Year Guarantee)", speed: "1100 Mbps", price: "$65/mo" },
        { value: "xfinity-1300-1yr", label: "1300+ Mbps (1-Year Deal)", speed: "1300+ Mbps", price: "$70/mo" },
        { value: "xfinity-1300-5yr", label: "1300+ Mbps (5-Year Guarantee)", speed: "1300+ Mbps", price: "$85/mo" }
      ],
      "Frontier Fiber": [
        { value: "frontier-fiber-200", label: "Fiber 200", speed: "200/200 Mbps", price: "$29.99/mo" },
        { value: "frontier-fiber-500", label: "Fiber 500", speed: "500/500 Mbps", price: "$39.99/mo" },
        { value: "frontier-fiber-1gig", label: "Fiber 1 Gig", speed: "1000/1000 Mbps", price: "$59.99/mo" },
        { value: "frontier-fiber-2gig", label: "Fiber 2 Gig", speed: "2000/2000 Mbps", price: "$64.99/mo" },
        { value: "frontier-fiber-5gig", label: "Fiber 5 Gig", speed: "5000/5000 Mbps", price: "$99.99/mo" },
        { value: "frontier-fiber-7gig", label: "Fiber 7 Gig", speed: "7000/7000 Mbps", price: "$109.99/mo" }
      ],
      "Frontier Copper": [
        { value: "frontier-copper-basic", label: "DSL Basic", speed: "25 Mbps", price: "$40/mo" },
        { value: "frontier-copper-plus", label: "DSL Plus", speed: "50 Mbps", price: "$55/mo" }
      ],
      "Optimum": [
        { value: "optimum-300", label: "Internet 300", speed: "300 Mbps", price: "$40/mo" },
        { value: "optimum-500", label: "Internet 500", speed: "500 Mbps", price: "$60/mo" },
        { value: "optimum-1gig", label: "Internet 1 Gig", speed: "1 Gbps", price: "$70/mo" }
      ],
      "Metronet": [
        { value: "metronet-500", label: "500 Mb", speed: "500 Mbps", price: "$60/mo" },
        { value: "metronet-1gig", label: "1 Gb", speed: "1 Gbps", price: "$70/mo" },
        { value: "metronet-2gig", label: "2 Gb/1 Gb", speed: "2 Gbps", price: "$80/mo" },
        { value: "metronet-100-student", label: "100 Mb (Student)", speed: "100 Mbps", price: "$29.95/mo" },
        { value: "metronet-1gig-student", label: "1 Gb (Student)", speed: "1 Gbps", price: "$49.95/mo" }
      ],
      "Kinetic": [
        { value: "kinetic-100", label: "Internet 100", speed: "100/100 Mbps", price: "$24.99/mo" },
        { value: "kinetic-300", label: "Internet 300", speed: "300/300 Mbps", price: "$39.99/mo" },
        { value: "kinetic-1gig", label: "Internet 1 Gig", speed: "1 Gbps", price: "$69.99/mo" },
        { value: "kinetic-2gig", label: "Internet 2 Gig", speed: "2 Gbps", price: "$99.99/mo" }
      ],
      "BrightSpeed Fiber": [
        { value: "brightspeed-300", label: "300M", speed: "300 Mbps", price: "$49/mo" },
        { value: "brightspeed-600", label: "600M", speed: "600 Mbps", price: "$49/mo" },
        { value: "brightspeed-1gig", label: "1G", speed: "1 Gbps", price: "$59/mo" },
        { value: "brightspeed-2gig", label: "2G", speed: "2 Gbps", price: "$89/mo" }
      ],
      "BrightSpeed Copper": [
        { value: "brightspeed-copper-25", label: "DSL 25", speed: "25 Mbps", price: "$29.99/mo" },
        { value: "brightspeed-copper-50", label: "DSL 50", speed: "50 Mbps", price: "$39.99/mo" },
        { value: "brightspeed-copper-100", label: "DSL 100", speed: "100 Mbps", price: "$49.99/mo" }
      ],
      "Spectrum": [
        { value: "spectrum-internet", label: "Internet", speed: "300 Mbps", price: "$49.99/mo" },
        { value: "spectrum-internet-ultra", label: "Internet Ultra", speed: "500 Mbps", price: "$69.99/mo" },
        { value: "spectrum-internet-gig", label: "Internet Gig", speed: "1 Gbps", price: "$89.99/mo" }
      ],
      "Altafiber": [
        { value: "altafiber-50", label: "Fioptics 50Mbps", speed: "50/10 Mbps", price: "$45/mo" },
        { value: "altafiber-100", label: "Fioptics 100Mbps", speed: "100/100 Mbps", price: "$40/mo" },
        { value: "altafiber-250", label: "Fioptics 250Mbps", speed: "250/100 Mbps", price: "$40/mo" },
        { value: "altafiber-400", label: "Fioptics 400Mbps", speed: "400/200 Mbps", price: "$40/mo" },
        { value: "altafiber-600", label: "Fioptics 600Mbps", speed: "600/300 Mbps", price: "$50/mo" },
        { value: "altafiber-800", label: "Fioptics 800Mbps", speed: "800/400 Mbps", price: "$70/mo" },
        { value: "altafiber-1gig", label: "Fioptics 1Gb", speed: "1000/500 Mbps", price: "$70/mo" }
      ],
      "EarthLink": [
        { value: "earthlink-fiber-1gig", label: "Fiber 1Gx1G", speed: "1 Gbps", price: "$89.95/mo" },
        { value: "earthlink-wireless-max", label: "Wireless Max", speed: "Up to 375 GB", price: "$79.95/mo" },
        { value: "earthlink-wfh-unlimited", label: "Work From Home Unlimited", speed: "300 GB high-speed", price: "$84.95/mo" }
      ]
    }
    
    return packagesByProvider[selectedProvider] || []
  }

  // Helper function to get packages for any provider without changing state
  const getPackageOptionsForProvider = (provider: string) => {
    const packagesByProvider: { [key: string]: Array<{value: string, label: string, speed: string, price: string}> } = {
      "Xfinity": [
        { value: "xfinity-400-1yr", label: "400 Mbps (1-Year Deal)", speed: "400 Mbps", price: "$40/mo" },
        { value: "xfinity-400-5yr", label: "400 Mbps (5-Year Guarantee)", speed: "400 Mbps", price: "$55/mo" },
        { value: "xfinity-600-1yr", label: "600 Mbps (1-Year Deal)", speed: "600 Mbps", price: "$45/mo" },
        { value: "xfinity-600-5yr", label: "600 Mbps (5-Year Guarantee)", speed: "600 Mbps", price: "$60/mo" },
        { value: "xfinity-1100-1yr", label: "1100 Mbps (1-Year Deal)", speed: "1100 Mbps", price: "$50/mo" },
        { value: "xfinity-1100-5yr", label: "1100 Mbps (5-Year Guarantee)", speed: "1100 Mbps", price: "$65/mo" },
        { value: "xfinity-1300-1yr", label: "1300+ Mbps (1-Year Deal)", speed: "1300+ Mbps", price: "$70/mo" },
        { value: "xfinity-1300-5yr", label: "1300+ Mbps (5-Year Guarantee)", speed: "1300+ Mbps", price: "$85/mo" }
      ],
      "Frontier Fiber": [
        { value: "frontier-fiber-200", label: "Fiber 200", speed: "200/200 Mbps", price: "$29.99/mo" },
        { value: "frontier-fiber-500", label: "Fiber 500", speed: "500/500 Mbps", price: "$39.99/mo" },
        { value: "frontier-fiber-1gig", label: "Fiber 1 Gig", speed: "1000/1000 Mbps", price: "$59.99/mo" },
        { value: "frontier-fiber-2gig", label: "Fiber 2 Gig", speed: "2000/2000 Mbps", price: "$64.99/mo" },
        { value: "frontier-fiber-5gig", label: "Fiber 5 Gig", speed: "5000/5000 Mbps", price: "$99.99/mo" },
        { value: "frontier-fiber-7gig", label: "Fiber 7 Gig", speed: "7000/7000 Mbps", price: "$109.99/mo" }
      ],
      "Frontier Copper": [
        { value: "frontier-copper-basic", label: "DSL Basic", speed: "25 Mbps", price: "$40/mo" },
        { value: "frontier-copper-plus", label: "DSL Plus", speed: "50 Mbps", price: "$55/mo" }
      ],
      "Optimum": [
        { value: "optimum-300", label: "Internet 300", speed: "300 Mbps", price: "$40/mo" },
        { value: "optimum-500", label: "Internet 500", speed: "500 Mbps", price: "$60/mo" },
        { value: "optimum-1gig", label: "Internet 1 Gig", speed: "1 Gbps", price: "$70/mo" }
      ],
      "Metronet": [
        { value: "metronet-500", label: "500 Mb", speed: "500 Mbps", price: "$60/mo" },
        { value: "metronet-1gig", label: "1 Gb", speed: "1 Gbps", price: "$70/mo" },
        { value: "metronet-2gig", label: "2 Gb/1 Gb", speed: "2 Gbps", price: "$80/mo" },
        { value: "metronet-100-student", label: "100 Mb (Student)", speed: "100 Mbps", price: "$29.95/mo" },
        { value: "metronet-1gig-student", label: "1 Gb (Student)", speed: "1 Gbps", price: "$49.95/mo" }
      ],
      "Kinetic": [
        { value: "kinetic-100", label: "Internet 100", speed: "100/100 Mbps", price: "$24.99/mo" },
        { value: "kinetic-300", label: "Internet 300", speed: "300/300 Mbps", price: "$39.99/mo" },
        { value: "kinetic-1gig", label: "Internet 1 Gig", speed: "1 Gbps", price: "$69.99/mo" },
        { value: "kinetic-2gig", label: "Internet 2 Gig", speed: "2 Gbps", price: "$99.99/mo" }
      ],
      "BrightSpeed Fiber": [
        { value: "brightspeed-300", label: "300M", speed: "300 Mbps", price: "$49/mo" },
        { value: "brightspeed-600", label: "600M", speed: "600 Mbps", price: "$49/mo" },
        { value: "brightspeed-1gig", label: "1G", speed: "1 Gbps", price: "$59/mo" },
        { value: "brightspeed-2gig", label: "2G", speed: "2 Gbps", price: "$89/mo" }
      ],
      "BrightSpeed Copper": [
        { value: "brightspeed-copper-25", label: "DSL 25", speed: "25 Mbps", price: "$29.99/mo" },
        { value: "brightspeed-copper-50", label: "DSL 50", speed: "50 Mbps", price: "$39.99/mo" },
        { value: "brightspeed-copper-100", label: "DSL 100", speed: "100 Mbps", price: "$49.99/mo" }
      ],
      "Spectrum": [
        { value: "spectrum-internet", label: "Internet", speed: "300 Mbps", price: "$49.99/mo" },
        { value: "spectrum-internet-ultra", label: "Internet Ultra", speed: "500 Mbps", price: "$69.99/mo" },
        { value: "spectrum-internet-gig", label: "Internet Gig", speed: "1 Gbps", price: "$89.99/mo" }
      ],
      "Altafiber": [
        { value: "altafiber-50", label: "Fioptics 50Mbps", speed: "50/10 Mbps", price: "$45/mo" },
        { value: "altafiber-100", label: "Fioptics 100Mbps", speed: "100/100 Mbps", price: "$40/mo" },
        { value: "altafiber-250", label: "Fioptics 250Mbps", speed: "250/100 Mbps", price: "$40/mo" },
        { value: "altafiber-400", label: "Fioptics 400Mbps", speed: "400/200 Mbps", price: "$40/mo" },
        { value: "altafiber-600", label: "Fioptics 600Mbps", speed: "600/300 Mbps", price: "$50/mo" },
        { value: "altafiber-800", label: "Fioptics 800Mbps", speed: "800/400 Mbps", price: "$70/mo" },
        { value: "altafiber-1gig", label: "Fioptics 1Gb", speed: "1000/500 Mbps", price: "$70/mo" }
      ],
      "EarthLink": [
        { value: "earthlink-fiber-1gig", label: "Fiber 1Gx1G", speed: "1 Gbps", price: "$89.95/mo" },
        { value: "earthlink-wireless-max", label: "Wireless Max", speed: "Up to 375 GB", price: "$79.95/mo" },
        { value: "earthlink-wfh-unlimited", label: "Work From Home Unlimited", speed: "300 GB high-speed", price: "$84.95/mo" }
      ]
    }
    return packagesByProvider[provider] || []
  }

  // Helper function to get promo info for any provider
  const getPromoInfoForProvider = (provider: string) => {
    const promoInfo: { [key: string]: string } = {
      "Xfinity": "5-Year Price Guarantee plans offer long-term price stability. 1-Year Deals provide lower introductory pricing. Gateway rental is free for first 12 months on promotional plans.",
      "BrightSpeed Fiber": "300M includes $20/mo bill credit for 6 months. 600M, 1G, and 2G include 3 months of free service.",
      "Metronet": "Pricing includes 1-year price lock and free installation with ACH autopay enrollment.",
      "Kinetic": "Pricing includes AutoPay discount. Reward Cards available: $100 for 1 Gig, $200 for 2 Gig customers.",
      "Frontier Fiber": "Pricing includes $10 ACH/Debit autopay discount.",
      "Optimum": "Pricing requires autopay & paperless billing.",
      "EarthLink": "Professional installation required. Installation fees vary by partner network."
    }
    return promoInfo[provider] || null
  }

  // Helper function to get add-ons for any provider
  const getAddOnsForProvider = (provider: string) => {
    const addOnsByProvider: { [key: string]: Array<{id: string, label: string, price: string, value: string}> } = {
      "Xfinity": [
        { id: "xfinity-gateway", label: "Xfinity Gateway (Free 1st year, then $15/mo)", price: "Free/12mo", value: "xfinity-gateway" },
        { id: "xfinity-now-tv", label: "NOW TV (125+ channels, 20hr DVR, Peacock)", price: "+$20/mo", value: "xfinity-now-tv" },
        { id: "xfinity-now-tv-latino", label: "NOW TV Latino (100+ channels, 30+ Spanish)", price: "+$10/mo", value: "xfinity-now-tv-latino" },
        { id: "xfinity-streamsaver", label: "StreamSaver™ (Netflix, Apple TV+, Peacock)", price: "+$15/mo", value: "xfinity-streamsaver" },
        { id: "xfinity-now-streamsaver", label: "NOW StreamSaver™ (Combined TV + Streaming)", price: "+$30/mo", value: "xfinity-now-streamsaver" },
        { id: "xfinity-mobile-intro", label: "Mobile Unlimited Intro (Free 1st line/12mo)", price: "+$30/mo", value: "xfinity-mobile-intro" },
        { id: "xfinity-mobile-plus", label: "Mobile Unlimited Plus", price: "+$40/mo", value: "xfinity-mobile-plus" },
        { id: "xfinity-mobile-premium", label: "Mobile Unlimited Premium", price: "+$50/mo", value: "xfinity-mobile-premium" },
        { id: "xfinity-mobile-gig", label: "Mobile By the Gig (1GB)", price: "+$15/mo", value: "xfinity-mobile-gig" }
      ],
      "Frontier Fiber": [
        { id: "frontier-voice", label: "Voice Service", price: "+$25/mo", value: "frontier-voice" },
        { id: "frontier-wifi-security", label: "Wi-Fi Security", price: "+$5/mo", value: "frontier-wifi-security" },
        { id: "frontier-identity-protection", label: "Identity Protection", price: "+$10/mo", value: "frontier-identity-protection" },
        { id: "frontier-tech-pro", label: "My Premium Tech Pro", price: "+$10/mo", value: "frontier-tech-pro" }
      ],
      "Spectrum": [
        { id: "spectrum-router", label: "Wi-Fi Router", price: "+$5/mo", value: "spectrum-router" },
        { id: "spectrum-security-suite", label: "Spectrum Security Suite", price: "+$9.99/mo", value: "spectrum-security-suite" },
        { id: "spectrum-tv-select", label: "TV Select (125+ channels)", price: "+$49.99/mo", value: "spectrum-tv-select" },
        { id: "spectrum-tv-silver", label: "TV Silver (175+ channels)", price: "+$74.99/mo", value: "spectrum-tv-silver" },
        { id: "spectrum-tv-gold", label: "TV Gold (200+ channels)", price: "+$94.99/mo", value: "spectrum-tv-gold" },
        { id: "spectrum-voice", label: "Voice Unlimited", price: "+$29.99/mo", value: "spectrum-voice" }
      ],
      "Metronet": [
        { id: "metronet-wholehome-wifi", label: "WholeHome WiFi + 1-Yr Price Lock", price: "+$5/mo", value: "metronet-wholehome-wifi" },
        { id: "metronet-eero-plus", label: "eero Plus", price: "+$10/mo", value: "metronet-eero-plus" },
        { id: "metronet-unlimited-phone", label: "Unlimited Phone + 1-Yr Price Lock", price: "+$15/mo", value: "metronet-unlimited-phone" },
        { id: "metronet-student-wholehome", label: "WholeHome WiFi (Student)", price: "+$9.95/mo", value: "metronet-student-wholehome" },
        { id: "metronet-student-phone", label: "Home Phone (Student)", price: "+$20/mo", value: "metronet-student-phone" }
      ],
      "BrightSpeed Fiber": [
        { id: "brightspeed-digital-voice", label: "Digital Voice", price: "+$30/mo", value: "brightspeed-digital-voice" },
        { id: "brightspeed-wifi-pro", label: "WiFi Pro", price: "+$10/mo", value: "brightspeed-wifi-pro" },
        { id: "brightspeed-tech-support", label: "Premium Tech Support", price: "+$9.99/mo", value: "brightspeed-tech-support" }
      ],
      "BrightSpeed Copper": [
        { id: "brightspeed-copper-voice", label: "Digital Voice", price: "+$30/mo", value: "brightspeed-copper-voice" },
        { id: "brightspeed-copper-wifi", label: "WiFi Pro", price: "+$10/mo", value: "brightspeed-copper-wifi" },
        { id: "brightspeed-copper-support", label: "Premium Tech Support", price: "+$9.99/mo", value: "brightspeed-copper-support" }
      ],
      "Optimum": [
        { id: "optimum-entertainment-tv", label: "Entertainment TV (80+ channels)", price: "+$25/mo", value: "optimum-entertainment-tv" },
        { id: "optimum-extra-tv", label: "Extra TV (125+ channels)", price: "+$80/mo", value: "optimum-extra-tv" },
        { id: "optimum-everything-tv", label: "Everything TV (200+ channels)", price: "+$135/mo", value: "optimum-everything-tv" },
        { id: "optimum-mobile-1gb", label: "Mobile 1GB", price: "+$15/mo", value: "optimum-mobile-1gb" },
        { id: "optimum-mobile-5gb", label: "Mobile 5GB", price: "+$25/mo", value: "optimum-mobile-5gb" },
        { id: "optimum-mobile-unlimited", label: "Mobile Unlimited", price: "+$45/mo", value: "optimum-mobile-unlimited" },
        { id: "optimum-mobile-unlimited-max", label: "Mobile Unlimited Max", price: "+$55/mo", value: "optimum-mobile-unlimited-max" }
      ],
      "Kinetic": [
        { id: "kinetic-home-phone", label: "Home Phone (VoIP)", price: "+$25/mo", value: "kinetic-home-phone" },
        { id: "kinetic-secure", label: "Kinetic Secure", price: "+$14.99/mo", value: "kinetic-secure" },
        { id: "kinetic-secure-home-plus", label: "Kinetic Secure Home Plus", price: "+$10/mo", value: "kinetic-secure-home-plus" }
      ],
      "Altafiber": [
        { id: "altafiber-voice", label: "Digital Voice Service", price: "+$25/mo", value: "altafiber-voice" },
        { id: "altafiber-wifi-plus", label: "WiFi Plus (Enhanced Router)", price: "+$10/mo", value: "altafiber-wifi-plus" },
        { id: "altafiber-security", label: "Internet Security Suite", price: "+$9.99/mo", value: "altafiber-security" },
        { id: "altafiber-tech-support", label: "Premium Tech Support", price: "+$14.99/mo", value: "altafiber-tech-support" }
      ],
      "EarthLink": [
        { id: "earthlink-gateway", label: "Wireless Gateway (Required)", price: "+$12.95/mo", value: "earthlink-gateway" },
        { id: "earthlink-easytech", label: "EasyTech Remote Support", price: "+$9.95/mo", value: "earthlink-easytech" },
        { id: "earthlink-protect-plus", label: "Protect+ Essential (Norton 360 + LifeLock)", price: "+$9.95/mo", value: "earthlink-protect-plus" }
      ]
    }
    
    // Default add-ons for providers without specific ones
    const defaultAddOns = [
      { id: "wifi-router", label: "Wi-Fi Router Rental", price: "+$10/mo", value: "wifi-router" },
      { id: "security-suite", label: "Internet Security Suite", price: "+$9.99/mo", value: "security-suite" },
      { id: "tech-support", label: "Premium Tech Support", price: "+$14.99/mo", value: "tech-support" },
      { id: "static-ip", label: "Static IP Address", price: "+$15/mo", value: "static-ip" },
      { id: "unlimited-data", label: "Unlimited Data", price: "+$30/mo", value: "unlimited-data" },
      { id: "mesh-network", label: "Mesh Network System", price: "+$25/mo", value: "mesh-network" }
    ]
    
    return addOnsByProvider[provider] || defaultAddOns
  }

  // Get promotional info for selected provider
  const getProviderPromoInfo = () => {
    const promoInfo: { [key: string]: string } = {
      "Xfinity": "5-Year Price Guarantee plans offer long-term price stability. 1-Year Deals provide lower introductory pricing. Gateway rental is free for first 12 months on promotional plans.",
      "BrightSpeed Fiber": "300M includes $20/mo bill credit for 6 months. 600M, 1G, and 2G include 3 months of free service.",
      "Metronet": "Pricing includes 1-year price lock and free installation with ACH autopay enrollment.",
      "Kinetic": "Pricing includes AutoPay discount. Reward Cards available: $100 for 1 Gig, $200 for 2 Gig customers.",
      "Frontier Fiber": "Pricing includes $10 ACH/Debit autopay discount.",
      "Optimum": "Pricing requires autopay & paperless billing.",
      "EarthLink": "Professional installation required. Installation fees vary by partner network."
    }
    return promoInfo[selectedProvider] || null
  }
  const getProviderAddOns = () => {
    if (!selectedProvider) return []
    
    const addOnsByProvider: { [key: string]: Array<{id: string, label: string, price: string, value: string}> } = {
      "Xfinity": [
        { id: "xfinity-gateway", label: "Xfinity Gateway (Free 1st year, then $15/mo)", price: "Free/12mo", value: "xfinity-gateway" },
        { id: "xfinity-now-tv", label: "NOW TV (125+ channels, 20hr DVR, Peacock)", price: "+$20/mo", value: "xfinity-now-tv" },
        { id: "xfinity-now-tv-latino", label: "NOW TV Latino (100+ channels, 30+ Spanish)", price: "+$10/mo", value: "xfinity-now-tv-latino" },
        { id: "xfinity-streamsaver", label: "StreamSaver™ (Netflix, Apple TV+, Peacock)", price: "+$15/mo", value: "xfinity-streamsaver" },
        { id: "xfinity-now-streamsaver", label: "NOW StreamSaver™ (Combined TV + Streaming)", price: "+$30/mo", value: "xfinity-now-streamsaver" },
        { id: "xfinity-mobile-intro", label: "Mobile Unlimited Intro (Free 1st line/12mo)", price: "+$30/mo", value: "xfinity-mobile-intro" },
        { id: "xfinity-mobile-plus", label: "Mobile Unlimited Plus", price: "+$40/mo", value: "xfinity-mobile-plus" },
        { id: "xfinity-mobile-premium", label: "Mobile Unlimited Premium", price: "+$50/mo", value: "xfinity-mobile-premium" },
        { id: "xfinity-mobile-gig", label: "Mobile By the Gig (1GB)", price: "+$15/mo", value: "xfinity-mobile-gig" }
      ],
      "Frontier Fiber": [
        { id: "frontier-voice", label: "Voice Service", price: "+$25/mo", value: "frontier-voice" },
        { id: "frontier-wifi-security", label: "Wi-Fi Security", price: "+$5/mo", value: "frontier-wifi-security" },
        { id: "frontier-identity-protection", label: "Identity Protection", price: "+$10/mo", value: "frontier-identity-protection" },
        { id: "frontier-tech-pro", label: "My Premium Tech Pro", price: "+$10/mo", value: "frontier-tech-pro" }
      ],
      "Spectrum": [
        { id: "spectrum-router", label: "Wi-Fi Router", price: "+$5/mo", value: "spectrum-router" },
        { id: "spectrum-security-suite", label: "Spectrum Security Suite", price: "+$9.99/mo", value: "spectrum-security-suite" },
        { id: "spectrum-tv-select", label: "TV Select (125+ channels)", price: "+$49.99/mo", value: "spectrum-tv-select" },
        { id: "spectrum-tv-silver", label: "TV Silver (175+ channels)", price: "+$74.99/mo", value: "spectrum-tv-silver" },
        { id: "spectrum-tv-gold", label: "TV Gold (200+ channels)", price: "+$94.99/mo", value: "spectrum-tv-gold" },
        { id: "spectrum-voice", label: "Voice Unlimited", price: "+$29.99/mo", value: "spectrum-voice" }
      ],
      "Metronet": [
        { id: "metronet-wholehome-wifi", label: "WholeHome WiFi + 1-Yr Price Lock", price: "+$5/mo", value: "metronet-wholehome-wifi" },
        { id: "metronet-eero-plus", label: "eero Plus", price: "+$10/mo", value: "metronet-eero-plus" },
        { id: "metronet-unlimited-phone", label: "Unlimited Phone + 1-Yr Price Lock", price: "+$15/mo", value: "metronet-unlimited-phone" },
        { id: "metronet-student-wholehome", label: "WholeHome WiFi (Student)", price: "+$9.95/mo", value: "metronet-student-wholehome" },
        { id: "metronet-student-phone", label: "Home Phone (Student)", price: "+$20/mo", value: "metronet-student-phone" }
      ],
      "BrightSpeed Fiber": [
        { id: "brightspeed-digital-voice", label: "Digital Voice", price: "+$30/mo", value: "brightspeed-digital-voice" },
        { id: "brightspeed-wifi-pro", label: "WiFi Pro", price: "+$10/mo", value: "brightspeed-wifi-pro" },
        { id: "brightspeed-tech-support", label: "Premium Tech Support", price: "+$9.99/mo", value: "brightspeed-tech-support" }
      ],
      "BrightSpeed Copper": [
        { id: "brightspeed-copper-voice", label: "Digital Voice", price: "+$30/mo", value: "brightspeed-copper-voice" },
        { id: "brightspeed-copper-wifi", label: "WiFi Pro", price: "+$10/mo", value: "brightspeed-copper-wifi" },
        { id: "brightspeed-copper-support", label: "Premium Tech Support", price: "+$9.99/mo", value: "brightspeed-copper-support" }
      ],
      "Optimum": [
        { id: "optimum-entertainment-tv", label: "Entertainment TV (80+ channels)", price: "+$25/mo", value: "optimum-entertainment-tv" },
        { id: "optimum-extra-tv", label: "Extra TV (125+ channels)", price: "+$80/mo", value: "optimum-extra-tv" },
        { id: "optimum-everything-tv", label: "Everything TV (200+ channels)", price: "+$135/mo", value: "optimum-everything-tv" },
        { id: "optimum-mobile-1gb", label: "Mobile 1GB", price: "+$15/mo", value: "optimum-mobile-1gb" },
        { id: "optimum-mobile-5gb", label: "Mobile 5GB", price: "+$25/mo", value: "optimum-mobile-5gb" },
        { id: "optimum-mobile-unlimited", label: "Mobile Unlimited", price: "+$45/mo", value: "optimum-mobile-unlimited" },
        { id: "optimum-mobile-unlimited-max", label: "Mobile Unlimited Max", price: "+$55/mo", value: "optimum-mobile-unlimited-max" }
      ],
      "Kinetic": [
        { id: "kinetic-home-phone", label: "Home Phone (VoIP)", price: "+$25/mo", value: "kinetic-home-phone" },
        { id: "kinetic-secure", label: "Kinetic Secure", price: "+$14.99/mo", value: "kinetic-secure" },
        { id: "kinetic-secure-home-plus", label: "Kinetic Secure Home Plus", price: "+$10/mo", value: "kinetic-secure-home-plus" }
      ],
      "Altafiber": [
        { id: "altafiber-voice", label: "Digital Voice Service", price: "+$25/mo", value: "altafiber-voice" },
        { id: "altafiber-wifi-plus", label: "WiFi Plus (Enhanced Router)", price: "+$10/mo", value: "altafiber-wifi-plus" },
        { id: "altafiber-security", label: "Internet Security Suite", price: "+$9.99/mo", value: "altafiber-security" },
        { id: "altafiber-tech-support", label: "Premium Tech Support", price: "+$14.99/mo", value: "altafiber-tech-support" }
      ],
      "EarthLink": [
        { id: "earthlink-gateway", label: "Wireless Gateway (Required)", price: "+$12.95/mo", value: "earthlink-gateway" },
        { id: "earthlink-easytech", label: "EasyTech Remote Support", price: "+$9.95/mo", value: "earthlink-easytech" },
        { id: "earthlink-protect-plus", label: "Protect+ Essential (Norton 360 + LifeLock)", price: "+$9.95/mo", value: "earthlink-protect-plus" }
      ]
    }
    
    // Default add-ons for providers without specific ones
    const defaultAddOns = [
      { id: "wifi-router", label: "Wi-Fi Router Rental", price: "+$10/mo", value: "wifi-router" },
      { id: "security-suite", label: "Internet Security Suite", price: "+$9.99/mo", value: "security-suite" },
      { id: "tech-support", label: "Premium Tech Support", price: "+$14.99/mo", value: "tech-support" },
      { id: "static-ip", label: "Static IP Address", price: "+$15/mo", value: "static-ip" },
      { id: "unlimited-data", label: "Unlimited Data", price: "+$30/mo", value: "unlimited-data" },
      { id: "mesh-network", label: "Mesh Network System", price: "+$25/mo", value: "mesh-network" }
    ]
    
    return addOnsByProvider[selectedProvider] || defaultAddOns
  }

  const getDirectvPackageDetails = (packageType: string) => {
    const directvPackages: { [key: string]: { label: string, priceWithDevice: string, priceWithoutDevice: string, channels: string } } = {
      "entertainment": { label: "ENTERTAINMENT", priceWithDevice: "$94.99/mo", priceWithoutDevice: "$84.99/mo", channels: "85+ channels" },
      "choice": { label: "CHOICE", priceWithDevice: "$117.98/mo", priceWithoutDevice: "$107.98/mo", channels: "125+ channels" },
      "ultimate": { label: "ULTIMATE", priceWithDevice: "$147.98/mo", priceWithoutDevice: "$137.98/mo", channels: "160+ channels" },
      "premier": { label: "PREMIER", priceWithDevice: "$192.98/mo", priceWithoutDevice: "$182.98/mo", channels: "185+ channels" }
    }
    return directvPackages[packageType] || null
  }

  const handleAddOnChange = (addOn: string, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOn])
    } else {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== addOn))
    }
  }

  const handleProviderChange = (provider: string) => {
    if (selectedProvider === provider) {
      // If clicking the same provider again, show pricing modal
      setModalProvider(provider)
      setShowPricingModal(true)
    } else {
      // If selecting a new provider
      setSelectedProvider(provider)
      setSelectedPackage("") // Reset package when provider changes
      setShowProviderDetails(true)
      
      // Only clear force selection if this is not the same provider
      if (forceSelectedProvider !== provider) {
        setForceSelectedProvider(null)
      }
      
      // Clear add-ons if DirecTV is selected since they don't apply
      if (provider === "DirecTV") {
        setSelectedAddOns([])
      }
    }
  }

  // Force provider selection handler
  const handleForceProviderSelect = (providerName: string) => {
    setSelectedProvider(providerName)
    setForceSelectedProvider(providerName)
    // Clear any existing package selection when forcing a new provider
    setSelectedPackage("")
    setSelectedDirectvPackage("")
    setSelectedAddOns([])
    
    // Create a minimal zip result if none exists
    if (!zipResult) {
      setZipResult({
        zipCode: "MANUAL",
        city: "Manual Selection",
        state: "N/A",
        providers: [providerName],
        debugInfo: { [providerName]: 1 }
      })
    } else {
      // Add the forced provider to existing results if not already present
      const updatedProviders = zipResult.providers.includes(providerName) 
        ? zipResult.providers 
        : [...zipResult.providers, providerName]
      
      setZipResult({
        ...zipResult,
        providers: updatedProviders,
        debugInfo: { ...zipResult.debugInfo, [providerName]: 1 }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!selectedProvider || !selectedPackage) {
      alert("Please select a provider and package before submitting.")
      return
    }

    if (!zipResult) {
      alert("Please enter a valid ZIP code first.")
      return
    }

    // Validate age requirement
    if (formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18) {
      alert("Customer must be at least 18 years old to place an order.")
      return
    }

    // Collect all form data
    const submissionData = {
      // Agent Information
      agentName: formData.agentName,
      agentId: formData.agentId,
      
      // Customer Information
      customerName: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      ssn: formData.ssn,
      
      // Service Address
      streetAddress: formData.streetAddress,
      aptUnit: formData.aptUnit,
      city: formData.city || zipResult?.city || '',
      state: formData.state || zipResult?.state || '',
      zipCode: formData.zipCode || zipResult?.zipCode || '',
      
      // Previous Address (if moved)
      movedLastYear,
      prevStreetAddress: movedLastYear ? formData.prevStreetAddress : '',
      prevAptUnit: movedLastYear ? formData.prevAptUnit : '',
      prevCity: movedLastYear ? formData.prevCity : '',
      prevState: movedLastYear ? formData.prevState : '',
      prevZipCode: movedLastYear ? formData.prevZipCode : '',
      
      // Service Information
      selectedProvider,
      selectedPackage,
      selectedDirectvPackage,
      selectedAddOns,
    }

    try {
      const result = await submitForm(submissionData)
      
      if (result.success) {
        // Reset form on successful submission
        setFormData({
          agentName: '',
          agentId: '',
          customerName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          ssn: '',
          streetAddress: '',
          aptUnit: '',
          city: '',
          state: '',
          zipCode: '',
          prevStreetAddress: '',
          prevAptUnit: '',
          prevCity: '',
          prevState: '',
          prevZipCode: '',
        })
        setSelectedProvider('')
        setSelectedPackage('')
        setSelectedDirectvPackage('')
        setSelectedAddOns([])
        setMovedLastYear(false)
        setZipResult(null)
        setShowProviderDetails(false)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const getProviderColor = (provider: string) => {
    const colors: { [key: string]: string } = {
      "Xfinity": "bg-red-100 border-red-300 text-red-800",
      "Frontier Fiber": "bg-blue-100 border-blue-300 text-blue-800", 
      "Frontier Copper": "bg-orange-100 border-orange-300 text-orange-800",
      "Optimum": "bg-green-100 border-green-300 text-green-800",
      "Metronet": "bg-purple-100 border-purple-300 text-purple-800",
      "Kinetic": "bg-indigo-100 border-indigo-300 text-indigo-800",
      "BrightSpeed Fiber": "bg-cyan-100 border-cyan-300 text-cyan-800",
      "BrightSpeed Copper": "bg-amber-100 border-amber-300 text-amber-800",
      "Spectrum": "bg-slate-100 border-slate-300 text-slate-800",
      "Altafiber": "bg-emerald-100 border-emerald-300 text-emerald-800",
      "EarthLink": "bg-gray-100 border-gray-300 text-gray-800",
      "DirecTV": "bg-yellow-100 border-yellow-300 text-yellow-800"
    }
    return colors[provider.split(' (')[0]] || "bg-gray-100 border-gray-300 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Internet Service Order</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete this form to set up new internet service for your customer. All required fields are marked with an
            asterisk (*).
          </p>
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              Secure Order Processing
            </Badge>
          </div>
        </div>

        {/* ZIP Code Checker */}
        <ZipCodeSection onZipResult={setZipResult} onForceProviderSelect={handleForceProviderSelect} />

        {/* Service Area Information */}
        {zipResult && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Service Available in {zipResult.city}, {zipResult.state}
                  </h3>
                  <p className="text-green-700">
                    {zipResult.providers.length} provider{zipResult.providers.length !== 1 ? 's' : ''} available in ZIP code {zipResult.zipCode}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {zipResult.providers.map((provider, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProvider === provider.split(' (')[0]
                        ? 'ring-2 ring-blue-500 border-blue-300'
                        : 'hover:border-gray-400'
                    } ${getProviderColor(provider)}`}
                    onClick={() => handleProviderChange(provider.split(' (')[0])}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider}</span>
                        {forceSelectedProvider === provider.split(' (')[0] && (
                          <div className="flex items-center gap-1">
                            <Settings className="w-3 h-3 text-orange-600" />
                            <span className="text-xs text-orange-600 font-medium">Forced</span>
                          </div>
                        )}
                      </div>
                      {selectedProvider === provider.split(' (')[0] && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Agent Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="w-6 h-6" />
                Agent Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="agent-name" className="text-sm font-semibold text-gray-700">
                    Agent Name *
                  </Label>
                  <Input
                    id="agent-name"
                    placeholder="Enter your full name"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    value={formData.agentName}
                    onChange={(e) => updateFormData('agentName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="agent-id" className="text-sm font-semibold text-gray-700">
                    Agent ID Number *
                  </Label>
                  <Input
                    id="agent-id"
                    placeholder="Enter your agent ID"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    value={formData.agentId}
                    onChange={(e) => updateFormData('agentId', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="w-6 h-6" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="customer-name" className="text-sm font-semibold text-gray-700">
                    Customer Name *
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="Enter customer's full name"
                    className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                    value={formData.customerName}
                    onChange={(e) => updateFormData('customerName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">
                    Date of Birth * (Must be 18 or older)
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className={`h-12 border-2 transition-colors ${
                      formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                    value={formData.dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    required
                  />
                  {formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      You must be at least 18 years old to place an order
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ssn" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Social Security Number *
                </Label>
                <Input
                  id="ssn"
                  type="text"
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors max-w-md"
                  value={formData.ssn}
                  onChange={handleSSNChange}
                  required
                />
                <p className="text-xs text-gray-500">This information is encrypted and secure</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Service Address *
                </Label>
                {zipResult && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Service location: {zipResult.city}, {zipResult.state} {zipResult.zipCode}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="street-address" className="text-sm font-semibold text-gray-700">
                      Street Address *
                    </Label>
                    <Input
                      id="street-address"
                      placeholder="123 Main Street"
                      className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                      value={formData.streetAddress}
                      onChange={(e) => updateFormData('streetAddress', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="apt-unit" className="text-sm font-semibold text-gray-700">
                      Apt/Unit Number (Optional)
                    </Label>
                    <Input
                      id="apt-unit"
                      placeholder="Apt 4B, Unit 205, etc."
                      className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                      value={formData.aptUnit}
                      onChange={(e) => updateFormData('aptUnit', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                        City *
                      </Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city || zipResult?.city || ""}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                        State *
                      </Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={formData.state || zipResult?.state || ""}
                        onChange={(e) => updateFormData('state', e.target.value)}
                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="zip-code" className="text-sm font-semibold text-gray-700">
                        ZIP Code *
                      </Label>
                      <Input
                        id="zip-code"
                        placeholder="12345"
                        value={formData.zipCode || zipResult?.zipCode || ""}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="moved-last-year"
                    checked={movedLastYear}
                    onCheckedChange={(checked) => setMovedLastYear(checked as boolean)}
                    className="border-2"
                  />
                  <Label htmlFor="moved-last-year" className="text-sm font-medium text-gray-700">
                    Customer moved within the last year
                  </Label>
                </div>
              </div>

              {movedLastYear && (
                <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Previous Address *
                  </Label>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="prev-street-address" className="text-sm font-semibold text-gray-700">
                        Street Address *
                      </Label>
                      <Input
                        id="prev-street-address"
                        placeholder="123 Previous Street"
                        className="h-12 border-2 border-gray-200 focus:border-yellow-500 transition-colors"
                        value={formData.prevStreetAddress}
                        onChange={(e) => updateFormData('prevStreetAddress', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="prev-apt-unit" className="text-sm font-semibold text-gray-700">
                        Apt/Unit Number (Optional)
                      </Label>
                      <Input
                        id="prev-apt-unit"
                        placeholder="Apt 4B, Unit 205, etc."
                        className="h-12 border-2 border-gray-200 focus:border-yellow-500 transition-colors"
                        value={formData.prevAptUnit}
                        onChange={(e) => updateFormData('prevAptUnit', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="prev-city" className="text-sm font-semibold text-gray-700">
                          City *
                        </Label>
                        <Input
                          id="prev-city"
                          placeholder="City"
                          className="h-12 border-2 border-gray-200 focus:border-yellow-500 transition-colors"
                          value={formData.prevCity}
                          onChange={(e) => updateFormData('prevCity', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="prev-state" className="text-sm font-semibold text-gray-700">
                          State *
                        </Label>
                        <Input
                          id="prev-state"
                          placeholder="State"
                          className="h-12 border-2 border-gray-200 focus:border-yellow-500 transition-colors"
                          value={formData.prevState}
                          onChange={(e) => updateFormData('prevState', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="prev-zip-code" className="text-sm font-semibold text-gray-700">
                          ZIP Code *
                        </Label>
                        <Input
                          id="prev-zip-code"
                          placeholder="12345"
                          className="h-12 border-2 border-gray-200 focus:border-yellow-500 transition-colors"
                          value={formData.prevZipCode}
                          onChange={(e) => updateFormData('prevZipCode', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Selection - Only show if ZIP code checked */}
          {zipResult && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Wifi className="w-6 h-6" />
                  Service Selection
                  <Badge variant="secondary" className="ml-auto">
                    {zipResult.providers.length} Providers Available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {!selectedProvider && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a service provider above to see available packages.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedProvider && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Selected Provider: {selectedProvider}</span>
                      </div>
                      {selectedDirectvPackage && selectedDirectvPackage !== "none" && (
                        <div className="flex items-center gap-2 text-blue-800 mt-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            DirecTV {getDirectvPackageDetails(selectedDirectvPackage)?.label} 
                            {directvWithDevice ? " (with device)" : " (app only)"} added
                          </span>
                        </div>
                      )}
                      {getProviderPromoInfo() && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2 text-blue-800">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{getProviderPromoInfo()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="internet-package" className="text-sm font-semibold text-gray-700">
                        Internet Package *
                      </Label>
                      <Select 
                        value={selectedPackage} 
                        onValueChange={setSelectedPackage}
                        required
                      >
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
                          <SelectValue placeholder="Select internet package" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPackageOptions().map((pkg) => (
                            <SelectItem key={pkg.value} value={pkg.value}>
                              <div className="flex justify-between items-center w-full">
                                <div className="flex flex-col">
                                  <span className="font-medium">{pkg.label}</span>
                                  <span className="text-sm text-gray-500">{pkg.speed}</span>
                                </div>
                                <Badge variant="outline" className="ml-4">{pkg.price}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* DirecTV TV Service */}
                    <div className="space-y-3">
                      <Label htmlFor="directv-package" className="text-sm font-semibold text-gray-700">
                        DirecTV Package (Optional)
                      </Label>
                      <Select value={selectedDirectvPackage} onValueChange={setSelectedDirectvPackage}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
                          <SelectValue placeholder="Add DirecTV to your order (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No DirecTV Service</SelectItem>
                          <SelectItem value="entertainment">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">ENTERTAINMENT</span>
                                <span className="text-sm text-gray-500">85+ channels</span>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {directvWithDevice ? "$94.99/mo" : "$84.99/mo"}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="choice">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">CHOICE</span>
                                <span className="text-sm text-gray-500">125+ channels</span>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {directvWithDevice ? "$117.98/mo" : "$107.98/mo"}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="ultimate">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">ULTIMATE</span>
                                <span className="text-sm text-gray-500">160+ channels</span>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {directvWithDevice ? "$147.98/mo" : "$137.98/mo"}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="premier">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">PREMIER</span>
                                <span className="text-sm text-gray-500">185+ channels</span>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {directvWithDevice ? "$192.98/mo" : "$182.98/mo"}
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {selectedDirectvPackage && selectedDirectvPackage !== "none" && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">
                              DirecTV Device Option
                            </Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id="directv-with-device"
                                  checked={directvWithDevice}
                                  onCheckedChange={(checked) => setDirectvWithDevice(checked as boolean)}
                                  className="border-2"
                                />
                                <Label htmlFor="directv-with-device" className="text-sm font-medium">
                                  Include Gemini streaming device (+$10/mo)
                                </Label>
                              </div>
                              <p className="text-xs text-gray-600 ml-6">
                                {directvWithDevice 
                                  ? "Monthly price includes Gemini device rental" 
                                  : "Use DIRECTV app on your own device - $10/mo savings"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        DirecTV can be bundled with any internet package for additional savings
                      </p>
                    </div>

                    {/* Add-Ons - Only show for non-DirecTV providers */}
                    {selectedProvider !== "DirecTV" && (
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Add-Ons (Select all that apply)
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getProviderAddOns().map((addOn) => (
                            <div
                              key={addOn.id}
                              className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                            >
                              <Checkbox
                                id={addOn.id}
                                checked={selectedAddOns.includes(addOn.value)}
                                onCheckedChange={(checked) => handleAddOnChange(addOn.value, checked as boolean)}
                                className="border-2"
                              />
                              <div className="flex-1">
                                <Label htmlFor={addOn.id} className="text-sm font-medium cursor-pointer">
                                  {addOn.label}
                                </Label>
                                <div className="text-xs text-gray-500">{addOn.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Installation Preferences - Only show if provider and package selected */}
          {selectedProvider && selectedPackage && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calendar className="w-6 h-6" />
                  Installation Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="install-date" className="text-sm font-semibold text-gray-700">
                      Preferred Installation Date *
                    </Label>
                    <Input
                      id="install-date"
                      type="date"
                      className="h-12 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="install-time" className="text-sm font-semibold text-gray-700">
                      Preferred Time Window *
                    </Label>
                    <Select required>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-500">
                        <SelectValue placeholder="Select time window" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8am-12pm">8:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12pm-4pm">12:00 PM - 4:00 PM</SelectItem>
                        <SelectItem value="4pm-8pm">4:00 PM - 8:00 PM</SelectItem>
                        <SelectItem value="flexible">Flexible (Any time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="special-instructions" className="text-sm font-semibold text-gray-700">
                    Special Installation Instructions
                  </Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Any special requirements, access instructions, or notes for the technician..."
                    className="border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Optional: Include any specific requirements or access information
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          {selectedProvider && selectedPackage && (
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
                  <CheckCircle className="w-6 h-6" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {/* Provider and base price */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Provider:</span>
                    <span>{selectedProvider}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Package:</span>
                    <span>{getPackageOptions().find(pkg => pkg.value === selectedPackage)?.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Speed:</span>
                    <span>{getPackageOptions().find(pkg => pkg.value === selectedPackage)?.speed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Base Price:</span>
                    <span className="font-semibold text-green-600">
                      {getPackageOptions().find(pkg => pkg.value === selectedPackage)?.price}
                    </span>
                  </div>

                  {/* DirecTV summary */}
                  {selectedDirectvPackage && selectedDirectvPackage !== "none" && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">DirecTV Package:</span>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          {directvWithDevice
                            ? getDirectvPackageDetails(selectedDirectvPackage)?.priceWithDevice
                            : getDirectvPackageDetails(selectedDirectvPackage)?.priceWithoutDevice}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getDirectvPackageDetails(selectedDirectvPackage)?.label}
                          {directvWithDevice ? " (with device)" : " (app only)"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VAS Add-ons summary with label and price - Only for non-DirecTV providers */}
                  {selectedAddOns.length > 0 && selectedProvider !== "DirecTV" && (
                    <div className="pt-3 border-t">
                      <span className="font-medium">Add-ons:</span>
                      <ul className="mt-2 space-y-1">
                        {selectedAddOns.map((addOn) => {
                          // Find add-on details from provider add-ons
                          const addOnDetails = getProviderAddOns().find(a => a.value === addOn)
                          return (
                            <li key={addOn} className="text-sm text-gray-600 ml-4">
                              • {addOnDetails ? `${addOnDetails.label} (${addOnDetails.price})` : addOn}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Ready to Submit Order</h3>
            <p className="text-gray-600">Please review all information before submitting the order.</p>
            
            {/* Submission Result */}
            {submissionResult && (
              <Alert className={submissionResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {submissionResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={submissionResult.success ? "text-green-700" : "text-red-700"}>
                  {submissionResult.message}
                </AlertDescription>
              </Alert>
            )}
            
            {!submissionResult && (
              <>
                {!zipResult && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please check ZIP code availability first.
                    </AlertDescription>
                  </Alert>
                )}
                
                {zipResult && !selectedProvider && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a service provider.
                    </AlertDescription>
                  </Alert>
                )}
                
                {selectedProvider && !selectedPackage && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please select an internet package.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="flex gap-4 justify-center">
              {submissionResult && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={resetSubmission}
                  className="px-8 py-4"
                >
                  Submit Another Order
                </Button>
              )}
              
              {!submissionResult && (
                <Button
                  type="submit"
                  size="lg"
                  disabled={!zipResult || !selectedProvider || !selectedPackage || isSubmitting}
                  className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Order"
                  )}
                </Button>
              )}
            </div>
            
            {!submissionResult && (
              <p className="text-xs text-gray-500 mt-2">
                By submitting this form, you confirm that all information is accurate and complete.
              </p>
            )}
          </div>
        </form>

        {/* Pricing Modal */}
        <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <Wifi className="w-6 h-6" />
                {modalProvider} - Pricing Overview
              </DialogTitle>
            </DialogHeader>
            
            {modalProvider && (
              <div className="space-y-6">
                {modalProvider === "DirecTV" ? (
                  /* DirecTV-specific modal content */
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">DirecTV Packages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { type: "entertainment", label: "ENTERTAINMENT", channels: "85+ channels", withDevice: "$94.99/mo", withoutDevice: "$84.99/mo" },
                          { type: "choice", label: "CHOICE", channels: "125+ channels", withDevice: "$117.98/mo", withoutDevice: "$107.98/mo" },
                          { type: "ultimate", label: "ULTIMATE", channels: "160+ channels", withDevice: "$147.98/mo", withoutDevice: "$137.98/mo" },
                          { type: "premier", label: "PREMIER", channels: "185+ channels", withDevice: "$192.98/mo", withoutDevice: "$182.98/mo" }
                        ].map((pkg) => (
                          <div key={pkg.type} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                            <div className="font-semibold text-lg text-gray-900">{pkg.label}</div>
                            <div className="text-sm text-gray-600 mb-3">{pkg.channels}</div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-white rounded border">
                                <span className="text-sm font-medium">With Gemini Device</span>
                                <Badge variant="default" className="bg-blue-600">{pkg.withDevice}</Badge>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-white rounded border">
                                <span className="text-sm font-medium">App Only</span>
                                <Badge variant="outline" className="border-green-500 text-green-700">{pkg.withoutDevice}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2 text-blue-800">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">Device Options:</p>
                          <p className="mb-2"><strong>With Gemini Device:</strong> Includes the DirecTV Gemini streaming device for enhanced features and functionality.</p>
                          <p><strong>App Only:</strong> Use the DIRECTV app on your own streaming device - save $10/month.</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Regular provider modal content */
                  <>
                    {/* Internet Packages */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Internet Packages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getPackageOptionsForProvider(modalProvider).map((pkg) => (
                          <div key={pkg.value} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{pkg.label}</div>
                                <div className="text-sm text-gray-600">{pkg.speed}</div>
                              </div>
                              <Badge variant="outline">{pkg.price}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promotional Info */}
                    {getPromoInfoForProvider(modalProvider) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Promotional Information</h3>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2 text-blue-800">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{getPromoInfoForProvider(modalProvider)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add-Ons */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Available Add-Ons</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getAddOnsForProvider(modalProvider).map((addOn) => (
                          <div key={addOn.id} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-sm">{addOn.label}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">{addOn.price}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DirecTV Options */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">DirecTV Packages (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { type: "entertainment", label: "ENTERTAINMENT", channels: "85+ channels", withDevice: "$94.99/mo", withoutDevice: "$84.99/mo" },
                          { type: "choice", label: "CHOICE", channels: "125+ channels", withDevice: "$117.98/mo", withoutDevice: "$107.98/mo" },
                          { type: "ultimate", label: "ULTIMATE", channels: "160+ channels", withDevice: "$147.98/mo", withoutDevice: "$137.98/mo" },
                          { type: "premier", label: "PREMIER", channels: "185+ channels", withDevice: "$192.98/mo", withoutDevice: "$182.98/mo" }
                        ].map((pkg) => (
                          <div key={pkg.type} className="p-3 border rounded-lg bg-gray-50">
                            <div className="font-medium">{pkg.label}</div>
                            <div className="text-sm text-gray-600">{pkg.channels}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              With device: {pkg.withDevice} | App only: {pkg.withoutDevice}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setShowPricingModal(false)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

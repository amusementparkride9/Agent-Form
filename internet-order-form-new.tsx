"use client"

import type React from "react"
import { useState } from "react"
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
import { User, MapPin, Wifi, Calendar, Phone, Mail, CreditCard, Settings, CheckCircle, AlertTriangle, Info } from "lucide-react"
import ZipCodeSection from "./components/zip-code-section"
import type { ZipResult } from "./hooks/use-zip-data"

export default function InternetOrderForm() {
  const [movedLastYear, setMovedLastYear] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [zipResult, setZipResult] = useState<ZipResult | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [showProviderDetails, setShowProviderDetails] = useState(false)

  // Dynamic package options based on selected provider
  const getPackageOptions = () => {
    if (!selectedProvider) return []
    
    const packagesByProvider: { [key: string]: Array<{value: string, label: string, speed: string, price: string}> } = {
      "Xfinity": [
        { value: "xfinity-connect", label: "Connect", speed: "75 Mbps", price: "$30/mo" },
        { value: "xfinity-fast", label: "Fast", speed: "400 Mbps", price: "$60/mo" },
        { value: "xfinity-superfast", label: "Superfast", speed: "800 Mbps", price: "$80/mo" },
        { value: "xfinity-gigabit", label: "Gigabit", speed: "1.2 Gbps", price: "$100/mo" }
      ],
      "Frontier Fiber": [
        { value: "frontier-fiber-200", label: "Fiber 200", speed: "200 Mbps", price: "$50/mo" },
        { value: "frontier-fiber-500", label: "Fiber 500", speed: "500 Mbps", price: "$70/mo" },
        { value: "frontier-fiber-gig", label: "Fiber Gig", speed: "1 Gbps", price: "$90/mo" },
        { value: "frontier-fiber-2gig", label: "Fiber 2 Gig", speed: "2 Gbps", price: "$150/mo" }
      ],
      "Frontier Copper": [
        { value: "frontier-copper-basic", label: "DSL Basic", speed: "25 Mbps", price: "$40/mo" },
        { value: "frontier-copper-plus", label: "DSL Plus", speed: "50 Mbps", price: "$55/mo" }
      ],
      "Optimum": [
        { value: "optimum-core", label: "Core", speed: "300 Mbps", price: "$40/mo" },
        { value: "optimum-1gig", label: "1 Gig", speed: "1 Gbps", price: "$70/mo" },
        { value: "optimum-8gig", label: "8 Gig", speed: "8 Gbps", price: "$180/mo" }
      ],
      "Metronet": [
        { value: "metronet-100", label: "100 Mbps", speed: "100 Mbps", price: "$50/mo" },
        { value: "metronet-500", label: "500 Mbps", speed: "500 Mbps", price: "$70/mo" },
        { value: "metronet-gig", label: "Gig", speed: "1 Gbps", price: "$80/mo" }
      ],
      "Kinetic": [
        { value: "kinetic-25", label: "Internet 25", speed: "25 Mbps", price: "$45/mo" },
        { value: "kinetic-100", label: "Internet 100", speed: "100 Mbps", price: "$65/mo" },
        { value: "kinetic-gig", label: "Gig", speed: "1 Gbps", price: "$85/mo" }
      ]
    }
    
    return packagesByProvider[selectedProvider] || []
  }

  const handleAddOnChange = (addOn: string, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOn])
    } else {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== addOn))
    }
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setSelectedPackage("") // Reset package when provider changes
    setShowProviderDetails(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with:", {
      zipResult,
      selectedProvider,
      selectedPackage,
      selectedAddOns
    })
    alert("Order submitted successfully!")
  }

  const getProviderColor = (provider: string) => {
    const colors: { [key: string]: string } = {
      "Xfinity": "bg-red-100 border-red-300 text-red-800",
      "Frontier Fiber": "bg-blue-100 border-blue-300 text-blue-800", 
      "Frontier Copper": "bg-orange-100 border-orange-300 text-orange-800",
      "Optimum": "bg-green-100 border-green-300 text-green-800",
      "Metronet": "bg-purple-100 border-purple-300 text-purple-800",
      "Kinetic": "bg-indigo-100 border-indigo-300 text-indigo-800",
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
        <ZipCodeSection onZipResult={setZipResult} />

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
                      <span className="font-medium">{provider}</span>
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
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ssn" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Social Security Number *
                </Label>
                <Input
                  id="ssn"
                  type="password"
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors max-w-md"
                  required
                />
                <p className="text-xs text-gray-500">This information is encrypted and secure</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                <Textarea
                  id="address"
                  placeholder="Enter complete address including street, city, state, ZIP code"
                  className="border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
                  rows={3}
                  required
                />
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
                <div className="space-y-3 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <Label
                    htmlFor="previous-address"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Previous Address *
                  </Label>
                  <Textarea
                    id="previous-address"
                    placeholder="Enter previous address including street, city, state, ZIP code"
                    className="border-2 border-gray-200 focus:border-yellow-500 transition-colors resize-none"
                    rows={3}
                    required
                  />
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

                    {/* Add-Ons */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Add-Ons (Select all that apply)
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "wifi-router", label: "Wi-Fi Router Rental", price: "+$10/mo", value: "wifi-router" },
                          { id: "security-suite", label: "Internet Security Suite", price: "+$9.99/mo", value: "security-suite" },
                          { id: "tech-support", label: "Premium Tech Support", price: "+$14.99/mo", value: "tech-support" },
                          { id: "static-ip", label: "Static IP Address", price: "+$15/mo", value: "static-ip" },
                          { id: "unlimited-data", label: "Unlimited Data", price: "+$30/mo", value: "unlimited-data" },
                          { id: "mesh-network", label: "Mesh Network System", price: "+$25/mo", value: "mesh-network" },
                        ].map((addOn) => (
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
                      min={(() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return tomorrow.toISOString().split('T')[0];
                      })()}
                      max={(() => {
                        const twoWeeksFromNow = new Date();
                        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
                        return twoWeeksFromNow.toISOString().split('T')[0];
                      })()}
                      onInput={(e) => {
                        const selectedDate = new Date(e.currentTarget.value);
                        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        if (dayOfWeek === 0) { // Sunday
                          e.currentTarget.setCustomValidity("Sunday installations are not available. Please select Monday through Saturday.");
                        } else {
                          e.currentTarget.setCustomValidity("");
                        }
                      }}
                      className="h-12 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Available Monday-Saturday, tomorrow through next 2 weeks
                    </p>
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
                        <SelectItem value="8am-11am">8:00 AM - 11:00 AM</SelectItem>
                        <SelectItem value="11am-2pm">11:00 AM - 2:00 PM</SelectItem>
                        <SelectItem value="2pm-5pm">2:00 PM - 5:00 PM</SelectItem>
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
                  {selectedAddOns.length > 0 && (
                    <div className="pt-3 border-t">
                      <span className="font-medium">Add-ons:</span>
                      <ul className="mt-2 space-y-1">
                        {selectedAddOns.map((addOn) => (
                          <li key={addOn} className="text-sm text-gray-600 ml-4">
                            • {addOn.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </li>
                        ))}
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

            <Button
              type="submit"
              size="lg"
              disabled={!zipResult || !selectedProvider || !selectedPackage}
              className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Order
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              By submitting this form, you confirm that all information is accurate and complete.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

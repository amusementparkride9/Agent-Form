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
import { User, MapPin, Wifi, Calendar, Phone, Mail, CreditCard, Settings } from "lucide-react"
import ZipCodeSection from "./components/zip-code-section"
import type { ZipResult } from "./hooks/use-zip-data"

export default function InternetOrderForm() {
  const [movedLastYear, setMovedLastYear] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [zipResult, setZipResult] = useState<ZipResult | null>(null)

  const handleAddOnChange = (addOn: string, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOn])
    } else {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== addOn))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted with ZIP result:", zipResult)
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
                  Current Address *
                </Label>
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

          {/* Service Selection */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Wifi className="w-6 h-6" />
                Service Selection
                {zipResult && (
                  <Badge variant="secondary" className="ml-auto">
                    {zipResult.providers.length} Providers Available
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="internet-package" className="text-sm font-semibold text-gray-700">
                    Internet Package *
                  </Label>
                  <Select required>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
                      <SelectValue placeholder="Select internet package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic-25">
                        <div className="flex justify-between items-center w-full">
                          <span>Basic - 25 Mbps</span>
                          <Badge variant="outline">$39.99/mo</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="standard-100">
                        <div className="flex justify-between items-center w-full">
                          <span>Standard - 100 Mbps</span>
                          <Badge variant="outline">$59.99/mo</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="premium-300">
                        <div className="flex justify-between items-center w-full">
                          <span>Premium - 300 Mbps</span>
                          <Badge variant="outline">$79.99/mo</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="ultra-500">
                        <div className="flex justify-between items-center w-full">
                          <span>Ultra - 500 Mbps</span>
                          <Badge variant="outline">$99.99/mo</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="gigabit-1000">
                        <div className="flex justify-between items-center w-full">
                          <span>Gigabit - 1000 Mbps</span>
                          <Badge variant="outline">$119.99/mo</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="directv" className="text-sm font-semibold text-gray-700">
                    DirecTV Package
                  </Label>
                  <Select>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
                      <SelectValue placeholder="Select DirecTV package (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No DirecTV</SelectItem>
                      <SelectItem value="entertainment">Entertainment - $64.99/mo</SelectItem>
                      <SelectItem value="choice">Choice - $84.99/mo</SelectItem>
                      <SelectItem value="ultimate">Ultimate - $104.99/mo</SelectItem>
                      <SelectItem value="premier">Premier - $139.99/mo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Add-Ons (Select all that apply)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "wifi-router", label: "Wi-Fi Router Rental", price: "+$10/mo", value: "wifi-router" },
                    {
                      id: "security-suite",
                      label: "Internet Security Suite",
                      price: "+$9.99/mo",
                      value: "security-suite",
                    },
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
            </CardContent>
          </Card>

          {/* Installation Preferences */}
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

          {/* Submit Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Ready to Submit Order</h3>
            <p className="text-gray-600">Please review all information before submitting the order.</p>
            <Button
              type="submit"
              size="lg"
              className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
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

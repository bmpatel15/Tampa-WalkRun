"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useParticipantStore } from "@/lib/store"

export default function RegisterPage() {
  const { toast } = useToast()
  const addParticipant = useParticipantStore((state) => state.addParticipant)
  const fetchParticipants = useParticipantStore((state) => state.fetchParticipants)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    tshirtSize: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  })

  // Fetch participants on mount
  React.useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addParticipant({
      firstName: formData.firstName,
      lastName: formData.lastName,
      registrantId: Math.floor(100000 + Math.random() * 900000).toString(),
      registrationType: "Individual",
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      phone: formData.phone,
      email: formData.email,
      checkedIn: true,
      attendees: 1,
      additionalFamily: 0,
      totalPaid: 0,
      shirts: formData.tshirtSize,
    } as any)
    await fetchParticipants()
    toast({
      title: "Registration Successful!",
      description: `${formData.firstName} ${formData.lastName} has been registered for the walkathon.`,
    })
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: "",
      tshirtSize: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Register New Participant</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Participant Information
              </CardTitle>
              <CardDescription>Please fill out all required information for walkathon registration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Home Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Home Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => handleInputChange("zip", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tshirtSize">T-Shirt Size *</Label>
                    <Select
                      value={formData.tshirtSize}
                      onValueChange={(value) => handleInputChange("tshirtSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">XS</SelectItem>
                        <SelectItem value="s">S</SelectItem>
                        <SelectItem value="m">M</SelectItem>
                        <SelectItem value="l">L</SelectItem>
                        <SelectItem value="xl">XL</SelectItem>
                        <SelectItem value="xxl">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Register Participant
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

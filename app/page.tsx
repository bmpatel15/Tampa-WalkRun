"use client"

import Link from "next/link"
import { Users, UserPlus, Upload, CheckCircle, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useParticipantStore } from "@/lib/store"
import React from "react"

export default function HomePage() {
  const participants = useParticipantStore((state) => state.participants)
  const fetchParticipants = useParticipantStore((state) => state.fetchParticipants)
  const totalCount = participants.length
  const checkedInCount = participants.filter((p) => p.checkedIn).length
  const remainingCount = totalCount - checkedInCount

  // Fetch participants on mount
  React.useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Walkathon 2024</h1>
          <p className="text-xl text-gray-600 mb-6">Registration & Check-in Management System</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>March 15, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Central Park</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-600">Registered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{checkedInCount}</div>
              <div className="text-sm text-gray-600">Checked In</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{remainingCount}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Register Participant</CardTitle>
              <CardDescription>Add new participants to the walkathon</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button className="w-full">Register New</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Check-in</CardTitle>
              <CardDescription>Check in participants on event day</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/checkin">
                <Button className="w-full" variant="outline">
                  Start Check-in
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Upload Excel</CardTitle>
              <CardDescription>Bulk import participants from spreadsheet</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button className="w-full" variant="outline">
                  Upload File
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Manage Participants</CardTitle>
              <CardDescription>View and manage all registered participants</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/participants">
                <Button className="w-full" variant="outline">
                  View All
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

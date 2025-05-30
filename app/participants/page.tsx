"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter, Download, Edit, Trash2, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParticipantStore } from "@/lib/store"

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const participants = useParticipantStore((state) => state.participants)
  const updateParticipant = useParticipantStore((state) => state.updateParticipant)

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(participant.phone || "").includes(searchTerm)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checked-in" && participant.checkedIn) ||
      (statusFilter === "pending" && !participant.checkedIn)

    return matchesSearch && matchesStatus
  })

  const exportData = () => {
    // In a real app, you'd generate and download a CSV/Excel file
    console.log("Exporting participant data:", filteredParticipants)
  }

  const deleteParticipant = (id: string) => {
    // You can implement a removeParticipant method in the store if needed
    // For now, this is a placeholder
    alert('Delete not implemented for real data yet.');
  }

  const checkedInCount = participants.filter((p) => p.checkedIn).length
  const totalCount = participants.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Participants</h1>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-600">Total Registered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{checkedInCount}</div>
              <div className="text-sm text-gray-600">Checked In</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{totalCount - checkedInCount}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round((checkedInCount / totalCount) * 100)}%</div>
              <div className="text-sm text-gray-600">Check-in Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="pending">Pending Check-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Participants ({filteredParticipants.length})</CardTitle>
            <CardDescription>Manage all registered participants for the walkathon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Participant</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Details</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant, idx) => (
                    <tr key={participant.registrantId + '-' + participant.email + '-' + idx} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {participant.firstName} {participant.lastName}
                          </div>
                          <div className="text-sm text-gray-600">ID: {participant.registrantId}</div>
                        </div>
                      </td>
                      <td className="p-4">{participant.phone}</td>
                      <td className="p-4">{participant.email}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>Type: {participant.registrationType}</div>
                          <div>Shirt: {participant.shirts}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={participant.checkedIn ? "default" : "secondary"}>
                          {participant.checkedIn ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" /> Checked In
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" /> Pending
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteParticipant(participant.registrantId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {!participant.checkedIn && (
                            <Button size="sm" onClick={() => updateParticipant(participant.registrantId, participant.email, participant.firstName, { checkedIn: true })}>
                              Check In
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

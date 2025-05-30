"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useParticipantStore } from "@/lib/store"
import type { Participant } from "@/lib/store"

// Helper to group participants by registrantId
function groupByRegistrantId(participants: Participant[]) {
  const groups: Record<string, Participant[]> = {};
  for (const p of participants) {
    if (!groups[p.registrantId]) groups[p.registrantId] = [];
    groups[p.registrantId].push(p);
  }
  return Object.entries(groups).map(([registrantId, members]) => ({ registrantId, members }));
}

export default function CheckInPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const { participants, checkInFamily, updateParticipant } = useParticipantStore()

  // Group by registrantId
  const familyGroups: { registrantId: string; members: Participant[] }[] = groupByRegistrantId(participants)

  // Filter by search
  const filteredGroups = familyGroups.filter(group => {
    const searchLower = searchTerm.toLowerCase()
    // Match if any member matches search
    return group.members.some((member: Participant) =>
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.registrantId.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    )
  })

  // Count checked in
  const checkedInCount = participants.filter((p) => p.checkedIn).length
  const totalCount = participants.length

  // Check in all members of a family
  const handleCheckInFamily = (registrantId: string) => {
    checkInFamily(registrantId);
    toast({
      title: "Check-in Successful!",
      description: `Family ${registrantId} has been checked in.`,
    });
  }

  // Check in an individual
  const handleCheckInIndividual = (registrantId: string, email: string, firstName: string, lastName: string) => {
    updateParticipant(registrantId, email, firstName, { checkedIn: true })
    toast({
      title: "Check-in Successful!",
      description: `Participant ${firstName} ${lastName} has been checked in.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Check-in Participants</h1>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{checkedInCount}</div>
                <p className="text-sm text-gray-500">Participants Checked In</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-sm text-gray-500">Total Participants</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Participants</CardTitle>
              <CardDescription>Find participants by name, ID, or email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Family Groups List */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>
                {filteredGroups.reduce((acc, group) => acc + group.members.length, 0)} participants found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {filteredGroups.map((group) => {
                  // Family is checked in if ALL members are checked in
                  const allCheckedIn = group.members.every(m => m.checkedIn)
                  return (
                    <div key={group.registrantId} className={`p-4 bg-white rounded-lg shadow-sm ${allCheckedIn ? 'border-l-4 border-green-500' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">Family ID: {group.registrantId}</h3>
                          <p className="text-sm text-gray-500">{group.members.length} member(s)</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => handleCheckInFamily(group.registrantId)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={allCheckedIn}
                          >
                            Check In Family
                          </Button>
                        </div>
                      </div>
                      {/* Table of family members */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Email</th>
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Shirt Size</th>
                              <th className="text-left p-2">Checked In</th>
                              <th className="text-left p-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.members.map((member: Participant, idx) => (
                              <tr key={member.email + idx} className="border-b">
                                <td className="p-2">{member.firstName} {member.lastName}</td>
                                <td className="p-2">{member.email}</td>
                                <td className="p-2">{member.registrationType}</td>
                                <td className="p-2">{member.shirts}</td>
                                <td className="p-2">
                                  {member.checkedIn ? (
                                    <span className="text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Yes</span>
                                  ) : (
                                    <span className="text-gray-500">No</span>
                                  )}
                                </td>
                                <td className="p-2">
                                  {!member.checkedIn && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCheckInIndividual(member.registrantId, member.email, member.firstName, member.lastName)}
                                    >
                                      Check In
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
                {filteredGroups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No participants found. Try adjusting your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

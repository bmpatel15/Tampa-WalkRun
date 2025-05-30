import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/participants
export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(participants)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}

// POST /api/participants
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Handle bulk upload
    if (Array.isArray(data)) {
      const participants = await prisma.participant.createMany({
        data: data.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          registrantId: p.registrantId,
          registrationType: p.registrationType,
          address: p.address,
          city: p.city,
          state: p.state,
          zip: p.zip,
          phone: p.phone,
          email: p.email,
          checkedIn: p.checkedIn,
          attendees: p.attendees,
          additionalFamily: p.additionalFamily,
          totalPaid: p.totalPaid,
          shirts: p.shirts,
        })),
        skipDuplicates: true, // Skip if registrantId already exists
      })
      return NextResponse.json(participants)
    }
    
    // Handle single participant
    const participant = await prisma.participant.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        registrantId: data.registrantId,
        registrationType: data.registrationType,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        email: data.email,
        checkedIn: data.checkedIn,
        attendees: data.attendees,
        additionalFamily: data.additionalFamily,
        totalPaid: data.totalPaid,
        shirts: data.shirts,
      },
    })
    return NextResponse.json(participant)
  } catch (error) {
    console.error("POST /api/participants error:", error)
    return NextResponse.json(
      { error: 'Failed to create participant(s)' },
      { status: 500 }
    )
  }
}

// DELETE /api/participants
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrantId = searchParams.get('registrantId')
    const registrationType = searchParams.get('registrationType')
    const firstName = searchParams.get('firstName')

    if (!registrantId && !registrationType && !firstName) {
      // No params: delete all participants
      await prisma.participant.deleteMany({})
      return NextResponse.json({ success: true })
    }

    if (!registrantId || !registrationType || !firstName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    await prisma.participant.deleteMany({
      where: {
        registrantId,
        registrationType,
        firstName,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/participants error:", error)
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    )
  }
}

// PATCH /api/participants
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrantId = searchParams.get('registrantId')
    const registrationType = searchParams.get('registrationType')
    const firstName = searchParams.get('firstName')
    const data = await request.json()

    if (!registrantId || !registrationType || !firstName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('PATCH /api/participants', { registrantId, registrationType, firstName, data })
    const participant = await prisma.participant.updateMany({
      where: {
        registrantId,
        registrationType,
        firstName,
      },
      data,
    })
    console.log('PATCH result:', participant)

    return NextResponse.json(participant)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    )
  }
} 
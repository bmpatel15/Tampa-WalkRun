import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, UserSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const res = new NextResponse()
  const session = await getIronSession<UserSession>(req, res, sessionOptions)
  if (!session.id) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user: { id: session.id, email: session.email, name: session.name } })
} 
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, UserSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const res = new NextResponse()
  const session = await getIronSession<UserSession>(req, res, sessionOptions)
  await session.destroy()
  return NextResponse.json({ ok: true })
} 
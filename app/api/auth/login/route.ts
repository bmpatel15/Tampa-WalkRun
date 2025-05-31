import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sessionOptions, UserSession } from '@/lib/session'
import { getIronSession } from 'iron-session'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  // Set session
  const res = new NextResponse()
  const session = await getIronSession<UserSession>(req, res, sessionOptions)
  session.id = user.id
  session.email = user.email!
  session.name = user.name
  await session.save()

  return NextResponse.json({ id: user.id, email: user.email, name: user.name })
} 
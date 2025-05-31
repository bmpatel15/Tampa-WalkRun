import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sessionOptions, UserSession } from '@/lib/session'
import { getIronSession } from 'iron-session'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'User already exists.' }, { status: 400 })
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  })

  // Set session
  const res = new NextResponse()
  const session = await getIronSession<UserSession>(req, res, sessionOptions)
  session.id = user.id
  session.email = user.email!
  session.name = user.name
  await session.save()

  return NextResponse.json({ id: user.id, email: user.email, name: user.name })
} 
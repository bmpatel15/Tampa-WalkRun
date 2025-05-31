import { SessionOptions } from 'iron-session'

export type UserSession = {
  id: string
  email: string
  name?: string | null
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // Add this to your .env
  cookieName: 'walk-registration-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
} 
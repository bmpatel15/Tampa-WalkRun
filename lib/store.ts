import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface Participant {
  firstName: string
  lastName: string
  registrantId: string
  registrationType?: string
  address: string
  city: string
  state?: string
  zip?: string
  phone: string
  email: string
  checkedIn: boolean
  attendees: number
  additionalFamily: number
  totalPaid: number
  shirts: string
}

interface ParticipantStore {
  participants: Participant[]
  addParticipants: (participants: Participant[]) => void
  addParticipant: (participant: Participant) => void
  updateParticipant: (registrantId: string, email: string, firstName: string, data: Partial<Participant>) => void
  checkInParticipant: (id: string) => void
  checkInFamily: (registrantId: string) => void
  clearParticipants: () => void
  removeParticipant: (registrantId: string, email: string, firstName: string) => void
}

export const useParticipantStore = create<ParticipantStore>()(
  persist(
    immer((set) => ({
      participants: [],
      addParticipants: (newParticipants) => {
        set((state) => {
          state.participants.push(...newParticipants)
        })
      },
      addParticipant: (participant) => {
        set((state) => {
          state.participants.push(participant)
        })
      },
      updateParticipant: (registrantId, email, firstName, data) => {
        set((state) => {
          state.participants.forEach((p: Participant) => {
            if (p.registrantId === registrantId && p.email === email && p.firstName === firstName) {
              Object.assign(p, data)
            }
          })
        })
      },
      checkInParticipant: (id) => {
        set((state) => {
          state.participants.forEach((p: Participant) => {
            if (p.registrantId === id) {
              p.checkedIn = true
            }
          })
        })
      },
      checkInFamily: (registrantId) => {
        set((state) => {
          console.log('CheckInFamily called for:', registrantId);
          state.participants.forEach((p: Participant) => {
            if (p.registrantId === registrantId) {
              console.log('Checking in:', p.firstName, p.lastName, p.email);
              p.checkedIn = true
            }
          })
        })
      },
      clearParticipants: () => set((state) => {
        state.participants = []
      }),
      removeParticipant: (registrantId, email, firstName) => {
        set((state) => {
          state.participants = state.participants.filter(
            (p) => !(p.registrantId === registrantId && p.email === email && p.firstName === firstName)
          )
        })
      },
    })),
    {
      name: 'participant-storage',
    }
  )
) 
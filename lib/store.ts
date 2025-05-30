import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface Participant {
  id: string
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
  isLoading: boolean
  error: string | null
  fetchParticipants: () => Promise<void>
  addParticipants: (participants: Participant[]) => Promise<void>
  addParticipant: (participant: Participant) => Promise<void>
  updateParticipant: (registrantId: string, registrationType: string, firstName: string, data: Partial<Participant>) => Promise<void>
  checkInParticipant: (id: string) => Promise<void>
  checkInFamily: (registrantId: string) => Promise<void>
  clearParticipants: () => Promise<void>
  removeParticipant: (registrantId: string, registrationType: string, firstName: string) => Promise<void>
}

export const useParticipantStore = create<ParticipantStore>()(
  persist(
    immer((set, get) => ({
      participants: [],
      isLoading: false,
      error: null,

      fetchParticipants: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/participants')
          if (!response.ok) throw new Error('Failed to fetch participants')
          const data = await response.json()
          set({ participants: data, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch participants', isLoading: false })
        }
      },

      addParticipants: async (newParticipants) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newParticipants),
          })
          if (!response.ok) throw new Error('Failed to add participants')
          const data = await response.json()
          set((state) => {
            state.participants.push(...data)
            state.isLoading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add participants', isLoading: false })
        }
      },

      addParticipant: async (participant) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participant),
          })
          if (!response.ok) throw new Error('Failed to add participant')
          const data = await response.json()
          set((state) => {
            state.participants.push(data)
            state.isLoading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add participant', isLoading: false })
        }
      },

      updateParticipant: async (registrantId, registrationType, firstName, data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/participants?registrantId=${registrantId}&registrationType=${registrationType}&firstName=${firstName}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (!response.ok) throw new Error('Failed to update participant')
          const updatedData = await response.json()
          set((state) => {
            state.participants = state.participants.map((p) =>
              p.registrantId === registrantId && p.registrationType === registrationType && p.firstName === firstName
                ? { ...p, ...data }
                : p
            )
            state.isLoading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update participant', isLoading: false })
        }
      },

      checkInParticipant: async (id) => {
        const participant = get().participants.find((p) => p.registrantId === id)
        if (!participant) return
        await get().updateParticipant(id, participant.registrationType as string, participant.firstName, { checkedIn: true })
      },

      checkInFamily: async (registrantId) => {
        const familyMembers = get().participants.filter((p) => p.registrantId === registrantId)
        await Promise.all(
          familyMembers.map((member) =>
            get().updateParticipant(registrantId, member.registrationType as string, member.firstName, { checkedIn: true })
          )
        )
      },

      clearParticipants: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/participants', { method: 'DELETE' })
          if (!response.ok) throw new Error('Failed to clear participants')
          set({ participants: [], isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to clear participants', isLoading: false })
        }
      },

      removeParticipant: async (registrantId, registrationType, firstName) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/participants?registrantId=${registrantId}&registrationType=${registrationType}&firstName=${firstName}`, {
            method: 'DELETE',
          })
          if (!response.ok) throw new Error('Failed to remove participant')
          set((state) => {
            state.participants = state.participants.filter(
              (p) => !(p.registrantId === registrantId && p.registrationType === registrationType && p.firstName === firstName)
            )
            state.isLoading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove participant', isLoading: false })
        }
      },
    })),
    {
      name: 'participant-storage',
    }
  )
) 
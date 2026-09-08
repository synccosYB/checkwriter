import { useQuery } from '@tanstack/react-query'
import { usersClient } from './userClient'

function useUserInfo(enabled = true) {
        return useQuery({
                queryKey: ['user info'],
                queryFn: () => usersClient.get<UserResponse>(`/user`),
                staleTime: Infinity,
                enabled
        })
}

export default useUserInfo

type UserRole = 'superadmin' | 'user'

interface UserPreferences {
        defaultCheckNumberLength: string
        defaultCheckNumberGen: string
        defaultCheckStartNumber: string
        _id: string
}

interface UserResponse {
        tags: Record<string, unknown>
        groups: Record<string, unknown>
        _id: string
        firstName: string
        middleName: string | null
        lastName: string
        email: string
        phone: string
        dateOfBirth?: string // ISO date string
        signatureUrl?: string
        role?: UserRole
        welcomeSeen: boolean
        createdAt: string
        updatedAt: string
        subscriptionStartedAt?: string
        preferences?: UserPreferences
        lastLogin?: string
        hasPassword?: boolean
        trialMaxChecks: number
        isDemo?: boolean
}

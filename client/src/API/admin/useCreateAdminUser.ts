import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export interface AdminCreateUserRequest {
	firstName: string
	lastName: string
	email: string
	sendPasswordSetupEmail: boolean
}

export interface AdminCreateUserResponse {
	_id: string
	firstName: string
	lastName: string
	email: string
	createdAt: string
}

export function useCreateAdminUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationKey: ['admin', 'users', 'create'],
		mutationFn: async (payload: AdminCreateUserRequest) => {
			const data = await adminClient.post<AdminCreateUserResponse>(
				'register-user',
				payload
			)
			return data
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['register users info'] })
		}
	})
}

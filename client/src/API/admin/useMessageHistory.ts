import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

function useMessageHistory(
	userId: string | null,
	pageNumber: number = 1,
	pageSize: number = 10
) {
	return useQuery({
		queryKey: ['admin-message-history', userId, pageNumber, pageSize],
		queryFn: async () => {
			const resp = await adminClient.get(`/users/${userId}/messages`, {
				pageNumber,
				pageSize
			})
			return resp
		},
		enabled: !!userId
	})
}

export default useMessageHistory

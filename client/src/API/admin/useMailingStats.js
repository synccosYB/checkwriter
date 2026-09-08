import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

function useMailingStats() {
	return useQuery({
		queryKey: ['mails stats'],
		queryFn: () => adminClient.get(`/get-mailing-stats`)
	})
}

export default useMailingStats

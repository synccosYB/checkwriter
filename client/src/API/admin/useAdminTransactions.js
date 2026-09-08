import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminTransactions(params = {}) {
  return useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: async () => {
      return await adminClient.get('/transactions', params)
    },
    keepPreviousData: true
  })
}

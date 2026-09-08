import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminImports(params = {}) {
  return useQuery({
    queryKey: ['admin-imports', params],
    queryFn: async () => {
      return await adminClient.get('/imports', params)
    },
    keepPreviousData: true
  })
}

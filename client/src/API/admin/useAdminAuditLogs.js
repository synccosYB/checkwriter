import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: async () => {
      return await adminClient.get('/audit-logs', params)
    },
    keepPreviousData: true
  })
}

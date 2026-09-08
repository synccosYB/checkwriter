import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminAttachments(params = {}) {
  return useQuery({
    queryKey: ['admin-attachments', params],
    queryFn: async () => {
      return await adminClient.get('/attachments', params)
    },
    keepPreviousData: true
  })
}

import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminIntegrations() {
  return useQuery({
    queryKey: ['admin-integrations'],
    queryFn: async () => {
      return await adminClient.get('/integrations')
    }
  })
}

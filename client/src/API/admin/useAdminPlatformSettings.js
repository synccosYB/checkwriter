import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminPlatformSettings() {
  return useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: async () => {
      return await adminClient.get('/platform-settings')
    }
  })
}

export function useAdminUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      return await adminClient.put('/platform-settings', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] })
    }
  })
}

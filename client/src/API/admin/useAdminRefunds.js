import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminCharges(userId) {
  return useQuery({
    queryKey: ['admin-charges', userId],
    queryFn: async () => {
      return await adminClient.get(`/refunds/charges/${userId}`)
    },
    enabled: !!userId,
    keepPreviousData: true
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      return await adminClient.post('/refunds/process', payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-charges', variables.userId] })
    }
  })
}

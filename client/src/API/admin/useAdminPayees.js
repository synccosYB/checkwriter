import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminPayees(params = {}) {
  return useQuery({
    queryKey: ['admin-payees', params],
    queryFn: async () => {
      return await adminClient.get('/payees', params)
    },
    keepPreviousData: true
  })
}

export function useAdminPayeeUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ payeeId, data }) => {
      return await adminClient.put(`/payees/${payeeId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payees'] })
    }
  })
}

export function useAdminPayeeDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ payeeId }) => {
      return await adminClient.delete(`/payees/${payeeId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payees'] })
    }
  })
}

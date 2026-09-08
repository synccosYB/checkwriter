import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminBanks(params = {}) {
  return useQuery({
    queryKey: ['admin-banks', params],
    queryFn: async () => {
      return await adminClient.get('/banks', params)
    },
    keepPreviousData: true
  })
}

export function useAdminBankUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bankId, data }) => {
      return await adminClient.put(`/banks/${bankId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banks'] })
    }
  })
}

export function useAdminBankDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bankId }) => {
      return await adminClient.delete(`/banks/${bankId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banks'] })
    }
  })
}

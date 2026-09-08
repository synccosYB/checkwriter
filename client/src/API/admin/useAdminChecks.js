import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminChecks(params = {}) {
  return useQuery({
    queryKey: ['admin-checks', params],
    queryFn: async () => {
      const res = await adminClient.get('/checks', params)
      return res
    },
    keepPreviousData: true
  })
}

export function useAdminCheckUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ checkId, data }) => {
      return await adminClient.put(`/checks/${checkId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checks'] })
    }
  })
}

export function useAdminCheckVoid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ checkId }) => {
      return await adminClient.patch(`/checks/${checkId}/void`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checks'] })
    }
  })
}

export function useAdminCheckDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ checkId }) => {
      return await adminClient.delete(`/checks/${checkId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checks'] })
    }
  })
}

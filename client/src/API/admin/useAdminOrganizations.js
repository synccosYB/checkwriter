import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminOrganizations(params = {}) {
  return useQuery({
    queryKey: ['admin-organizations', params],
    queryFn: async () => {
      return await adminClient.get('/organizations', params)
    },
    keepPreviousData: true
  })
}

export function useAdminOrganizationUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orgId, data }) => {
      return await adminClient.put(`/organizations/${orgId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })
    }
  })
}

export function useAdminOrganizationDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orgId }) => {
      return await adminClient.delete(`/organizations/${orgId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })
    }
  })
}

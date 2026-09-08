import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminUserActivation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, active }) => {
      return await adminClient.patch(`/users/${userId}/activation`, { active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['register users info'] })
    }
  })
}

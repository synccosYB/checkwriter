import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'
const useUserRoleUpdate = () => {
	return useMutation({
		mutationKey: ['updateUserRole'],
		mutationFn: ({ userId, role }) =>
			adminClient.put(`/update-user-role`, { role, userId }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['register users info'] })
	})
}

export default useUserRoleUpdate

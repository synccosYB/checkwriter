import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useResetPasswordForUser() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: [`reset a user's passoword`],
		mutationFn: ({ id }: { id: string }) =>
			adminClient.post(`/users/${id}/reset-password`, {
				domain: window.location.origin
			}),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: `${'Email sent for password reset'}`,
					severity: 'success'
				})
			)
		}
	})
}

export default useResetPasswordForUser

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useSendSupportEmail() {
	const dispatch = useDispatch()
	const queryClient = useQueryClient()

	return useMutation({
		mutationKey: ['send-support-email'],
		mutationFn: ({
			userId,
			subject,
			body
		}: {
			userId: string
			subject: string
			body: string
		}) => adminClient.post(`/users/${userId}/send-email`, { subject, body }),
		onSuccess: (_data, variables) => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Support email sent successfully',
					severity: 'success'
				})
			)
			queryClient.invalidateQueries({
				queryKey: ['admin-message-history', variables.userId]
			})
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to send support email',
					severity: 'error'
				})
			)
		}
	})
}

export default useSendSupportEmail

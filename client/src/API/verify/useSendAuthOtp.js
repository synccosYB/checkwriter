import { useMutation } from '@tanstack/react-query'
import { verifyClient } from './verifyClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useSendAuthOtp() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['send auth otp'],
		mutationFn: (body) => verifyClient.post(`/email/send-otp`, body),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'An email verification link sent. Please check your email.'
				})
			)
		},
		onError: (error) => {
			const { response } = error
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: `${
						response?.data?.error?.userMessage || 'Something went wrong'
					}`
				})
			)
		}
	})
}

export default useSendAuthOtp

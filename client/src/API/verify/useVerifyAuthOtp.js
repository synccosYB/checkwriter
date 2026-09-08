import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { verifyClient } from './verifyClient'
import { updateSnackbar } from '../../redux/snackbarState'

function useVerifyAuthOtp() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['verify auth otp'],
		mutationFn: (body) => verifyClient.post(`/email/verify-otp`, body),
		onError: (error) => {
			const { response } = error
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: `${
						response?.data?.error?.userMessage || 'Something went wrong.'
					}`
				})
			)
		}
	})
}

export default useVerifyAuthOtp

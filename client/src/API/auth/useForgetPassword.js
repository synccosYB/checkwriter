import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useForgetPassword() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['forget password'],
		mutationFn: (body) =>
			authClient.post(`/forgot-password`, {
				...body,
				domain: window.location.origin
			}),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Verification mail sent.'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Unable to send verification mail.'
				})
			)
		}
	})
}

export default useForgetPassword

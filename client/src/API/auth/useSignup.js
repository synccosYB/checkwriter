import { useMutation } from '@tanstack/react-query'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authClient } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'
import { updateSnackbar } from '../../redux/snackbarState'

function useSignup() {
	const history = useHistory()
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['signup'],
		mutationFn: (body) => authClient.post(`/signup`, body),
		onSuccess: (data) => {
			// Set cookies using MyCookies
			MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
				expires: 1 / 24
			})
			MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, data.refreshToken, {
				expires: 12 / 24
			})
			MyCookies.set(MyCookies.KEYS.USER_STATUS, true, { expires: 12 / 24 })
			MyCookies.set(MyCookies.KEYS.SUBSCRIPTION, data.subscriptionTaken, {
				expires: 12 / 24
			})

			// Redirect based on subscription status
			if (data.subscriptionTaken) {
				dispatch(
					updateSnackbar({
						open: true,
						severity: 'success',
						message: 'Signup Successful.'
					})
				)
				history.push({
					pathname: '/dashboard/main',
					state: { showModal: true }
				})
			} else {
				history.push('/dashboard/subscription-management') // Redirect to the subscription route
			}
		},
		onError: (err) => {
			const errorMessage =
				err?.response?.data?.error?.userMessage || 'Unknown Error.'
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: errorMessage
				})
			)
		}
	})
}

export default useSignup

import { updateSnackbar } from '../redux/snackbarState'
import store from '../redux/store'

// Global state for subscription modal
let subscriptionModalCallback = null

export const ERROR_TYPES = {
	SUBSCRIPTION: { type: 'subscription', message: 'Operation forbidden' }
}

export const setSubscriptionModalCallback = (callback) => {
	subscriptionModalCallback = callback
}

export const handleAPIError = (error) => {
	const { response } = error
	// Check if it's a subscription error (status code 403)
	if (
		response?.status === 403 &&
		response?.data?.type === ERROR_TYPES.SUBSCRIPTION.type
	) {

		if (subscriptionModalCallback) {
			// Show subscription modal
			subscriptionModalCallback(true)

			// Show a snackbar message
			store.dispatch(
				updateSnackbar({
					open: true,
					message:response.data.message ? response.data.message :
						'This feature requires a subscription. Please subscribe to continue.',
					severity: 'warning'
				})
			)
			return
		} else {
			console.warn('Subscription modal callback not set') // Debug log
		}
	}

	// Handle other errors with snackbar
	store.dispatch(
		updateSnackbar({
			open: true,
			message:
				response?.data?.userMessage ??
				response?.data?.message ??
				'An error occurred. Please try again.',
			severity: 'error'
		})
	)
}

export const setupAxiosErrorInterceptor = (axiosInstance) => {
	axiosInstance.interceptors.response.use(
		(response) => response,
		(error) => {
			handleAPIError(error)
			return Promise.reject(error)
		}
	)
}

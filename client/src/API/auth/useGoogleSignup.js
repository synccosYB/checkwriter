import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/loginLogout'
import { updateSnackbar } from '../../redux/snackbarState'

function useGoogleSignup() {
	const history = useHistory()
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['google sign up'],
		mutationFn: (body) => authClient.post('/google/signup', body),
		onSuccess: (data) => {
			MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, data.refreshToken, {
				expires: 1
			})
			MyCookies.set(MyCookies.KEYS.USER_STATUS, true, { expires: 1 })
			MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
				expires: 2 / 24
			})

			dispatch(login({ token: data.accessToken }))

			dispatch(
				updateSnackbar({
					open: true,
					message: `Google login successful.`,
					severity: 'success'
				})
			)

			history.push({
				pathname: '/dashboard/subscription-management',
				state: { showModal: true }
			})

			// history.push('/dashboard/main')
			// localStorage.setItem('isFirstTimeSignUp', true)
		}
	})
}
export default useGoogleSignup

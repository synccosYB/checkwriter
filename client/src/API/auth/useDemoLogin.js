import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/loginLogout'
import { updateSnackbar } from '../../redux/snackbarState'

function useDemoLogin() {
        const history = useHistory()
        const dispatch = useDispatch()

        return useMutation({
                mutationKey: ['demo login'],
                mutationFn: () => {
                        MyCookies.removeAll()
                        return authClient.post('/demo-login', {})
                },
                onSuccess: (data) => {
                        const authData = { ...data?.tokens }

                        const hostname = window.location.hostname
                        const domain = hostname.endsWith('.synccos.com') || hostname === 'synccos.com'
                                ? '.synccos.com'
                                : hostname

                        MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, authData.refreshToken, {
                                expires: 7
                        })
                        MyCookies.set(MyCookies.KEYS.DIRECT_TOKEN, authData.accessToken, {
                                expires: 1,
                                domain
                        })
                        MyCookies.set(MyCookies.KEYS.DIRECT_TOKEN_REF, 'checkwriter', {
                                expires: 1 / 24,
                                domain
                        })
                        MyCookies.set(MyCookies.KEYS.USER_STATUS, true, { expires: 1 })
                        MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, authData.accessToken, {
                                expires: 2 / 24
                        })
                        MyCookies.set(MyCookies.KEYS.USER_ROLE, data?.role)
                        MyCookies.set(MyCookies.KEYS.ENABLE_MFA, false)

                        dispatch(login({ token: authData.accessToken }))
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Welcome to the demo! Explore the app freely.',
                                        severity: 'success'
                                })
                        )

                        localStorage.setItem('isFirstTimeSignUp', false)

                        history.push('/')
                },
                onError: () => {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Failed to start demo. Please try again.',
                                        severity: 'error'
                                })
                        )
                }
        })
}

export default useDemoLogin

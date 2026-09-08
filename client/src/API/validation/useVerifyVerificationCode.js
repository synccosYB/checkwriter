import { useMutation } from '@tanstack/react-query'
import { authClient } from './validationClient'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/loginLogout'
import { updateSnackbar } from '../../redux/snackbarState'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { MySessionStorage } from '../../utils/sessionStorage/sessionStorageService'

function useVerifyVerificationCode() {
        const history = useHistory()
        const dispatch = useDispatch()

        const redirectUrl = MySessionStorage.get(MySessionStorage.KEYS.REDIRECT_URL)

        return useMutation({
                mutationKey: ['Validate OTP'],
                mutationFn: (body) => authClient.post('/mfa/verify-otp', body),
                onSuccess: (authData) => {
                        const hostname = window.location.hostname
                        const domain = hostname.endsWith('.synccos.com') || hostname === 'synccos.com'
                                ? '.synccos.com'
                                : hostname

                        MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, authData.refreshToken, {
                                expires: 1
                        })

                        MyCookies.set(MyCookies.KEYS.DIRECT_TOKEN, authData.accessToken, {
                                expires: 1 / 24,
                                domain: domain
                        })

                        MyCookies.set(MyCookies.KEYS.DIRECT_TOKEN_REF, 'checkwriter', {
                                expires: 1 / 24,
                                domain: domain
                        })

                        MyCookies.set(MyCookies.KEYS.USER_STATUS, true, {
                                expires: 1
                        })

                        MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, authData.accessToken, {
                                expires: 2 / 24
                        })

                        MyCookies.set(MyCookies.KEYS.MFA_VERIFIED, true)

                        dispatch(login({ token: authData.accessToken }))

                        history.push({
                                pathname: redirectUrl ? redirectUrl : '/dashboard/main',
                                state: {
                                        showModal: true
                                }
                        })
                        localStorage.setItem('isFirstTimeSignUp', false)

                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Verification Successful',
                                        severity: 'success'
                                })
                        )
                }
        })
}

export default useVerifyVerificationCode

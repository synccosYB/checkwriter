import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/loginLogout'
import { updateSnackbar } from '../../redux/snackbarState'
import { MySessionStorage } from '../../utils/sessionStorage/sessionStorageService'
import { isMfaWindowValidFromToken } from '../../utils/helper'

function useGoogleSignin() {
        const history = useHistory()
        const dispatch = useDispatch()
        const redirecrUrl = MySessionStorage.get(MySessionStorage.KEYS.REDIRECT_URL)

        return useMutation({
                mutationKey: ['google login'],
                mutationFn: (body) => {
                        MyCookies.removeAll()
                        return authClient.post(`/google/login`, body)
                },
                onSuccess: (data) => {
                        const authData = { ...data?.tokens }

                        const hostname = window.location.hostname
                        const domain = hostname.endsWith('.synccos.com') || hostname === 'synccos.com'
                                ? '.synccos.com'
                                : hostname

                        // Set cookies using MyCookies class
                        MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, authData.refreshToken, {
                                expires: 7
                        })

                        MyCookies.set(MyCookies.KEYS.DIRECT_TOKEN, authData.accessToken, {
                                expires: 1,
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

                        MyCookies.set(MyCookies.KEYS.USER_ROLE, data?.role)

                        dispatch(login({ token: authData.accessToken }))
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: `${'Google login successful.'}`,
                                        severity: 'success'
                                })
                        )

                        const enableMfa = JSON.parse(data.enableMfa)
                        MyCookies.set(MyCookies.KEYS.ENABLE_MFA, enableMfa)

                        const alreadyValidMfa = isMfaWindowValidFromToken(authData.accessToken)
                        if (alreadyValidMfa) {
                                MyCookies.set(MyCookies.KEYS.MFA_VERIFIED, true)
                        }
                        let targetPathname = enableMfa && !alreadyValidMfa
                                        ? '/mfa/validate'
                                        : redirecrUrl || '/dashboard/main'
                        history.push({
                                pathname: targetPathname,

                                state: { showModal: true }
                        })
                        localStorage.setItem('isFirstTimeSignUp', false)
                }
        })
}

export default useGoogleSignin

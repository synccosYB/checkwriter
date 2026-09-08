import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/loginLogout'
import { updateSnackbar } from '../../redux/snackbarState'
import { isMfaWindowValidFromToken } from '../../utils/helper'

function useSignin() {
        const history = useHistory()
        const dispatch = useDispatch()
        const location = useLocation()

        // Helper to extract specific query param
        const getQueryParam = (key) => {
                const params = new URLSearchParams(location.search)
                return params.get(key)
        }

        return useMutation({
                mutationKey: ['auth login'],
                mutationFn: (body) => {
                        MyCookies.removeAll()
                        return authClient.post(`/login`, body)
                },
                onSuccess: (data) => {
                        const authData = { ...data?.tokens }

                        const hostname = window.location.hostname
                        const domain = hostname.endsWith('.synccos.com') || hostname === 'synccos.com'
                                ? '.synccos.com'
                                : hostname

                        // Set necessary cookies
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
                        MyCookies.set(MyCookies.KEYS.ENABLE_MFA, JSON.parse(data.enableMfa))

                        dispatch(login({ token: authData.accessToken }))
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Login successful',
                                        severity: 'success'
                                })
                        )

                        // Get redirect path from query param (if any)
                        const customRedirect = getQueryParam('redirectUrl') || '/'
                        // Check if MFA is already validated from token
                        const alreadyValidMfa = isMfaWindowValidFromToken(authData.accessToken)
                        if(alreadyValidMfa){
                                MyCookies.set(MyCookies.KEYS.MFA_VERIFIED, true)
                        }
                        const finalPath =
                                data?.enableMfa && !alreadyValidMfa ? '/mfa/validate' : customRedirect
                        // Pass redirectUrl in the query params for PrivateRoute to use
                        history.push({
                                pathname: '/',
                                search: `?redirectUrl=${encodeURIComponent(customRedirect)}`, // Add redirectUrl query param here
                                state: { from: location }
                        })

                        localStorage.setItem('isFirstTimeSignUp', false)
                },
                onError: (error) => {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Login failed. Please try again.',
                                        severity: 'error'
                                })
                        )
                        console.error('Login error:', error)
                }
        })
}

export default useSignin

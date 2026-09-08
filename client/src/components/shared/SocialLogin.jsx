import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Button, CircularProgress } from '@mui/material'
import { googleIcon } from '../../assets/svg'
import { authSecondaryButtonSx } from '../../styles/authStyles'

import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { useHistory } from 'react-router-dom'

import axios from 'axios'

import useGoogleSignin from '../../API/auth/useGoogleSignin'
import useVerifyIfUserExists from '../../API/auth/useVerifyIfUserExists'

const SocialLoginInner = () => {
        const { mutate: checkUser } = useVerifyIfUserExists()
        const { mutate: login } = useGoogleSignin()
        const dispatch = useDispatch()
        const history = useHistory()
        const [isLoading, setIsLoading] = useState(false)

        const googleLogin = useGoogleLogin({
                onSuccess: async (tokenResponse) => {
                        try {
                                setIsLoading(true)
                                const { access_token } = tokenResponse

                                const userInfo = await axios.get(
                                        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
                                        {
                                                headers: {
                                                        Authorization: `Bearer ${access_token}`,
                                                        Accept: 'application/json'
                                                }
                                        }
                                )

                                const { data } = userInfo
                                await userExist(
                                        data?.email,
                                        'google',
                                        {
                                                googleAuthToken: access_token
                                        },
                                        {
                                                firstName: data?.given_name,
                                                lastName: data?.family_name,
                                                email: data?.email
                                        }
                                )
                        } catch (err) {
                                console.error('Google login error:', err)
                                dispatch(
                                        updateSnackbar({
                                                open: true,
                                                message: 'Google sign-in failed. Please try again.',
                                                severity: 'error'
                                        })
                                )
                        } finally {
                                setIsLoading(false)
                        }
                },
                onError: (error) => {
                        console.error('Google login error:', error)
                        setIsLoading(false)
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Google sign-in failed. Please try again.',
                                        severity: 'error'
                                })
                        )
                }
        })

        ///Function to check if user exist
        const userExist = async (email, loginType, body, userData = {}) => {
                try {
                        checkUser(
                                { email },
                                {
                                        onSuccess: (res) => {
                                                if (res?.code === 'DB_CONNECTION_ERROR') {
                                                        dispatch(
                                                                updateSnackbar({
                                                                        open: true,
                                                                        message: res?.error || 'Service temporarily unavailable. Please try again later.',
                                                                        severity: 'error'
                                                                })
                                                        )
                                                        setIsLoading(false)
                                                        return
                                                }
                                                if (!res?.isUser) {
                                                        history.push({
                                                                pathname: '/auth/create-profile',
                                                                state: {
                                                                        authData: { ...body },
                                                                        userData: { ...userData },
                                                                        loginType
                                                                }
                                                        })
                                                } else {
                                                        if (loginType === 'google') {
                                                                login(body)
                                                        }
                                                }
                                        },
                                        onError: (error) => {
                                                const message = error?.response?.data?.error || 'Service temporarily unavailable. Please try again later.'
                                                dispatch(
                                                        updateSnackbar({
                                                                open: true,
                                                                message,
                                                                severity: 'error'
                                                        })
                                                )
                                                setIsLoading(false)
                                        }
                                }
                        )
                } catch (error) {
                        console.error('User verification error:', error)
                        if (error?.response?.data === 'User not found') {
                        } else {
                                dispatch(
                                        updateSnackbar({
                                                open: true,
                                                message: 'Failed to verify user. Please try again.',
                                                severity: 'error'
                                        })
                                )
                        }
                }
        }

        const buttonTitle = history.location.pathname.includes('/login')
                ? 'Sign in with Google'
                : 'Sign up with Google'

        const loadingText = history.location.pathname.includes('/login')
                ? 'Signing in...'
                : 'Signing up...'

        return (
                <div className="social-login">
                        <Button
                                className="social-btn d-flex flex-row align-items-center justify-content-center"
                                sx={{
                                        ...authSecondaryButtonSx,
                                        borderRadius: '8px !important',
                                }}
                                onClick={googleLogin}
                                disabled={isLoading}
                        >
                                {isLoading ? (
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                ) : (
                                        <span className="icon me-2">{googleIcon}</span>
                                )}
                                {isLoading ? loadingText : buttonTitle}
                        </Button>
                </div>
        )
}

const SocialLogin = () => {
        if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
                return null
        }
        return <SocialLoginInner />
}

export default SocialLogin

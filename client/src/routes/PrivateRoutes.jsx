import React from 'react'
import { Route, Redirect, useLocation } from 'react-router-dom'
import { MyCookies } from '../utils/cookies/Cookies'
import { MySessionStorage } from '../utils/sessionStorage/sessionStorageService'

const PrivateRoute = ({ component: Component, ...rest }) => {
        const isLoggedin = MyCookies.get(MyCookies.KEYS.USER_STATUS) ? true : false
        const isMfaEnabled = JSON.parse(MyCookies.get(MyCookies.KEYS.ENABLE_MFA) || 'false')
        const isMfaVerified = JSON.parse(MyCookies.get(MyCookies.KEYS.MFA_VERIFIED) || 'false')
        const location = useLocation()

        const redirectUrl = MySessionStorage.get(MySessionStorage.KEYS.REDIRECT_URL)

        // If user is NOT logged in: redirect to login
        if (!isLoggedin) {
                return (
                        <Redirect to={{ pathname: '/auth/login', state: { from: location } }} />
                )
        }

        // User is logged in but tries to access login page
        if (location.pathname === '/auth/login') {
                // Redirect to home or dashboard
                return (
                        <Redirect
                                to={{ pathname: '/dashboard/main', state: { from: location } }}
                        />
                )
        }

        // Handle MFA cases for logged-in users
        if (isMfaEnabled) {
                // If MFA is enabled but not verified
                if (!isMfaVerified) {
                        // Redirect to MFA validation if not already there
                        if (location.pathname !== '/mfa/validate') {
                                return (
                                        <Redirect
                                                to={{ pathname: '/mfa/validate', state: { from: location } }}
                                        />
                                )
                        }
                }
                // If MFA is enabled and already verified but user tries to access validation page
                else if (location.pathname === '/mfa/validate') {
                        // Redirect to home or dashboard
                        return (
                                <Redirect
                                        to={{
                                                pathname: redirectUrl ? redirectUrl : '/dashboard/main',
                                                state: { from: location }
                                        }}
                                />
                        )
                }
        }
        // If MFA is not enabled and user tries to access validation page
        else if (location.pathname === '/mfa/validate') {
                // Redirect to home or dashboard
                return (
                        <Redirect
                                to={{
                                        pathname: '/dashboard/main',
                                        state: { from: location }
                                }}
                        />
                )
        }

        // For all other cases:
        // - User is logged in with MFA enabled and verified
        // - User is logged in without MFA
        // Render the protected component
        return <Route {...rest} render={(props) => <Component {...props} />} />
}

export default PrivateRoute

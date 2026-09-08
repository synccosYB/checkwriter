import { useEffect, useState } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

import AppRoutes from './routes'
import AppLayout from './components/Layout/AppLayout'
import ErrorBoundary from './utils/hoc/ErrorBoundary'
import NoInternetConnection from './pages/NoInternetConnection'
import SubscriptionErrorModal from './components/shared/Modals/SubscriptionErrorModal'
import ProgressWorkModal from './components/shared/Modals/ProgressWorkModal'
import Tidio from './utils/Tidio'
import DemoRestrictionModal from './components/shared/DemoRestrictionModal'

import { closeSnackbar } from './redux/snackbarState'

import { checkData } from './redux/loginLogout'
import { updateSelectedOrganization } from './redux/appData'
import { setSubscriptionModalCallback } from './utils/errorHandler'
import { MyCookies } from './utils/cookies/Cookies'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './App.css'
import './styles/ContentPageStyles.css'
import './styles/CompanyFormStyles.css'
import './styles/IntegrationsStyle.css'
import 'react-phone-input-2/lib/material.css'

interface RootState {
        snackbarState: {
                open: boolean
                message: string
                severity: AlertColor
        }
        loginLogout: {
                isLoggedIn: boolean
        }
}

const GoogleOAuthProviderTyped = GoogleOAuthProvider as React.FC<any>

const App = () => {
        const dispatch = useDispatch()
        const history = useHistory()


        const { open, message, severity } = useSelector(
                (state: RootState) => state.snackbarState
        )

        const isLoggedIn = useSelector(
                (state: RootState) => state.loginLogout.isLoggedIn
        )

        const [isOnline, setIsOnline] = useState(navigator.onLine)
        const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
        const [showDemoModal, setShowDemoModal] = useState(false)

        // Consolidated network connection effect
        useEffect(() => {
                const handleOnline = () => setIsOnline(true)
                const handleOffline = () => setIsOnline(false)

                window.addEventListener('online', handleOnline)
                window.addEventListener('offline', handleOffline)

                return () => {
                        window.removeEventListener('online', handleOnline)
                        window.removeEventListener('offline', handleOffline)
                }
        }, [])

        // Listen for demo restriction events from API layer
        useEffect(() => {
                const handleDemoRestriction = () => setShowDemoModal(true)
                window.addEventListener('demoRestriction', handleDemoRestriction)
                return () => window.removeEventListener('demoRestriction', handleDemoRestriction)
        }, [])

        // Consolidated authentication and data fetching effect
        useEffect(() => {
                // Initial data check
                dispatch(checkData(undefined))

                // Token refresh and periodic checks
                let tokenRefreshInterval = null

                // Periodic data fetching
                let dataFetchInterval = null
                const fetchData = () => {
                        dispatch(
                                updateSelectedOrganization(
                                        MyCookies?.get(MyCookies.KEYS.ORGANIZATION) || null
                                )
                        )
                }

                if (isLoggedIn && isOnline) {
                        fetchData()
                        dataFetchInterval = setInterval(() => {
                                if (isOnline) fetchData()
                        }, 1000 * 60 * 30)
                }

                // Direct token handling
                const handleDirectTokenLogin = async () => {
                        if (
                                MyCookies.get(MyCookies.KEYS.DIRECT_TOKEN_REF) !== 'checkwriter' &&
                                MyCookies.get(MyCookies.KEYS.DIRECT_TOKEN) &&
                                !MyCookies.get(MyCookies.KEYS.ACCESS_TOKEN)
                        ) {
                                try {
                                        const directToken = MyCookies.get(MyCookies.KEYS.DIRECT_TOKEN)
                                        const res = await fetch(
                                                `${process.env.REACT_APP_BASE_URL}/auth/verifyuser-and-getnewtoken`,
                                                {
                                                        method: 'POST',
                                                        headers: {
                                                                Authorization: `${directToken}`,
                                                                'Content-Type': 'application/json'
                                                        }
                                                }
                                        )

                                        if (res.status === 200) {
                                                const data = await res.json()
                                                MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
                                                        expires: 1 / 24
                                                })
                                                MyCookies.set(MyCookies.KEYS.REFRESH_TOKEN, data.refreshToken, {
                                                        expires: 12 / 24
                                                })
                                                localStorage.setItem('user', JSON.stringify(data))
                                                MyCookies.set(MyCookies.KEYS.USER_STATUS, true, {
                                                        expires: 12 / 24
                                                })

                                                history.push({
                                                        pathname: '/dashboard/main',
                                                        state: { showModal: true }
                                                })
                                                window.location.reload()
                                        }
                                } catch (error) {
                                        console.error('Error fetching new tokens:', error)
                                }
                        }
                }

                handleDirectTokenLogin()

                // Set up subscription modal callback
                setSubscriptionModalCallback((show: boolean) => {
                        setShowSubscriptionModal(show)
                })

                // Cleanup intervals
                return () => {
                        if (tokenRefreshInterval) clearInterval(tokenRefreshInterval)
                        if (dataFetchInterval) clearInterval(dataFetchInterval)
                }
        }, [isLoggedIn, isOnline, dispatch, history])

        const handleContinueLimited = () => {
                setShowSubscriptionModal(false)
        }

        if (!isOnline) {
                return <NoInternetConnection />
        }

        return (
                <ErrorBoundary>
                        <GoogleOAuthProviderTyped
                                clientId={`${process.env?.REACT_APP_GOOGLE_CLIENT_ID}`}
                                nonce=""
                                onScriptLoadError={() => {}}
                                onScriptLoadSuccess={() => {}}
                        >
                                <AppLayout>
                                        <AppRoutes />
                                        <Snackbar
                                                open={open}
                                                autoHideDuration={2500}
                                                onClose={() => dispatch(closeSnackbar())}
                                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        >
                                                <Alert
                                                        onClose={() => dispatch(closeSnackbar())}
                                                        severity={severity}
                                                        sx={{ width: '100%' }}
                                                >
                                                        {message}
                                                </Alert>
                                        </Snackbar>
                                        <ProgressWorkModal />
                                        <Tidio />
                                        <SubscriptionErrorModal
                                                open={showSubscriptionModal}
                                                onClose={() => setShowSubscriptionModal(false)}
                                                onContinueLimited={handleContinueLimited}
                                        />
                                        <DemoRestrictionModal
                                                open={showDemoModal}
                                                onClose={() => setShowDemoModal(false)}
                                        />
                                </AppLayout>
                        </GoogleOAuthProviderTyped>
                </ErrorBoundary>
        )
}

export default App

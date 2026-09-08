import React from 'react'
import ReactDOM from 'react-dom/client'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App'
import theme from './theme'
import { LoadScript } from '@react-google-maps/api'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import store from './redux/store'
import TagManager from 'react-gtm-module'
export const queryClient = new QueryClient()

if (typeof window !== 'undefined') {
        if (!window.google) window.google = {}
        if (!window.google.maps) window.google.maps = {}
        if (!window.google.maps.places) {
                // eslint-disable-next-line no-useless-constructor
                class StubAutocomplete { constructor() {} addListener() {} setFields() {} getPlace() { return {} } }
                // eslint-disable-next-line no-useless-constructor
                class StubService { constructor() {} getPlacePredictions() {} }
                window.google.maps.places = { Autocomplete: StubAutocomplete, AutocompleteService: StubService }
                window.google.maps.__stub = true
        }
        if (!window.google.maps.event) {
                window.google.maps.event = {
                        addListener() { return { remove() {} } },
                        removeListener() {},
                        clearInstanceListeners() {},
                        addDomListener() { return { remove() {} } },
                        trigger() {}
                }
                if (!window.google.maps.__stub) window.google.maps.__stub = true
        }
}

if (process.env?.REACT_APP_GTM_ID && process.env?.REACT_APP_GTM_ID !== '') {
        const tagManagerArgs = {
                gtmId: process.env?.REACT_APP_GTM_ID
        }

        TagManager.initialize(tagManagerArgs)
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
        <QueryClientProvider client={queryClient}>
                <Router>
                        <Provider store={store}>
                                {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
                                        <LoadScript
                                                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                                                libraries={['places']}
                                        >
                                                <StyledEngineProvider injectFirst>
                                                        <ThemeProvider theme={theme}>
                                                                <CssBaseline />
                                                                <App />
                                                        </ThemeProvider>
                                                </StyledEngineProvider>
                                        </LoadScript>
                                ) : (
                                        <StyledEngineProvider injectFirst>
                                                <ThemeProvider theme={theme}>
                                                        <CssBaseline />
                                                        <App />
                                                </ThemeProvider>
                                        </StyledEngineProvider>
                                )}
                        </Provider>
                </Router>
                <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
)

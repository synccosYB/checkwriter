import React from 'react'
import Header from './Header/Header'
import Footer from './Footer/Footer'

import './Layout.css'
import { useLocation } from 'react-router'
import AlternateHeader from './Header/AlternateHeader'

const AppLayout = (props) => {
        const location = useLocation()

        return (
                <>
                        <div className="main-container container-fluid p-0 m-0">
                                {location.pathname.includes('/auth') ||
                                location.pathname.includes('/dashboard') ||
                                location.pathname.includes('/subscription') ||
                                location.pathname.includes('/subscription/failure') ||
                                location.pathname.includes('not-found') || location.pathname.includes('/thank-you') ||
                                location.pathname.includes('/create-organization') ? (
                                        location.pathname.includes('/create-organization') ? (
                                                <AlternateHeader />
                                        ) : null
                                ) : (
                                        <Header />
                                )}

                                {props.children}
                                {location.pathname.includes('/auth') ||
                                location.pathname.includes('/dashboard') ||
                                location.pathname.includes('/subscription') ||
                                location.pathname.includes('/subscription/failure') || location.pathname.includes('/thank-you') ||
                                location.pathname.includes('not-found') ||
                                location.pathname.includes('/create-organization') ? null : (
                                        <Footer />
                                )}
                        </div>
                </>
        )
}

export default AppLayout

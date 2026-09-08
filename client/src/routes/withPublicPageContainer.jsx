import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { MySessionStorage } from '../utils/sessionStorage/sessionStorageService'
import { MyCookies } from '../utils/cookies/Cookies'

function withPublicPageContainer(WrappedComponent) {
	return function EnhancedComponent(props) {
		const history = useHistory()
		const location = useLocation()
		const isLoggedin = MyCookies.get(MyCookies.KEYS.USER_STATUS) ? true : false

		const redirectUrlFromParams = MySessionStorage.get(
			MySessionStorage.KEYS.REDIRECT_URL
		)

		useEffect(() => {
			if (
				isLoggedin &&
				(location.pathname === '/auth/login' ||
					location.pathname === '/auth/sign-up')
			) {
				if (redirectUrlFromParams) {
					history.push(redirectUrlFromParams)
				} else {
					history.push('/dashboard/main')
				}
			}
		}, [isLoggedin, location.pathname, history, redirectUrlFromParams])

		return (
			<div>
				<WrappedComponent {...props} />
			</div>
		)
	}
}

export default withPublicPageContainer

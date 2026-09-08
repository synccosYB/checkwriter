import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { MyCookies } from '../utils/cookies/Cookies'

const AdminRoute = ({ component: Component, ...rest }) => {
	const isLoggedin = !!MyCookies.get(MyCookies.KEYS.USER_STATUS)
	const isAdmin = MyCookies.get(MyCookies.KEYS.USER_ROLE) === 'superadmin'

	return (
		<Route
			{...rest}
			render={(props) =>
				isLoggedin && isAdmin ? (
					<Component {...props} />
				) : (
					<Redirect
						to={{
							pathname: isLoggedin ? '/auth/unauthorized' : '/auth/login',
							state: { from: props.location }
						}}
					/>
				)
			}
		/>
	)
}

export default AdminRoute

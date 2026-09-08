import React from 'react'
import { Route, Switch } from 'react-router'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import ForgetPassword from '../pages/ForgetPassword'
import NewPassword from '../pages/NewPassword'
import OTPVerify from '../pages/OTPVerify'
import CreateProfile from '../pages/CreateProfile'

const AuthRoutes = () => {
	return (
		<Switch>
			<Route exact path="/auth/login" component={Login} />
			<Route exact path="/auth/sign-up" component={SignUp} />
			<Route exact path="/auth/forget-password" component={ForgetPassword} />
			<Route exact path="/auth/reset-password" component={NewPassword} />
			<Route exact path="/auth/verify-otp" component={OTPVerify} />
			<Route exact path="/auth/create-profile" component={CreateProfile} />
		</Switch>
	)
}

export default AuthRoutes

import React from 'react'
import { Switch } from 'react-router-dom/cjs/react-router-dom'
import PrivateRoute from './PrivateRoutes'
import Payments from '../pages/Integrations/Payments'

const IntegrationsRoutes = () => {
	return (
		<Switch>
			<PrivateRoute
				exact
				path="/dashboard/integrations/payments"
				component={Payments}
			/>
		</Switch>
	)
}

export default IntegrationsRoutes

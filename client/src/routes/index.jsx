import React from 'react'
import { Route, Switch, Redirect } from 'react-router'
import Terms from '../pages/Terms'
import AuthLayout from '../components/Layout/AuthLayout'
import DashboardLayout from '../components/Layout/DashboardLayout'
import PrivateRoute from './PrivateRoutes'
import Privacy from '../pages/Privacy'
import NotFound from '../pages/NotFound'
import CreateOrganization from '../pages/CreateOrganization'
import Mfa from '../pages/Mfa'
import SubscriptionConfirmationTrial from '../components/redirect/SubscriptionConfirmationTrial'
import SubscriptionConfirmationSubscription from '../components/redirect/SubscriptionConfirmationSubscription'
import DemoLanding from '../pages/DemoLanding'

const AppRoutes = () => {
        return (
                <Switch>
                        <Route exact path="/terms" component={Terms} />
                        <Route exact path="/privacy" component={Privacy} />
                        <Route exact path="/demo" component={DemoLanding} />
                        <Route path="/auth" component={AuthLayout} />
                        <PrivateRoute
                                exact
                                path="/create-organization"
                                component={CreateOrganization}
                        />
                        <PrivateRoute path="/dashboard" component={DashboardLayout} />

                        <PrivateRoute exact path="/mfa/validate" component={Mfa} />
                        <PrivateRoute
                                exact
                                path="/thank-you/trial"
                                component={SubscriptionConfirmationTrial}
                        />
                        <PrivateRoute
                                exact
                                path="/thank-you/subscription"
                                component={SubscriptionConfirmationSubscription}
                        />
                        <Route path="/not-found" component={NotFound} />
                        <Redirect to="/dashboard/main" />
                </Switch>
        )
}

export default AppRoutes

import React from 'react'
import { Switch, Redirect } from 'react-router'
import Payee from '../pages/PayeeList'
import MyChecks from '../pages/MyChecks'
import MyProfile from '../pages/MyProfile'
import MyTags from '../pages/MyTags'
import CreatePaymentLinks from '../pages/CreatePaymentLinks'
import PrivateRoute from './PrivateRoutes'
import Dashboard from '../pages/Dashboard/Dashboard'
import Buisness from '../pages/Buisness'
import ManageOrganization from '../pages/ManageOrganization'
import PaymentLinks from '../pages/PaymentLinks'
import Integrations from '../pages/Integrations'
import CheckRegister from '../pages/CheckRegister/CheckRegister'
import InvoiceChecks from '../pages/invoiceChecks'
import UserManagement from '../pages/UserManagement'
import BanksPage from '../pages/Bank/index'
import AdminRoute from './AdminRoutes'
import AllMails from '../pages/AllMails'
import MailTrackingPage from '../pages/MailTracking'
import MailManagement from '../pages/MailManagement'
import AdminDashboard from '../pages/Admin/Dashboard'
import QuickBooks from '../pages/QuickBooks'
import SubscriptionManagement from '../pages/SubscriptionManagement'
import ChecksManagement from '../pages/Admin/ChecksManagement'
import BanksManagement from '../pages/Admin/BanksManagement'
import PayeesManagement from '../pages/Admin/PayeesManagement'
import TransactionsManagement from '../pages/Admin/TransactionsManagement'
import OrganizationsManagement from '../pages/Admin/OrganizationsManagement'
import AuditLogs from '../pages/Admin/AuditLogs'
import PlatformSettings from '../pages/Admin/PlatformSettings'
import IntegrationsOverview from '../pages/Admin/IntegrationsOverview'
import AttachmentsImports from '../pages/Admin/AttachmentsImports'
import RefundsManagement from '../pages/Admin/RefundsManagement'
import ScheduledJobRuns from '../pages/Admin/ScheduledJobRuns'

const enableQbo = JSON.parse(
        process.env.REACT_APP_ENABLE_QBO_INTEGRATION || false
)

const DashboardRoutes = () => {
        return (
                <Switch>
                        <PrivateRoute
                                exact
                                path={['/dashboard', '/dashboard/main']}
                                component={Dashboard}
                        />
                        <PrivateRoute
                                exact
                                path="/dashboard/my-checks/:status?"
                                component={MyChecks}
                        />
                        <PrivateRoute
                                exact
                                // path="/dashboard/my-checks/:status?"
                                path="/dashboard/check-register"
                                component={CheckRegister}
                        />

                        <PrivateRoute
                                exact
                                path="/dashboard/payment-links/:status?"
                                component={PaymentLinks}
                        />

                        {enableQbo && (
                                <PrivateRoute
                                        exact
                                        path="/dashboard/quickbooks"
                                        component={QuickBooks}
                                />
                        )}

                        <PrivateRoute
                                exact
                                path="/dashboard/bank-accounts"
                                component={BanksPage}
                        />
                        <PrivateRoute exact path="/dashboard/payees" component={Payee} />
                        <PrivateRoute exact path="/dashboard/profile" component={MyProfile} />
                        <PrivateRoute exact path="/dashboard/my-tags" component={MyTags} />
                        <PrivateRoute
                                exact
                                path={[
                                        '/dashboard/create-organization',
                                        '/dashboard/update-organization'
                                ]}
                                component={Buisness}
                        />
                        <PrivateRoute
                                exact
                                path="/dashboard/manage-organizations"
                                component={ManageOrganization}
                        />

                        <PrivateRoute
                                exact
                                path="/dashboard/create-payment-links"
                                component={CreatePaymentLinks}
                        />
                        <PrivateRoute
                                exact
                                path="/dashboard/Invoicechecks"
                                component={InvoiceChecks}
                        />
                        <PrivateRoute exact path="/dashboard/all-orders" component={AllMails} />
                        <PrivateRoute path="/dashboard/mail-tracking/:lobId" component={MailTrackingPage} />

                        <PrivateRoute
                                exact
                                path="/dashboard/mail-management"
                                component={MailManagement}
                        />
                        <PrivateRoute path="/dashboard/integrations" component={Integrations} />
                        <PrivateRoute path="/dashboard/subscription-management" component={SubscriptionManagement} />

                        <AdminRoute
                                path="/dashboard/user-management"
                                component={UserManagement}
                        />
                        <AdminRoute exact path="/dashboard/admin" component={AdminDashboard} />
                        <AdminRoute exact path="/dashboard/admin/checks" component={ChecksManagement} />
                        <AdminRoute exact path="/dashboard/admin/banks" component={BanksManagement} />
                        <AdminRoute exact path="/dashboard/admin/payees" component={PayeesManagement} />
                        <AdminRoute exact path="/dashboard/admin/transactions" component={TransactionsManagement} />
                        <AdminRoute exact path="/dashboard/admin/organizations" component={OrganizationsManagement} />
                        <AdminRoute exact path="/dashboard/admin/audit-logs" component={AuditLogs} />
                        <AdminRoute exact path="/dashboard/admin/platform-settings" component={PlatformSettings} />
                        <AdminRoute exact path="/dashboard/admin/integrations-overview" component={IntegrationsOverview} />
                        <AdminRoute exact path="/dashboard/admin/attachments-imports" component={AttachmentsImports} />
                        <AdminRoute exact path="/dashboard/admin/refunds" component={RefundsManagement} />
                        <AdminRoute exact path="/dashboard/admin/scheduled-job-runs" component={ScheduledJobRuns} />
                        <Redirect to="/not-found" />
                </Switch>
        )
}

export default DashboardRoutes

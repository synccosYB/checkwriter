import React from 'react'
import DashboardLayout from '../Layout/DashboardLayout'
import SubscriptionConfirmation from './SubscriptionConfirmation'

const SubscriptionConfirmationSubscription = () => {
	return (
		<DashboardLayout>
			<SubscriptionConfirmation trial={false} />
		</DashboardLayout>
	)
}

export default SubscriptionConfirmationSubscription

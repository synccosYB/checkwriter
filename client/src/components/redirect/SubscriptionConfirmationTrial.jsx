import React from 'react'
import DashboardLayout from '../Layout/DashboardLayout'
import SubscriptionConfirmation from './SubscriptionConfirmation'

const SubscriptionConfirmationTrial = () => {
	return (
		<DashboardLayout>
			<SubscriptionConfirmation trial={true} />
		</DashboardLayout>
	)
}

export default SubscriptionConfirmationTrial

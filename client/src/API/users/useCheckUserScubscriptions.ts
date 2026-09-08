import { useQuery } from '@tanstack/react-query'
import { usersClient } from './userClient'

export interface SubscriptionResponse {
	isSubscribed: boolean
	isTrialPeriod: boolean
	price: number
	subscriptionId?: string
	isActive: boolean
	cancelAtPeriodEnd?: boolean
	cancelDate?: number | null
	trialEndsAt?: number | null
	isScheduledToCancel?: boolean
	subscriptionStatus?: string
	subscriptionStatusText: string
	subscriptionMode: string
	cancelAt: number
	stripeSubscriptionId: string | null
	trialDays?: number
}

function useCheckUserScubscriptions(userId = '') {
	return useQuery({
		queryKey: ['User Subscription'],
		queryFn: () =>
			usersClient.get<SubscriptionResponse>(
				'/subscription',
				userId && { userId }
			)
	})
}

export default useCheckUserScubscriptions

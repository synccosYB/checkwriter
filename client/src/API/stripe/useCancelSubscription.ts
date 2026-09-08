import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

function useCancelSubscription() {
	return useMutation({
		mutationKey: ['cancelSubscription'],
		mutationFn: async () => striptClient.post('/cancel-subscription')
	})
}

export default useCancelSubscription

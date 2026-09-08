import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

function useReactivateSubscription() {
	return useMutation({
		mutationKey: ['reactivateSubscription'],
		mutationFn: async () => striptClient.post('/reactivate-subscription')
	})
}

export default useReactivateSubscription

import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

function useGenerateStripePortalLink() {
	return useMutation({
		mutationKey: ['Stripe Portal Link URL'],
		mutationFn: ({ userId }) =>
			striptClient.get('/get-stripe-portal-link', {
				domain: window.location.href,
				userId
			})
	})
}

export default useGenerateStripePortalLink

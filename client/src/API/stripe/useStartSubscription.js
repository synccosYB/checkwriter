import { useMutation } from '@tanstack/react-query'

import { striptClient } from './stripeClient'

function useStartSubscription() {
	return useMutation({
		mutationKey: ['Start subscription'],
		mutationFn: () =>
			striptClient.post('/create-subscription-session', {
				domain: `${window.location.origin}/thank-you/subscription`
			}),
		onSuccess: (data) => {
			window.location.replace(data?.url)
		}
	})
}

export default useStartSubscription

import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'
export default function useCancelTrial() {
	return useMutation({
		mutationKey: ['cancelTrial'],
		mutationFn: async () => striptClient.post('/cancel-trial')
	})
}

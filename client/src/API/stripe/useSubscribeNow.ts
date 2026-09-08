import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

function useSubscribeNow() {
	return useMutation({
		mutationKey: ['subscribeNow'],
		mutationFn: async () => striptClient.post('/subscribe-now')
	})
}

export default useSubscribeNow

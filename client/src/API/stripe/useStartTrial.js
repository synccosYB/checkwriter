import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

function useStartTrial() {
	return useMutation({
		mutationKey: ['Start Trial'],
		mutationFn: () =>
			striptClient.post('/start-trial-session', {
				domain: `${window.location.origin}/thank-you/trial`
			}),
		onSuccess: (data) => {
			window.location.replace(data?.url)
		}
	})
}

export default useStartTrial

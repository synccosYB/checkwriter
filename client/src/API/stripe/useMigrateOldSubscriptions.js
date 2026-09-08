import { useMutation } from '@tanstack/react-query'
import { striptClient } from './stripeClient'

function useMigrateOldSubscriptions() {
	return useMutation({
		mutationKey: ['migrateOldSubscriptions'],
		mutationFn: async () => striptClient.post('/migrate-old-subscriptions')
	})
}

export default useMigrateOldSubscriptions

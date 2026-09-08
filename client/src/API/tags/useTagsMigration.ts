import { useMutation } from '@tanstack/react-query'
import { tagsClient } from './tagsClient'

function useTagsMigration() {
	return useMutation({
		mutationKey: ['migrate old tags'],
		mutationFn: () => tagsClient.post('/migrate-old-tags', {})
	})
}

export default useTagsMigration

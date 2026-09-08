import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'

function useMarkCheckAsMailed() {
	return useMutation({
		mutationKey: ['mark as mailed'],
		mutationFn: (body) => adminClient.post(`/mark-checks-mailed`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					[
						'admin mail checks',
						'batch details',
						'admin mail batches',
						'mails stats'
					].some((key) => query.queryKey.includes(key))
			})
		}
	})
}

export default useMarkCheckAsMailed

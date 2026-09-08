import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'

function useCreateChecksBatch() {
	return useMutation({
		mutationKey: ['create a batch'],
		mutationFn: (body) => adminClient.post(`/create-check-batch`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['admin mail checks', 'mails stats'].some((key) =>
						query.queryKey.includes(key)
					)
			})
		}
	})
}

export default useCreateChecksBatch

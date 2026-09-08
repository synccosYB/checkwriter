import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

function useBatchDetails(batchId) {
	return useQuery({
		queryKey: ['batch details', batchId],
		queryFn: () => adminClient.get(`/batch-details/${batchId}`),
		enabled: !!batchId
	})
}

export default useBatchDetails

import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { isNotNullOrUndefined } from '../../utils/helper'

function useMailBatches({ page, pageSize } = {}) {
	const queryKey = ['admin mail batches']

	const queryParams = {}

	if (isNotNullOrUndefined(page) && pageSize) {
		queryParams.page = page + 1
		queryParams.pageSize = pageSize

		queryKey.push(page + 1, pageSize)
	}

	return useQuery({
		queryKey,
		queryFn: () => adminClient.get(`/mail-batches`, queryParams)
	})
}

export default useMailBatches

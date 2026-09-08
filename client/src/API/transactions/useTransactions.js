import { useQuery } from '@tanstack/react-query'
import { transactionsClient } from './transactionsClient'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'

function useTransactions({ bankId, pageSize, page }) {
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	const queryKey = ['transactions', bankId, ownerType, org]

	const queryParams = {}

	if (isNotNullOrUndefined(page) && pageSize) {
		queryParams.page = page + 1
		queryParams.pageSize = pageSize

		queryKey.push(page + 1, pageSize)
	}

	return useQuery({
		queryKey,
		queryFn: () =>
			transactionsClient.get(`/${ownerType}`, { bankId, ...queryParams }),
		enabled: !!bankId
	})
}

export default useTransactions

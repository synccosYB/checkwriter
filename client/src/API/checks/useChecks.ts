import { useQuery } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'
import { RootState } from '../../types/redux.types'

interface UseChecksParams {
	page?: number
	pageSize?: number
	searchParam?: string
	extraParams?: Record<string, any>
}

interface ChecksResponse {
	data: Record<string, any>[]
	totalCount: number
}

function useChecks({
	page,
	pageSize,
	searchParam,
	extraParams
}: UseChecksParams = {}) {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'

	const queryKey: (string | number)[] = ['checks', ownerType, org]

	const queryParams = {
		...(extraParams ?? {})
	}

	if (isNotNullOrUndefined(page) && pageSize) {
		queryParams.page = page + 1
		queryParams.pageSize = pageSize

		queryKey.push(page + 1, pageSize)
	}
	if (searchParam) {
		queryParams.search = searchParam
		queryKey.push(searchParam)
	}

	if (extraParams && typeof extraParams === 'object') {
		Object.entries(extraParams).forEach(([key, value]) => {
			queryKey.push(`${key}:${value}`)
		})
	}

	return useQuery({
		queryKey,
		queryFn: () =>
			checksClient.get<ChecksResponse>(`/${ownerType}`, queryParams)
	})
}

export default useChecks

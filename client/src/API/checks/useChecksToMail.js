import { useQuery } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'

function useChecksToMail({ page, pageSize } = {}) {
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	const queryKey = ['checks to mail', ownerType, org]

	const queryParams = {}

	if (isNotNullOrUndefined(page) && pageSize) {
		queryParams.page = page + 1
		queryParams.pageSize = pageSize

		queryKey.push(page + 1, pageSize)
	}
	return useQuery({
		queryKey,
		queryFn: () => checksClient.get(`/mailed/${ownerType}`, queryParams)
	})
}

export default useChecksToMail

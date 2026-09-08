import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { checksClient } from './checkClient'

function useCheckStats({ type, duration, startDate, endDate, organizationIds, includePersonalProfile }) {
	const org = useSelector((state) => state?.appData?.selectedOrganization)
	const ownerType = org ? 'organization' : 'user'

	const params = {
		type,
		startDate,
		endDate,
		duration,
		includePersonalProfile: organizationIds.length === 0 ? true : includePersonalProfile,
		...(organizationIds?.length ? { organizationIds } : {})
	}
	
	return useQuery({
		queryKey: ['check stats', ownerType, type, startDate, endDate, includePersonalProfile, organizationIds],
		queryFn: () =>
			checksClient.get(`/checks-stats/${ownerType}`, params)
	})
}

export default useCheckStats

import { useQuery } from '@tanstack/react-query'
import { groupsClient } from './groupsClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { GroupResponse } from './types'

function useGroups() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'

	const queryKey = ['groups', ownerType, org]

	return useQuery({
		queryKey,
		queryFn: () => groupsClient.get<GroupResponse[]>(`/${ownerType}`)
	})
}

export default useGroups

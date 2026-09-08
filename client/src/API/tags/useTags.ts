import { useQuery } from '@tanstack/react-query'
import { tagsClient } from './tagsClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { TagResponse } from './types'

function useTags() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'

	const queryKey = ['tags', ownerType, org]

	return useQuery({
		queryKey,
		queryFn: () => tagsClient.get<TagResponse[]>(`/${ownerType}`)
	})
}

export default useTags

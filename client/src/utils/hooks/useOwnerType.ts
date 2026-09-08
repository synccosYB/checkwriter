import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'

function useOwnerType() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'
	return { ownerType, org } as const
}

export default useOwnerType

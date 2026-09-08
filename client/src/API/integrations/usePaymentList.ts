import { useQuery } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'

function usePaymentList() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'

	const queryKey = ['payment links', ownerType, org]
	return useQuery({
		queryKey,
		queryFn: () => integrationsClient.get(`/getUserPayments/${ownerType}`)
	})
}

export default usePaymentList

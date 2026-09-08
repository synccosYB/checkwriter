import { useQuery } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { OwnerType } from '../../types/user.types';

interface UserStripeAccount {
	_id: string;
	ownerType: OwnerType;
	stripeAccountId: string;
}

function useStripeAccount() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useQuery({
		queryKey: ['stripe Account', ownerType, org],
		queryFn: () =>
			integrationsClient.get<{userAccount: UserStripeAccount}>(`/getUserStripeAccount/${ownerType}`, {})
	})
}

export default useStripeAccount

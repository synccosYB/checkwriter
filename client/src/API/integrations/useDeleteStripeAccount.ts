import { useMutation } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { queryClient } from '../..'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'

function useDeleteStripeAccount() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['delete stripe account', ownerType],
		mutationFn: ({ email }: { email: string }) =>
			integrationsClient.delete(`/deleteUserAccount/${ownerType}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['stripe Account'] })
		}
	})
}

export default useDeleteStripeAccount

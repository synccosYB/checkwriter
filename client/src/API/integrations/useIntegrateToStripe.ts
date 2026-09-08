import { useMutation } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'

function useIntegrateToStripe() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['integrate to stripe'],
		mutationFn: ({ ownerId }: { ownerId: string }) =>
			integrationsClient.get<{ url: string }>(`/get-oauth-link/${ownerType}`, {
				ownerId,
				redirectUrl: window.location.href
			}),
		onSuccess: ({ url }) => {
			window.open(url, '_blank')
		}
	})
}

export default useIntegrateToStripe

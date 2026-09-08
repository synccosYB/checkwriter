import { useMutation } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { queryClient } from '../..'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'

function useCancelPaymentLink() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['cancel payment link'],
		mutationFn: ({ id }: { id: string }) =>
			integrationsClient.post(`/${id}/${ownerType}/cancel`, {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['payment links'] })
		}
	})
}

export default useCancelPaymentLink

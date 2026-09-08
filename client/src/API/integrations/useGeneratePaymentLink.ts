import { useMutation } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { useDispatch, useSelector } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { RootState } from '../../types/redux.types'

function useGeneratePaymentLink() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['generate payment link', ownerType],
		mutationFn: (body) =>
			integrationsClient.post(`/generate-payment-link/${ownerType}`, body),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Payment Link generated.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to generate payment link.',
					severity: 'error'
				})
			)
		}
	})
}

export default useGeneratePaymentLink

import { useMutation } from '@tanstack/react-query'

import { integrationsClient } from './integraionsClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useMigratePaymentLinks() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['migrate old payment links'],
		mutationFn: () => integrationsClient.post(`/migrate-old-links`),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Payment Links migrated.',
					severity: 'success'
				})
			)
		}
	})
}

export default useMigratePaymentLinks

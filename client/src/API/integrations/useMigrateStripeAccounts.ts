import { useMutation } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useMigrateStripeAccounts() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['migrate stripe accounts'],
		mutationFn: () => integrationsClient.post(`/migrate-stripe-accounts`),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Stripe Accounts migrated.',
					severity: 'success'
				})
			)
		}
	})
}

export default useMigrateStripeAccounts

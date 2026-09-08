import { useMutation } from '@tanstack/react-query'
import { transactionsClient } from './transactionsClient'
import { useDispatch, useSelector } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'

function useUpdateTransactionStatus() {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['update transaction'],
		mutationFn: ({ transactionId, body }) => {
			return transactionsClient.put(
				`/${ownerType}/${transactionId}/status`,
				body
			)
		},
		onSuccess: () => {
			// Invalidate all transactions queries
			queryClient.invalidateQueries({
				queryKey: ['transactions'],
				exact: false
			})
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Transaction updated successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to update transaction',
					severity: 'error'
				})
			)
		}
	})
}

export default useUpdateTransactionStatus

import { useMutation } from '@tanstack/react-query'
import { transactionsClient } from './transactionsClient'
import { useDispatch, useSelector } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'

function useAddDeposit() {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['add deposit'],
		mutationFn: ({ body }) => transactionsClient.post(`/${ownerType}`, body),
		onSuccess: () => {
			// Invalidate all transactions queries with the specific pattern
			queryClient.invalidateQueries({
				queryKey: ['transactions'],
				exact: false
			})
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Deposit Success.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to add deposit',
					severity: 'error'
				})
			)
		}
	})
}

export default useAddDeposit

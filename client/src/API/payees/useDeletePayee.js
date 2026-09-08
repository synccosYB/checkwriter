import { useMutation } from '@tanstack/react-query'
import { payeesClient } from './payeesClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useDeletePayee() {
	const dispatch = useDispatch()

	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['delete a payee', ownerType],
		mutationFn: ({ id }) =>
			payeesClient.delete(`/deletePayee/${ownerType}/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['payees'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Payee deleted successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to delete payee.',
					severity: 'error'
				})
			)
		}
	})
}

export default useDeletePayee

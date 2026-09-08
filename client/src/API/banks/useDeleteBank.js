import { useMutation } from '@tanstack/react-query'

import { useDispatch, useSelector } from 'react-redux'
import { banksClient } from './banksClient'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useDeleteBank() {
	const dispatch = useDispatch()

	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['delete a bank'],
		mutationFn: ({ id }) =>
			banksClient.delete(`/deleteBank/${ownerType}/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['banks'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Bank deleted successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to delete bank',
					severity: 'error'
				})
			)
		}
	})
}

export default useDeleteBank

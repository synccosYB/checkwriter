import { useMutation } from '@tanstack/react-query'

import { payeesClient } from './payeesClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useUpdatePayee() {
	const dispatch = useDispatch()

	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['update payee'],
		mutationFn: ({ id, body }) =>
			payeesClient.put(`/updatePayee/${ownerType}/${id}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['payees'] })

			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Payee updated successfully.'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Unable to update Payee'
				})
			)
		}
	})
}

export default useUpdatePayee

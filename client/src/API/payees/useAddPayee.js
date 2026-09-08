import { useMutation } from '@tanstack/react-query'
import { payeesClient } from './payeesClient'
import { useDispatch, useSelector } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'

function useAddPayee() {
	const dispatch = useDispatch()

	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['add a paye'],
		mutationFn: ({ body }) => payeesClient.post(`/addPayee/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['payees'] })
			
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Payee added successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to add payee.',
					severity: 'error'
				})
			)
		}
	})
}

export default useAddPayee

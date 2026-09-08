import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useAddCheck() {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['add check'],
		mutationFn: (body) => checksClient.post(`/bulk/check/${ownerType}`, body),
		onSuccess: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Check added successfully.',
					severity: 'success'
				})
			)
		},
	})
}

export default useAddCheck

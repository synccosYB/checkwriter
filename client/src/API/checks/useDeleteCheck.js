import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useDeleteCheck() {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['delete a check'],
		mutationFn: (body) =>
			checksClient.delete(`/bulk-delete/${ownerType}`, body),
		onSuccess: (data) => {
			if (data.failedDeletions) {
				throw data
			}
			queryClient.invalidateQueries({ queryKey: ['checks'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Check deleted successfully.',
					severity: 'success'
				})
			)
		},
		onError: (data) => {
			dispatch(
				updateSnackbar({
					open: true,
					message: data?.message || 'Failed to delete check.',
					severity: 'error'
				})
			)
		}
	})
}

export default useDeleteCheck

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { useMutation } from '@tanstack/react-query'
import { tagsClient } from './tagsClient'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useDeleteTag() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['delete tag'],
		mutationFn: (id: string) => tagsClient.delete(`/${ownerType}/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Tag deleted successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to delete tag',
					severity: 'error'
				})
			)
		}
	})
}

export default useDeleteTag

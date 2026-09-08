import { useMutation } from '@tanstack/react-query'
import { tagsClient } from './tagsClient'
import { RootState } from '../../types/redux.types'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import { UpdateTagPayload } from './types'

function useUpdateTag() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['update tag'],
		mutationFn: ({ body, id }: UpdateTagPayload) =>
			tagsClient.put(`/${ownerType}/${id}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Tag updated successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to update tag',
					severity: 'error'
				})
			)
		}
	})
}

export default useUpdateTag

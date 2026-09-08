import { useMutation } from '@tanstack/react-query'
import { tagsClient } from './tagsClient'
import { RootState } from '../../types/redux.types'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import { TagPayload } from './types'

function useCreateTag() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['create tag'],
		mutationFn: (body: TagPayload) => tagsClient.post(`/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Tag added successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to add tag',
					severity: 'error'
				})
			)
		}
	})
}

export default useCreateTag

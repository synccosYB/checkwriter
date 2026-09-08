import { useDispatch, useSelector } from 'react-redux'
import { groupsClient } from './groupsClient'
import { RootState } from '../../types/redux.types'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import { UpdateGroupPayload } from './types'

function useUpdateGroup() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['create group'],
		mutationFn: ({ id, body }: UpdateGroupPayload) =>
			groupsClient.put(`/${ownerType}/${id}`, body),

		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['groups', 'tags'].some((key) => query.queryKey.includes(key))
			})

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Group updated successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to update group',
					severity: 'error'
				})
			)
		}
	})
}

export default useUpdateGroup

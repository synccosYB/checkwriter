import { useMutation } from '@tanstack/react-query'
import { groupsClient } from './groupsClient'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import { GroupPayload } from './types'

function useCreateGroup() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['create group'],
		mutationFn: (body: GroupPayload) =>
			groupsClient.post(`/${ownerType}`, body),

		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['groups', 'tags'].some((key) => query.queryKey.includes(key))
			})

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Group added successfully.',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Failed to add group',
					severity: 'error'
				})
			)
		}
	})
}

export default useCreateGroup

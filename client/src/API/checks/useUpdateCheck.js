import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useUpdateCheck() {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['update a check'],
		mutationFn: ({ id, body }) =>
			checksClient.put(`/check/${ownerType}/${id}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries(['checks'])

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Check updated successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useUpdateCheck

import { useMutation } from '@tanstack/react-query'

import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { usersClient } from '../userClient'
import { updateSnackbar } from '../../../redux/snackbarState'
import { queryClient } from '../../..'

function useUpdateOrganization() {
	const dispatch = useDispatch()
	const history = useHistory()

	return useMutation({
		mutationKey: ['update organization'],
		mutationFn: ({ data, id }) =>
			usersClient.put(`user/updateOrganization/${id}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['organizations'] })

			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Organization updated successfully.'
				})
			)

			history.push('/dashboard/manage-organizations')
		}
	})
}

export default useUpdateOrganization

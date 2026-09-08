import { useMutation } from '@tanstack/react-query'

import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { usersClient } from '../userClient'
import { queryClient } from '../../..'
import { updateSnackbar } from '../../../redux/snackbarState'

function useAddOrganization() {
	const dispatch = useDispatch()
	const history = useHistory()
	return useMutation({
		mutationKey: ['add organization'],
		mutationFn: (body) => usersClient.post('/user/createOrganization', body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['organizations'] })

			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Organization created successfully.'
				})
			)

			history.push('/dashboard/manage-organizations')
		}
	})
}

export default useAddOrganization

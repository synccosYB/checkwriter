import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { usersClient } from '../userClient'
import { updateSnackbar } from '../../../redux/snackbarState'
import { queryClient } from '../../..'

function useDeleteOrganization() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['delete organization'],
		mutationFn: ({ id }) =>
			usersClient.delete(`/user/deleteOrganization/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['organizations'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Organization deleted.',
					severity: 'success'
				})
			)
		}
	})
}

export default useDeleteOrganization

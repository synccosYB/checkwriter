import { useMutation } from '@tanstack/react-query'
import { usersClient } from './userClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useUpdateUser() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['update user'],
		mutationFn: (body) => usersClient.put('/user', body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user info'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'User Data Updated successfully',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to Update.',
					severity: 'error'
				})
			)
		}
	})
}

export default useUpdateUser

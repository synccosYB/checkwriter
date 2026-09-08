import { useMutation } from '@tanstack/react-query'
import { authClientPrivate } from './authClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'

function useUpdatePassword() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['update password'],
		mutationFn: (body) => authClientPrivate.post('/update-password', body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user info'] })
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Password updated successfully.'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Fail to update pasword.'
				})
			)
		}
	})
}

export default useUpdatePassword

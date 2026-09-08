import { useMutation } from '@tanstack/react-query'
import { usersClient } from './userClient'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import { useDispatch } from 'react-redux'

function useUpdatePreferences() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['update preferences'],
		mutationFn: ({ type, body }) =>
			usersClient.put(`user/preferences/${type}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['user info', 'organizations'].some((key) =>
						query.queryKey.includes(key)
					)
			})

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Preferences Updated successfully',
					severity: 'success'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to Update Preferences',
					severity: 'error'
				})
			)
		}
	})
}

export default useUpdatePreferences

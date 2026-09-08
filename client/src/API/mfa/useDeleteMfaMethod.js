import { useMutation } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'
import { useDispatch } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import useUserInfo from '../users/useUserInfo'

function useDeleteMfaMethod() {
	const { data: user } = useUserInfo()
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['Delete Mfa Method'],
		mutationFn: (body) => mfaClient.delete(`/remove-method`, body),
		enabled: !!user?._id,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Mfa Methods'] })
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Mfa Method Deleted Successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useDeleteMfaMethod

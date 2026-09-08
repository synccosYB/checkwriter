import { useMutation } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useUpdateMfaMethod() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['Update Mfa Method'],
		mutationFn: (body) => mfaClient.put('/update-method', body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Mfa Methods'] })
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Default Mfa Method Updated Successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useUpdateMfaMethod

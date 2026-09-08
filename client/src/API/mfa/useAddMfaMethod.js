import { useMutation } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

function useAddMfaMethod() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['Add Mfa Method'],
		mutationFn: (body) => mfaClient.post('/add-method', body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['Mfa Methods'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'New Mfa Method Added Successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useAddMfaMethod

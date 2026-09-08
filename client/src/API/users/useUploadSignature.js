import { useMutation } from '@tanstack/react-query'
import { usersClient } from './userClient'
import { updateSnackbar } from '../../redux/snackbarState'
import { useDispatch } from 'react-redux'
import { queryClient } from '../..'

function useUploadSignature() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['upload signature'],
		mutationFn: ({ body, type }) =>
			usersClient.post(`user/signatureUpload/${type}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['user info', 'organizations', 'banks'].some((key) =>
						query.queryKey.includes(key)
					)
			})

			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Signature saved successfully.'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Unable to save signature successfully.'
				})
			)
		}
	})
}

export default useUploadSignature

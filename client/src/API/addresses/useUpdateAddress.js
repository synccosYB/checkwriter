import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { addressesClient } from './addressesClient'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'

function useUpdateAddress(ownerTypeProp = 'user') {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = ownerTypeProp
		? ownerTypeProp
		: org
		? 'organization'
		: 'user'

	return useMutation({
		mutationKey: ['addresses'],
		mutationFn: ({ body, id }) =>
			addressesClient.put(`/${ownerType}/${id}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['addresses'] })

			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Address updated Successfully'
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Unable to update address'
				})
			)
		}
	})
}

export default useUpdateAddress

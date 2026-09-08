import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { banksClient } from './banksClient'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useAddBank(countryCode) {
	const dispatch = useDispatch()

	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['add a bank'],
		mutationFn: (body) =>
			banksClient.post(`/addBank/${ownerType}/${countryCode}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['banks'] })

			dispatch(
				updateSnackbar({
					open: true,
					severity: 'success',
					message: 'Bank added successfully.'
				})
			)
		}
	})
}

export default useAddBank

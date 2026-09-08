import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useEmailChecks() {
	const org = useSelector((state) => state?.appData?.selectedOrganization)
	const dispatch = useDispatch()
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['send check as email', ownerType],
		mutationFn: (body) =>
			checksClient.post(`/sendEmailWithCheck/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['checks'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Checks emailed successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useEmailChecks

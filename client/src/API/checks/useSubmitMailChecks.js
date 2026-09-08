import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'

function useSubmitMailChecks() {
	const dispatch = useDispatch()
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['send check as email', ownerType],
		mutationFn: (body) => checksClient.post(`/mail/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['checks'] })
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Check(s) submitted for mailing successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useSubmitMailChecks

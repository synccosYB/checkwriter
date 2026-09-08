import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'

interface BulkVoidChecksPayload {
	checkIds: string[]
}

function useBulkVoidChecks() {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['void bulk checks'],
		mutationFn: (body: BulkVoidChecksPayload) =>
			checksClient.post(`/bulk-void-checks/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['checks'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Checks status successfully updated.',
					severity: 'success'
				})
			)
		}
	})
}

export default useBulkVoidChecks

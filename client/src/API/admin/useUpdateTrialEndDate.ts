import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
interface UpdatePricePayload {
	userId: string
	trialEndDate: string
}

function useUpdateTrialEndDate() {
	const dispatch = useDispatch()

	return useMutation({
		mutationKey: ['update trial end date'],
		mutationFn: ({ userId, trialEndDate }: UpdatePricePayload) =>
			adminClient.post(`/update-trial-end-date/${userId}`, { trialEndDate }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['register users info'].some((key) => query.queryKey.includes(key))
			})

			dispatch(
				updateSnackbar({
					open: true,
					message: `${'Trial end date updated successfully'}`,
					severity: 'success'
				})
			)
		}
	})
}

export default useUpdateTrialEndDate

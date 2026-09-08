import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import { adminClient } from './adminClient'

interface UpdatePricePayload {
	userId: string
	price: number // in cents
}

function useUpdateSubscriptionPrice() {
	const dispatch = useDispatch()
	return useMutation({
		mutationKey: ['update subscription price'],
		mutationFn: ({ price, userId }: UpdatePricePayload) =>
			adminClient.post(`/update-subscription-price/${userId}`, { price }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					['register users info'].some((key) => query.queryKey.includes(key))
			})

			dispatch(
				updateSnackbar({
					open: true,
					message: `${'Price update successfully'}`,
					severity: 'success'
				})
			)
		}
	})
}

export default useUpdateSubscriptionPrice

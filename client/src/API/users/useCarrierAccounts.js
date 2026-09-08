import { useMutation, useQuery } from '@tanstack/react-query'
import { usersClient } from './userClient'
import { queryClient } from '../..'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'

export function useCarrierAccounts() {
	return useQuery({
		queryKey: ['carrier-accounts'],
		queryFn: () => usersClient.get('/user/carrier-accounts'),
		staleTime: 1000 * 60 * 5,
	})
}

export function useUpdateCarrierAccounts() {
	const dispatch = useDispatch()
	return useMutation({
		mutationFn: (body) => usersClient.patch('/user/carrier-accounts', body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['carrier-accounts'] })
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Carrier account numbers updated successfully',
					severity: 'success',
				})
			)
		},
		onError: () => {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to update carrier account numbers',
					severity: 'error',
				})
			)
		},
	})
}

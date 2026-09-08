import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import { useDispatch } from 'react-redux'
import { ICheckImportRow } from './useImportRows'
import { updateSnackbar } from '../../redux/snackbarState'
import { queryClient } from '../..'
import useOwnerType from '../../utils/hooks/useOwnerType'

interface SaveRowsRequest {
	rows: ICheckImportRow[]
	importId: string
}

function useSaveRows() {
	const dispatch = useDispatch()
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['Save an import row'],
		mutationFn: (body: SaveRowsRequest) =>
			checkImportClient.post(`/saveRows/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['check import rows']
			})

			queryClient.invalidateQueries({ queryKey: ['check import'] })

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Rows Saved Successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useSaveRows

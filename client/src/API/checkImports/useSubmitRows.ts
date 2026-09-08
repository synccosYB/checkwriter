import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import { useDispatch } from 'react-redux'
import { queryClient } from '../..'
import { updateSnackbar } from '../../redux/snackbarState'
import useOwnerType from '../../utils/hooks/useOwnerType'
import { ICheckImportRow } from './useImportRows'

interface SubmitRowsRequest {
	rowIds: string[]
	importId: string
}

interface SubmitRowResponse {
	rows: ICheckImportRow[]
	result: any[]
}

function useSubmitRows() {
	const dispatch = useDispatch()
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['submit rows'],
		mutationFn: (body: SubmitRowsRequest) =>
			checkImportClient.post<SubmitRowResponse>(
				`/submitRows/${ownerType}`,
				body
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['checks']
			})

			queryClient.invalidateQueries({
				queryKey: ['check imports']
			})
			queryClient.invalidateQueries({
				queryKey: ['check import rows']
			})

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Rows Submitted Successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useSubmitRows

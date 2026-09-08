import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../redux/snackbarState'
import useOwnerType from '../../utils/hooks/useOwnerType'

interface ExportRowRequest {
	returnAs?: 'csv' | 'file'
	importId: string
}

function useExportRows() {
	const dispatch = useDispatch()
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['export the check imports'],
		mutationFn: ({ returnAs = 'csv', importId }: ExportRowRequest) =>
			checkImportClient.get(`/export/${ownerType}`, { returnAs, importId }),
		onSuccess: (response: any) => {
			const blob = new Blob([response.csvData], { type: 'text/csv' })

			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', response.fileName)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)

			dispatch(
				updateSnackbar({
					open: true,
					message: 'Checks exported successfully.',
					severity: 'success'
				})
			)
		}
	})
}

export default useExportRows

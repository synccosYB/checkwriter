import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { updateSnackbar } from '../../redux/snackbarState'

interface UseExportChecksParams {
	searchParam?: string
	extraParams?: Record<string, any>
}

function useExportChecksAsCsv({
	searchParam,
	extraParams
}: UseExportChecksParams = {}) {
	const dispatch = useDispatch()
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)

	const ownerType = org ? 'organization' : 'user'

	const queryParams = {
		...(extraParams ?? {})
	}

	if (searchParam) {
		queryParams.search = searchParam
	}

	if (extraParams && typeof extraParams === 'object') {
		Object.entries(extraParams).forEach(([key, value]) => {})
	}
	return useMutation({
		mutationKey: ['export checks as csv'],
		mutationFn: () =>
			checksClient.get<any>(`/export/${ownerType}`, queryParams, {
				responseType: 'blob'
			}),
		onSuccess: (response) => {
			try {
				const blob = new Blob([response], { type: 'text/csv' })

				const now = new Date()
				const pad = (n: number) => String(n).padStart(2, '0')
				const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
					now.getDate()
				)}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(
					now.getSeconds()
				)}`
				const filename = `checks_${timestamp}.csv`

				const url = window.URL.createObjectURL(blob)
				const link = document.createElement('a')
				link.href = url
				link.setAttribute('download', filename)
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
			} catch (err) {
				dispatch(
					updateSnackbar({
						open: true,
						message: 'Failed to export checks.',
						severity: 'error'
					})
				)
			}
		}
	})
}

export default useExportChecksAsCsv

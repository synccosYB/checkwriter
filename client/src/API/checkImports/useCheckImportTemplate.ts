import { useMutation } from '@tanstack/react-query'

import { checkImportClient } from './checkImportClient'

function useCheckImportTemplate() {
	return useMutation({
		mutationKey: ['check import template'],
		mutationFn: () =>
			checkImportClient.get('/download-template', undefined, {
				responseType: 'blob'
			}),
		onSuccess: (data: any) => {
			// Create a download link and trigger click
			const url = window.URL.createObjectURL(new Blob([data]))
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', 'check_import_template.csv')
			document.body.appendChild(link)
			link.click()

			// Clean up
			if (link.parentNode) {
				link.parentNode.removeChild(link)
			}
			window.URL.revokeObjectURL(url)
		}
	})
}

export default useCheckImportTemplate

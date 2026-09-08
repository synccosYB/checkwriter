import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'

function useGenerateCheckPdfAdmin() {
	return useMutation({
		mutationKey: ['generate pdf'],
		mutationFn: (body) =>
			adminClient.post(`/generate-check-pdf`, body, undefined, {
				responseType: 'blob'
			}),
		onSuccess: (pdfBuffer, variables) => {
			const url = window.URL.createObjectURL(
				new Blob([pdfBuffer], { type: 'application/pdf' })
			)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `check_batch_${variables.batchNumber}.pdf`)
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		}
	})
}

export default useGenerateCheckPdfAdmin

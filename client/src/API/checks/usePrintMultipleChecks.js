import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useSelector } from 'react-redux'
import { queryClient } from '../..'

function usePrintMultipleChecks() {
	const org = useSelector((state) => state?.appData?.selectedOrganization)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationKey: ['Print Multiple Checks'],
		mutationFn: (body) =>
			checksClient.post(`/print-multiple-checks/${ownerType}`, body),

		onSuccess: (response) => {
			const url = response?.url
			if (url) {
				const link = document.createElement('a')
				link.href = url

				link.setAttribute('target', '__blank')

				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				window.URL.revokeObjectURL(url)

				queryClient.invalidateQueries({ queryKey: ['checks'] })
			}
		}
	})
}

export default usePrintMultipleChecks

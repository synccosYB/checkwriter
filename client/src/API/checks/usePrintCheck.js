import { useMutation } from '@tanstack/react-query'

import { checksClient } from './checkClient'

function usePrintCheck() {
	return useMutation({
		mutationKey: ['Print a Check'],
		mutationFn: (body) => checksClient.get('/print-check', body)
	})
}

export default usePrintCheck

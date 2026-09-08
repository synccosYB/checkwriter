import { useQuery } from '@tanstack/react-query'
import { authClient } from './validationClient'

function useMaskedMFaMethods() {
	return useQuery({
		queryKey: ['Masked MFa Methos'],
		queryFn: () => authClient.get(`/mfa-methods`)
	})
}

export default useMaskedMFaMethods

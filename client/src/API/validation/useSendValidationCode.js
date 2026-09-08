import { useMutation } from '@tanstack/react-query'
import { authClient } from './validationClient'

function useSendValidationCode() {
	return useMutation({
		mutationKey: ['Validation Code'],
		mutationFn: (body) => authClient.post('/mfa/send-verification-code', body)
	})
}

export default useSendValidationCode

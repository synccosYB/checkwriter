import { useMutation } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'

function useSendVerificationOTP() {
	return useMutation({
		mutationKey: ['send otp'],
		mutationFn: (body) => mfaClient.post(`/send-otp/${body.methodType}`, body)
	})
}

export default useSendVerificationOTP

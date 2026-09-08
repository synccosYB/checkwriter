import { useMutation } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'

function useVerifyOtp() {
	return useMutation({
		mutationKey: ['verify otp'],
		mutationFn: (body) => mfaClient.post(`/verify-otp/${body.methodType}`, body)
	})
}

export default useVerifyOtp

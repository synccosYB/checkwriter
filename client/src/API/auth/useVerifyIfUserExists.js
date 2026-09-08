import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'

function useVerifyIfUserExists() {
	return useMutation({
		mutationKey: ['verify user existence'],
		mutationFn: ({ email }) => authClient.get('/user', { email })
	})
}

export default useVerifyIfUserExists

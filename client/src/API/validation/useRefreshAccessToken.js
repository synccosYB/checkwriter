import { useMutation } from '@tanstack/react-query'
import { authClient } from './authClient'
import { MyCookies } from '../../utils/cookies/Cookies'

function useRefreshAccessToken() {
	return useMutation({
		mutationKey: ['Refresh Token'],
		mutationFn: (body) => authClient.post('/refresh-token', body),
		onSuccess: (data) => {
			MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
				expires: 1 / 24
			})
		}
	})
}

export default useRefreshAccessToken

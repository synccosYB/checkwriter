import { useMutation } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'
import { queryClient } from '../..'
import { MyCookies } from '../../utils/cookies/Cookies'

function useEnableMfa() {
	return useMutation({
		mutationKey: ['mfa', 'enable'],
		mutationFn: (body) => mfaClient.post('/enable-mfa', body),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['Mfa Methods'] })
			MyCookies.set(MyCookies.KEYS.ACCESS_TOKEN, data.accessToken, {
				expires: 1 / 24
			})
		}
	})
}

export default useEnableMfa

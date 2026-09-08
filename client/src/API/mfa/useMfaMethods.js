import { useQuery } from '@tanstack/react-query'
import { mfaClient } from './mfaClient'
import useUserInfo from '../users/useUserInfo'

function useMfaMethods() {
	const { data: user } = useUserInfo()

	return useQuery({
		queryKey: ['Mfa Methods'],
		queryFn: () => mfaClient.get('/methods'),
		enabled: !!user?._id
	})
}

export default useMfaMethods

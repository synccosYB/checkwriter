import { useMutation } from '@tanstack/react-query'
import { integrationsClient } from './integraionsClient'
import useQueryParams from '../../utils/hooks/useQueryParams'
import { queryClient } from '../..'

interface StripeOAuthRequest {
	code: string
	state: string
}

function useAuthorizeStripeoAuth() {
	const { removeAllQueryParams } = useQueryParams()
	return useMutation({
		mutationKey: ['athorize stripe oauth'],
		mutationFn: (req: StripeOAuthRequest) =>
			integrationsClient.get(`/authorize-oauth`, req),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['stripe Account'] })
			removeAllQueryParams()
		},
		onError: () => removeAllQueryParams()
	})
}

export default useAuthorizeStripeoAuth

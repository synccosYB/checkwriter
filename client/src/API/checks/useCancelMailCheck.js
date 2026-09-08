import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useSelector } from 'react-redux'
import { queryClient } from '../..'

function useCancelMailCheck() {
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = org ? 'organization' : 'user'
	return useMutation({
		mutationKey: ['cancel mail', ownerType],
		mutationFn: (body) => checksClient.post(`/mail/cancel/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['checks to mail'] })
		}
	})
}

export default useCancelMailCheck

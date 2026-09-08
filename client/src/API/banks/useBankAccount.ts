import { useQuery } from '@tanstack/react-query'
import { banksClient } from './banksClient'
import { useSelector } from 'react-redux'

function useBankAccount(bankId: string) {
	const org = useSelector(
		(state: Record<string, any>) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'

	return useQuery({
		queryKey: ['bankAccount', bankId, ownerType, org],
		queryFn: () => banksClient.get(`/get-bank/${bankId}/${ownerType}`),
		enabled: !!bankId
	})
}

export default useBankAccount

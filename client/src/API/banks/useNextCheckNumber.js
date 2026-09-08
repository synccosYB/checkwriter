import { useQuery } from '@tanstack/react-query'
import { banksClient } from './banksClient'
import { useSelector } from 'react-redux'

function useNextCheckNumber(bankId) {
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = !!org ? 'organization' : 'user'

	return useQuery({
		queryKey: ['next check number', ownerType, bankId],
		queryFn: () =>
			banksClient.get(`/next-available-check-number/${ownerType}/${bankId}`),
		enabled: !!bankId
	})
}

export default useNextCheckNumber

export const getNextCheckNumber = async (ownerType, bankId) => {
	return banksClient.get(`/next-available-check-number/${ownerType}/${bankId}`)
}

export const validateManualCheckNumber = async (
	ownerType,
	bankId,
	checkNumber
) => {
	return banksClient.post(
		`/validate-manual-check-number/${ownerType}/${bankId}`,
		{
			checkNumber
		}
	)
}

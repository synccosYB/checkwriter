import { useQuery } from '@tanstack/react-query'
import { addressesClient } from './addressesClient'
import { useSelector } from 'react-redux'

function useAddresses(ownerTypeProp) {
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const ownerType = ownerTypeProp
		? ownerTypeProp
		: org
		? 'organization'
		: 'user'

	return useQuery({
		queryKey: ['addresses', ownerType],
		queryFn: () => addressesClient.get(`/getAddresses/${ownerType}`)
	})
}

export default useAddresses

import { useQuery } from '@tanstack/react-query'
import { banksClient } from './banksClient'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'

function useBanks(filters = {}) {
        const org = useSelector((state) => state?.appData?.selectedOrganization)
        const ownerType = org ? 'organization' : 'user'

        const queryKey = ['banks', ownerType, org]

        const queryParams = {}

        // Iterate over the filters object
        for (const key in filters) {
                if (filters.hasOwnProperty(key) && isNotNullOrUndefined(filters[key])) {
                        queryParams[key] = filters[key]
                        queryKey.push(filters[key])
                }
        }

        // Special handling for page and pageSize to adjust page number for API
        if (isNotNullOrUndefined(filters.page) && filters.pageSize) {
                queryParams.page = filters.page + 1
                queryKey.push(filters.page + 1, filters.pageSize)
        }

        return useQuery({
                queryKey,
                queryFn: async () => {
                        const result = await banksClient.get(`/getAllBanks/${ownerType}`, queryParams)
                        return result && typeof result === 'object' && !Array.isArray(result) ? result : { data: Array.isArray(result) ? result : [], totalCount: 0 }
                }
        })
}

export default useBanks

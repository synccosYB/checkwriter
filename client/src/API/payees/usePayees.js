import { useQuery } from '@tanstack/react-query'
import { payeesClient } from './payeesClient'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'

function usePayees({
        page,
        pageSize,
        includePayeeId,
        status,
        enabled = true
} = {}) {
        const org = useSelector((state) => state?.appData?.selectedOrganization)

        const ownerType = org ? 'organization' : 'user'

        const queryKey = ['payees', ownerType, org]

        const queryParams = {}

        if (isNotNullOrUndefined(page) && pageSize) {
                queryParams.page = page + 1
                queryParams.pageSize = pageSize

                queryKey.push(page + 1, pageSize)
        }

        if (
                isNotNullOrUndefined(includePayeeId) &&
                includePayeeId !== '' &&
                includePayeeId !== undefined
        ) {
                queryParams.includePayeeId = includePayeeId
        }

        if (isNotNullOrUndefined(status) && status !== '' && status !== undefined) {
                queryParams.status = status
        }

        return useQuery({
                queryKey,
                queryFn: async () => {
                        const result = await payeesClient.get(`/getAllPayees/${ownerType}`, queryParams)
                        return result && typeof result === 'object' && !Array.isArray(result) ? result : { data: Array.isArray(result) ? result : [], totalCount: 0 }
                },
                enabled
        })
}

export default usePayees

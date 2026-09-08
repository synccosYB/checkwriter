import { useQuery } from '@tanstack/react-query'
import { isNotNullOrUndefined } from '../../utils/helper'
import { adminClient } from './adminClient'

function useAllMailChecks({ page, pageSize, status, sortBy, sortOrder, enabled } = {}) {
        const queryKey = ['admin mail checks']

        const queryParams = {}

        if (isNotNullOrUndefined(page) && pageSize) {
                queryParams.page = page + 1
                queryParams.pageSize = pageSize

                queryKey.push(page + 1, pageSize)
        }

        if (status) {
                queryParams.status = status
                queryKey.push(status)
        }

        if (sortBy && sortOrder) {
                queryParams.sortBy = sortBy
                queryParams.sortOrder = sortOrder
                queryKey.push(sortBy, sortOrder)
        }

        return useQuery({
                queryKey,
                queryFn: () => adminClient.get(`/checks/mailed`, queryParams),
                enabled
        })
}

export default useAllMailChecks

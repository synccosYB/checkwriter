import { useInfiniteQuery } from '@tanstack/react-query'
import { payeesClient } from './payeesClient'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'

function useInfinitePayees({
        pageSize = 25,
        includePayeeId,
        status,
        sortBy,
        sortOrder,
        enabled = true
} = {}) {
        const org = useSelector((state) => state?.appData?.selectedOrganization)
        const ownerType = org ? 'organization' : 'user'

        const queryKey = [
                'payees',
                'infinite',
                ownerType,
                org || 'self',
                includePayeeId || '',
                status || '',
                sortBy || '',
                sortOrder || ''
        ]

        return useInfiniteQuery({
                queryKey,
                enabled,
                initialPageParam: 1,
                queryFn: async ({ pageParam }) => {
                        const queryParams = {
                                page: pageParam,
                                pageSize
                        }

                        if (
                                isNotNullOrUndefined(includePayeeId) &&
                                includePayeeId !== '' &&
                                includePayeeId !== undefined
                        ) {
                                queryParams.includePayeeId = includePayeeId
                        }

                        if (
                                isNotNullOrUndefined(status) &&
                                status !== '' &&
                                status !== undefined
                        ) {
                                queryParams.status = status
                        }

                        if (sortBy && sortOrder) {
                                queryParams.sortBy = sortBy
                                queryParams.sortOrder = sortOrder
                        }

                        return payeesClient.get(`/getAllPayees/${ownerType}`, queryParams)
                },
                getNextPageParam: (lastPage, _pages, lastPageParam) => {
                        const hasMore = (lastPage?.data?.length || 0) > 0
                        return hasMore ? lastPageParam + 1 : undefined
                }
        })
}

export default useInfinitePayees

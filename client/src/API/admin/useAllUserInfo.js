import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { isNotNullOrUndefined } from '../../utils/helper'

function useAllInfoUsers(
        searchQuery = '',
        sortBy = '',
        subscriptionStatuses = [],
        startDate,
        endDate,
        sortOrder = ''
) {
        return useInfiniteQuery({
                queryKey: [
                        'register users info',
                        searchQuery,
                        sortBy,
                        subscriptionStatuses,
                        startDate || '',
                        endDate || '',
                        sortOrder || ''
                ],
                queryFn: async ({ pageParam }) => {
                        const params = {
                                pageNumber: pageParam,
                                pageSize: 10,
                                subscriptionStatuses
                        }
                        if (isNotNullOrUndefined(searchQuery)) {
                                params.search = searchQuery
                        }
                        if (isNotNullOrUndefined(sortBy)) {
                                params.sortBy = sortBy
                        }
                        if (sortOrder) {
                                params.sortOrder = sortOrder
                        }
                        if (startDate && endDate) {
                                params.startDate = startDate
                                params.endDate = endDate
                        }
                        const resp = await adminClient.get(`/users`, params)
                        return resp
                },
                initialPageParam: 1,
                getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
                        lastPage.nextPage ? lastPageParam + 1 : undefined,
                getPreviousPageParam: (
                        firstPage,
                        allPages,
                        firstPageParam,
                        allPageParams
                ) => (firstPageParam > 1 ? firstPageParam - 1 : undefined),
                refetchOnMount: 'always'
        })
}

export default useAllInfoUsers

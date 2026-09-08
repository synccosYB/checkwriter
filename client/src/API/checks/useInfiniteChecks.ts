import { useInfiniteQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { checksClient } from './checkClient'
import { RootState } from '../../types/redux.types'
import { isNotNullOrUndefined } from '../../utils/helper'

interface UseInfiniteChecksParams {
        pageSize?: number
        searchParam?: string
        extraParams?: Record<string, any>
}

interface ChecksResponse {
        data: Record<string, any>[]
        totalCount: number
}

export function useInfiniteChecks({
        pageSize = 25,
        searchParam,
        extraParams
}: UseInfiniteChecksParams = {}) {
        const org = useSelector((s: RootState) => s.appData.selectedOrganization)
        const ownerType = org ? 'organization' : 'user'

        const queryKey = [
                'checks',
                ownerType,
                org,
                searchParam ?? '',
                JSON.stringify(extraParams ?? {})
        ] as const

        return useInfiniteQuery({
                queryKey,
                queryFn: async ({ pageParam }) => {
                        const params: Record<string, any> = {
                                ...(extraParams ?? {}),
                                page: pageParam,
                                pageSize
                        }
                        if (isNotNullOrUndefined(searchParam)) {
                                params.search = searchParam
                        }
                        const resp = await checksClient.get<ChecksResponse>(
                                `/${ownerType}`,
                                params
                        )
                        return resp
                },
                initialPageParam: 1,
                getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
                        (lastPage?.data?.length ?? 0) > 0 ? lastPageParam + 1 : undefined,
                getPreviousPageParam: (
                        firstPage,
                        allPages,
                        firstPageParam,
                        allPageParams
                ) => (firstPageParam > 1 ? firstPageParam - 1 : undefined),
                refetchOnMount: 'always'
        })
}

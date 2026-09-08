import { useInfiniteQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { transactionsClient } from './transactionsClient'
import { RootState } from '../../types/redux.types'
import { isNotNullOrUndefined } from '../../utils/helper'
import { Attachment } from '../../types/attachment.types'

interface ITransaction {
        _id: string
        checkId: string
        ownerId: string
        ownerType: string
        type: string
        checkNumber: number
        description: string
        status: string
        amount: number
        balance: number
        issueDate: string
        createdAt: string
        updatedAt: string
        __v: number
        attachments: Attachment[]
}

interface UseInfiniteTransactionsParams {
        bankId: string
        pageSize?: number
        extraParams?: Record<string, any>
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
}

interface TransactionsResponse {
        data: ITransaction[]
        totalCount: number
}

export function useInfiniteTransactions({
        bankId,
        pageSize = 25,
        extraParams,
        sortBy,
        sortOrder
}: UseInfiniteTransactionsParams) {
        const org = useSelector((s: RootState) => s.appData.selectedOrganization)
        const ownerType = org ? 'organization' : 'user'

        const queryKey = [
                'transactions',
                bankId,
                ownerType,
                org,
                JSON.stringify(extraParams ?? {}),
                sortBy ?? '',
                sortOrder ?? ''
        ] as const

        return useInfiniteQuery({
                queryKey,
                queryFn: async ({ pageParam }) => {
                        const params: Record<string, any> = {
                                ...(extraParams ?? {}),
                                bankId,
                                page: pageParam,
                                pageSize
                        }
                        if (sortBy && sortOrder) {
                                params.sortBy = sortBy
                                params.sortOrder = sortOrder
                        }
                        const resp = await transactionsClient.get<TransactionsResponse>(
                                `/${ownerType}`,
                                params
                        )
                        return resp
                },
                initialPageParam: 1,
                enabled: !!bankId,
                getNextPageParam: (lastPage, _allPages, lastPageParam) =>
                        (lastPage?.data?.length ?? 0) > 0 ? lastPageParam + 1 : undefined,
                getPreviousPageParam: (firstPage, _allPages, firstPageParam) =>
                        firstPageParam > 1 ? firstPageParam - 1 : undefined,
                refetchOnMount: 'always'
        })
}

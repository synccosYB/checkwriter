import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { isNotNullOrUndefined } from '../../utils/helper'
import { RootState } from '../../types/redux.types'
import { paymentLinkClient } from './paymentLInkClient'
import { PaymentLink } from '../../types/payment.type'

interface UseGetUserPayments {
    page?: number
    pageSize?: number
}

interface UseGetUserPaymentsPagenated {
    page: number
    total: number
    totalPages: number
    results: PaymentLink[]
}

function useGetUserPayments(body: UseGetUserPayments) {
    const org = useSelector(
        (state: RootState) => state?.appData?.selectedOrganization
    )

    const ownerType = org ? 'organization' : 'user'

    const queryKey = ['payment-link', ownerType, org, body]


    return useQuery({
        queryKey,
        queryFn: () => paymentLinkClient.post<UseGetUserPaymentsPagenated>(`/getUserPayments/${ownerType}`, body)
    })
}

export default useGetUserPayments

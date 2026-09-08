import { useQuery } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useLOBRecords({ page = 0, pageSize = 20, status } = {}) {
        const params = { page: page + 1, pageSize }
        if (status) params.status = status

        return useQuery({
                queryKey: ['lob records', page, pageSize, status],
                queryFn: () => shippingClient.get('/lob/records', { params }),
        })
}

export default useLOBRecords

import { useQuery } from '@tanstack/react-query'
import { instance } from '../index.jsx'

function useAllShipments({ page = 0, pageSize = 20, status, provider } = {}) {
        const queryParams = {
                page: page + 1,
                pageSize,
        }
        if (status) queryParams.status = status
        if (provider) queryParams.provider = provider

        return useQuery({
                queryKey: ['all shipments', page, pageSize, status, provider],
                queryFn: () =>
                        instance.get('/shipping/admin/all', { params: queryParams }),
        })
}

export default useAllShipments

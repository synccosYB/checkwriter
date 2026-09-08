import { useQuery } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useUserCarrierShipments({ page = 0, pageSize = 20, status, carrier } = {}) {
        const params = { page: page + 1, pageSize }
        if (status) params.status = status
        if (carrier) params.carrier = carrier

        return useQuery({
                queryKey: ['user carrier shipments', page, pageSize, status, carrier],
                queryFn: () => shippingClient.get('/carrier-shipment/records', { params }),
        })
}

export default useUserCarrierShipments

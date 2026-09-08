import { useMutation } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useAcceptCarrierPayment() {
        return useMutation({
                mutationKey: ['carrier payment'],
                mutationFn: (body) => shippingClient.post('/carrier-shipment/acceptStripePayment', body),
        })
}

export default useAcceptCarrierPayment

import { useMutation } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useAcceptLOBPayment() {
        return useMutation({
                mutationKey: ['lob payment'],
                mutationFn: (body) => shippingClient.post('/lob/acceptStripePayment', body),
        })
}

export default useAcceptLOBPayment

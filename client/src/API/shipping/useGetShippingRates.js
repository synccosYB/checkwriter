import { useMutation } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useGetShippingRates() {
        return useMutation({
                mutationKey: ['shipping rates'],
                mutationFn: (body) => shippingClient.post('/shipping/rates', body),
        })
}

export default useGetShippingRates

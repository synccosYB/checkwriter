import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../..'
import { shippingClient } from '../shipping/shippingClient'

export function useAdminCancelShipment() {
        return useMutation({
                mutationFn: ({ provider, recordId }) =>
                        shippingClient.delete(`/shipping/admin/${provider}/${recordId}`),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['all shipments'] })
                }
        })
}

export function useAdminUpdateShipment() {
        return useMutation({
                mutationFn: ({ provider, recordId, status, note }) =>
                        shippingClient.patch(`/shipping/admin/${provider}/${recordId}`, { status, note }),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['all shipments'] })
                }
        })
}

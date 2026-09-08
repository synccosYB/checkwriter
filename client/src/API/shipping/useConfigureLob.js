import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useConfigureLob() {
        const queryClient = useQueryClient()
        return useMutation({
                mutationFn: (body) => shippingClient.post('/lob/configure', body),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['lob-status'] })
                },
        })
}

export default useConfigureLob

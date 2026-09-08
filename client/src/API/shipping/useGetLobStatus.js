import { useQuery } from '@tanstack/react-query'
import { shippingClient } from './shippingClient'

function useGetLobStatus() {
        return useQuery({
                queryKey: ['lob-status'],
                queryFn: () => shippingClient.get('/lob/status'),
                retry: false,
                staleTime: 1000 * 60 * 5,
        })
}

export default useGetLobStatus

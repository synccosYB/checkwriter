import { useQuery } from '@tanstack/react-query'
import { usersClient } from '../userClient'

function useOrganizations() {
        return useQuery({
                queryKey: ['organizations'],
                queryFn: async () => {
                        const result = await usersClient.get('/user/getAllOrganizations')
                        return Array.isArray(result) ? result : (result?.data || [])
                },
                staleTime: Infinity
        })
}

export default useOrganizations

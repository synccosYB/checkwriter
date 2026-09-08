import { useMutation } from '@tanstack/react-query'
import { quickbookClient } from './quickbookClient'

const useQuickbookCallback = () => {
    return useMutation({
            mutationFn: (search) =>
                quickbookClient.get(`/oauth/callback${search}`),
        })
}

export default useQuickbookCallback;
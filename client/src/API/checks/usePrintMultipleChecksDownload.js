import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useSelector } from 'react-redux'
import { queryClient } from '../..'

function usePrintMultipleChecksDownload() {
    const org = useSelector((state) => state?.appData?.selectedOrganization)
    const ownerType = org ? 'organization' : 'user'

    return useMutation({
        mutationKey: ['Print Multiple Checks'],
        mutationFn: (body) =>
            checksClient.post(`/print-multiple-checks/${ownerType}`, body),

        onSuccess: () => {
            queryClient.invalidateQueries(['checks']);
        }
    })
}

export default usePrintMultipleChecksDownload

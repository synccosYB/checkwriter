import { useMutation } from '@tanstack/react-query'
import { checksClient } from './checkClient'
import { useSelector } from 'react-redux'
import { queryClient } from '../..'

function usePrintMultipleBlankChecksDownload() {
    const org = useSelector((state) => state?.appData?.selectedOrganization)
    const ownerType = org ? 'organization' : 'user'

    return useMutation({
        mutationKey: ['Print Multiple Blank Checks'],
        mutationFn: (body) =>
            checksClient.post(`/print-multiple-blank-checks/${ownerType}`, body),

        onSuccess: () => {
            queryClient.invalidateQueries(['checks']);
        }
    })
}

export default usePrintMultipleBlankChecksDownload

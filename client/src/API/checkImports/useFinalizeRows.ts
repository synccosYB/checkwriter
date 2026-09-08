import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import useOwnerType from '../../utils/hooks/useOwnerType'

interface FinalizeRequest {
	importId: string
}

function useFinalizeRows() {
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['finalize rows'],
		mutationFn: (body: FinalizeRequest) =>
			checkImportClient.post(`/finalizeImport/${ownerType}`, body)
	})
}

export default useFinalizeRows

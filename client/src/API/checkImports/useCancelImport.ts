import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import { queryClient } from '../..'
import useOwnerType from '../../utils/hooks/useOwnerType'

function useCancelImport() {
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['cancel import'],
		mutationFn: (body: { importId: string }) =>
			checkImportClient.post(`/cancelImport/${ownerType}`, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['check imports'] })
		}
	})
}

export default useCancelImport

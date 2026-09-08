import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import useOwnerType from '../../utils/hooks/useOwnerType'
import { ICheckImportRow } from './useImportRows'
import { queryClient } from '../..'

interface UpdateImportBankRequest {
	importId: string
	bankAccountId: string
}

function useUpdateImportBank() {
	const { ownerType } = useOwnerType()
	return useMutation({
		mutationKey: ['update bank id for an import'],
		mutationFn: (body: UpdateImportBankRequest) =>
			checkImportClient.post<{ rows: ICheckImportRow[] }>(
				`/updateImportBank/${ownerType}`,
				body
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['check import rows'] })
		}
	})
}

export default useUpdateImportBank

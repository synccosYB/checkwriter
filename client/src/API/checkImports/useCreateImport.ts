import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import useOwnerType from '../../utils/hooks/useOwnerType'
import { queryClient } from '../..'
import { ICheckImport } from './useCheckImports'

function useCreateImport() {
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['create check import'],
		mutationFn: (data: FormData) =>
			checkImportClient.post<{ checkImport: ICheckImport }>(
				`/import/${ownerType}`,
				data
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['check imports'] })
		}
	})
}

export default useCreateImport

import { useQuery } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import { ICheckImport } from './useCheckImports'
interface Props {
	importId: string
}

function useCheckImport({ importId }: Props) {
	return useQuery({
		queryKey: ['check import', importId],
		queryFn: () =>
			checkImportClient.get<{ checkImport: ICheckImport }>(
				`/import/${importId}`
			),
		enabled: !!importId
	})
}

export default useCheckImport

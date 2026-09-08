import { useMutation } from '@tanstack/react-query'
import { ICheckImportRow } from './useImportRows'
import { checkImportClient } from './checkImportClient'

function useValidateRow() {
	return useMutation({
		mutationKey: ['validate a row'],
		mutationFn: (row: ICheckImportRow) =>
			checkImportClient.post<ICheckImportRow>(`/validateRow`, row)
	})
}

export default useValidateRow

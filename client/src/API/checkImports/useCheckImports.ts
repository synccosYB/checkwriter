import { useQuery } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import useOwnerType from '../../utils/hooks/useOwnerType'

export interface ICheckImport {
	_id: string
	ownerType: 'user' | 'organization'
	ownerId: string
	createdBy: string
	fileName: string
	status: 'In Review' | 'Completed' | 'Canceled'
	rowCounts: IRowCounts
	createdAt: Date
	updatedAt: Date
	bankDetails: {
		_id: string
		bankName: string
		bankPreferences: {
			checkNoGeneration: 'auto' | 'manual'
		}
	}
}

export interface IRowCounts {
	total: number
	valid: number
	invalid: number
	submitted: number
	skipped: number
}

export interface ICheckImportInput {
	status: 'In Review' | 'Completed' | 'Canceled' | 'Submitted'
}

function useCheckImports({ status }: ICheckImportInput) {
	const { ownerType, org } = useOwnerType()
	return useQuery({
		queryKey: ['check imports', ownerType, org, status],
		queryFn: () =>
			checkImportClient.get<{ importsList: ICheckImport[] }>(
				`/getImports/${ownerType}`,
				{ status }
			)
	})
}

export default useCheckImports

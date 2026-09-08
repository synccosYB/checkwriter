import { useQuery } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import useOwnerType from '../../utils/hooks/useOwnerType'

type ValidationErrorKey = 'amount' | 'checkNumber' | 'payeeId'

export interface ICheckImportRow {
	_id: string
	importId: string
	ownerType: 'user' | 'organization'
	ownerId: string
	rowNumber: number
	// Original values (all strings)
	originalCheckNumber: string
	originalAmount: string
	originalPayeeName: string
	originalNote: string
	originalInvoiceId: string
	originalIssueDate: string
	// Final values
	finalCheckNumber: number
	finalAmount: number
	finalPayeeId: string
	finalIssueDate: string

	suggestedPayeeId: string
	finalNote: string
	finalInvoiceId: string
	// Validation
	validationErrors: Record<ValidationErrorKey, string[]>
	// State and submission
	state: 'valid' | 'invalid' | 'submitted' | 'skipped'
	checkId: string
	submittedAt: Date
	submittedBy: string
	createdAt: Date
	updatedAt: Date
	checkDetails?: {
		_id: string
		status: string
	}
}

function useImportRows({ importId }: { importId: string }) {
	const { ownerType, org } = useOwnerType()

	return useQuery({
		queryKey: ['check import rows', ownerType, org, importId],
		queryFn: () =>
			checkImportClient.get<{ importRows: ICheckImportRow[] }>(
				`/getImportRows/${ownerType}`,
				{ importId }
			),
		enabled: !!importId
	})
}

export default useImportRows

export const getImportRows = async ({
	ownerType,
	importId
}: {
	ownerType: string
	importId: string
}) => {
	return await checkImportClient.get(`/getImportRows/${ownerType}`, {
		importId
	})
}

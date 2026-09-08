import { useMutation } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { checksClient } from './checkClient'
import { RootState } from '../../types/redux.types'

interface ValidateCheckNumbersParams {
	bankAccountId: string
	startingCheckNumber: number
	count: number
}

interface ValidateCheckNumbersResult {
	available: boolean
	conflicts?: number[]
}

export function useValidateCheckNumbers() {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationFn: (params: ValidateCheckNumbersParams) =>
			checksClient.get<ValidateCheckNumbersResult>(
				`/validate-check-numbers/${ownerType}`,
				params
			)
	})
}

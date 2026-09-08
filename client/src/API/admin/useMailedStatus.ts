import { useMutation } from '@tanstack/react-query'
import { adminClient } from './adminClient'
import { useSelector } from 'react-redux'

import { RootState } from '../../types/redux.types'

interface MailedStatusRequest {
	checkIds: string[]
}

export interface MailedCheck {
	checkId: string
	requestedAt: string
	status: string
}

export interface MailedStatusResponse {
	alreadyRequested: MailedCheck[]
}

const useMailedStatus = () => {
	const org = useSelector(
		(state: RootState) => state?.appData?.selectedOrganization
	)
	const ownerType = org ? 'organization' : 'user'

	return useMutation({
		mutationFn: ({ checkIds }: MailedStatusRequest) =>
			adminClient.post<{ alreadyRequested: MailedCheck[] }>(
				`/mailed-status/${ownerType}`,
				{ checkIds }
			)
	})
}

export default useMailedStatus

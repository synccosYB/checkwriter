import { useMutation } from '@tanstack/react-query'
import { attachmentClient } from './attachmentClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { OwnerType } from '../../types/user.types'

export const useUploadAttachments = () => {
	const org = useSelector(
		(state: RootState) => state.appData?.selectedOrganization
	)
	const ownerType: OwnerType = org ? 'organization' : 'user'

	return useMutation({
		mutationFn: async (data: FormData) => {
			return attachmentClient.post(`/${ownerType}`, data)
		}
	})
}

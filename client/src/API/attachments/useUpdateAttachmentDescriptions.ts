import { useMutation } from '@tanstack/react-query'
import { attachmentClient } from './attachmentClient'
import { useSelector } from 'react-redux'
import { queryClient } from '../..'
import { RootState } from '../../types/redux.types'
import { OwnerType } from '../../types/user.types'
import { UpdateDescriptionPayload } from '../../types/attachment.types'

export const useUpdateAttachmentDescriptions = () => {
	const org = useSelector(
		(state: RootState) => state.appData?.selectedOrganization
	)
	const ownerType: OwnerType = org ? 'organization' : 'user'

	return useMutation({
		mutationFn: async (data: UpdateDescriptionPayload) => {
			return attachmentClient.put(`/updateDescription/${ownerType}`, data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['attachments'] })
		}
	})
}

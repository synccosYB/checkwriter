import { useQuery } from '@tanstack/react-query'
import { attachmentClient } from './attachmentClient'
import { useSelector } from 'react-redux'
import { RootState } from '../../types/redux.types'
import { Attachment, GetAttachmentsParams } from '../../types/attachment.types'
import { OwnerType } from '../../types/user.types'

export const useGetAttachments = ({
	entityType,
	entityId
}: GetAttachmentsParams) => {
	const org = useSelector(
		(state: RootState) => state.appData?.selectedOrganization
	)
	const ownerType: OwnerType = org ? 'organization' : 'user'

	return useQuery({
		queryKey: ['attachments', entityType, entityId, ownerType],
		queryFn: async (): Promise<{ attachments: Attachment[] }> => {
			const res = await attachmentClient.get<{ attachments: Attachment[] }>(
				`/${ownerType}`,
				{ entityType, entityId }
			)
			return { attachments: res.attachments }
		},
		enabled: !!entityId // Only run query if entityId exists
	})
}

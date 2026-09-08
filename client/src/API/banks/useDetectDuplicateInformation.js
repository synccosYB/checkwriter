import { useMutation } from '@tanstack/react-query'
import { banksClient } from './banksClient'
import useUserInfo from '../users/useUserInfo'
import { useSelector } from 'react-redux'

function useDetectDuplicateInformation() {
	const org = useSelector((state) => state?.appData?.selectedOrganization)

	const { data } = useUserInfo()
	const ownerId = org ? org : data?._id
	return useMutation({
		mutationKey: ['detect duplicates'],
		mutationFn: (body) =>
			banksClient.post(`/detect-duplicates/${ownerId}`, body)
	})
}

export default useDetectDuplicateInformation

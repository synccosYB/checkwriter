import { useQuery } from '@tanstack/react-query'
import useOwnerType from '../../utils/hooks/useOwnerType'
import { checksClient } from './checkClient'

interface Props {
	checkId: string
}

function useCheck({ checkId }: Props) {
	const { ownerType } = useOwnerType()
	return useQuery({
		queryKey: ['check', checkId, ownerType],
		queryFn: () => checksClient.get(`/check/${checkId}/${ownerType}`),
		enabled: !!checkId
	})
}

export default useCheck

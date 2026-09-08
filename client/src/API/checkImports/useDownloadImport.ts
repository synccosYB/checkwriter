import { useMutation } from '@tanstack/react-query'
import { checkImportClient } from './checkImportClient'
import useOwnerType from '../../utils/hooks/useOwnerType'
import { downloadFromUrl } from '../../utils/helpers/downloadFromUrl'

interface DownloadImportRequest {
	importId: string
}

function useDownloadImport() {
	const { ownerType } = useOwnerType()

	return useMutation({
		mutationKey: ['download import'],
		mutationFn: ({ importId }: DownloadImportRequest) =>
			checkImportClient.get(`/download/${ownerType}`, { importId }),
		onSuccess: ({ fileUrl, fileName }: any) => {
			downloadFromUrl(fileUrl, fileName)
		}
	})
}

export default useDownloadImport

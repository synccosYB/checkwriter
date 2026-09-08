import React from 'react'
import LoadingModal from '../../../../../components/shared/Modals/LoadingModal'
import { GeneratingCheckIcon, PDFIcon } from '../../../../../components/Icons'

export const GeneratingCheckModal = ({ open }) => {
	return (
		<LoadingModal
			open={open}
			icon={<GeneratingCheckIcon />}
			overlayIcon={<PDFIcon />}
			title="Generating Check..."
			description="Please wait while we generate your check. This may take a few seconds."
		/>
	)
}

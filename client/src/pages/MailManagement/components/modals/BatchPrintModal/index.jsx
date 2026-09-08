import {
	Box,
	Typography,
	Button,
	useTheme,
	CircularProgress
} from '@mui/material'
import { styles } from './styles'
import { CustomDialog } from '../../../../../components/shared/dialog/CustomDialog'
import { CustomTable } from '../../../../../components/table/CustomTable'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { formatUSD } from '../../../../../utils/helper'
import useCreateChecksBatch from '../../../../../API/admin/useCreateChecksBatch'
import useAllMailChecks from '../../../../../API/admin/useAllMailChecks'
import { BatchCreationModal } from '../../modals/BatchCreationModal'
import { BatchCreateSuccessfullyModal } from '../../modals/BatchCreateSuccessfullyModal'
import { BatchFailedModal } from '../../modals/BatchFailedModal'
import { BatchSuccesswithErrorsModal } from '../../modals/BatchSuccesswithErrorsModal'
import { useState } from 'react'
import BatchCreationDetailModal from '../BatchCreationDetailModal'

const getStatusColor = (status, theme) => {
	switch (status) {
		case 'Processing':
			return '#EF6C00'
		case 'Submitted':
			return '#058205'
		case 'Mailed':
			return '#1e3a5f'
		default:
			return theme.palette.text.primary
	}
}

export const BatchPrintModal = ({
	open,
	onClose,
	onConfirm,
	batchAllPending,
	...rest
}) => {
	const { data, isLoading } = useAllMailChecks({ enabled: batchAllPending })

	const checks = batchAllPending
		? data?.data?.filter((i) => i.status === 'Submitted') || []
		: rest.checks

	const {
		mutate: createBatch,
		isPending,
		error,
		reset
	} = useCreateChecksBatch()
	const [isBatchCreatedSuccesfully, setIsBatchCreatedSuccesfully] =
		useState(false)

	const [batchcreationResponse, setBatchCreationResponse] = useState(null)
	const [openErrorModal, setOpenErrorModal] = useState(false)
	const [partialCreationModal, setPartialCreationModal] = useState(null)

	const [openBatchDetailDialog, setOpenBatchDetailDialog] = useState(false)

	const theme = useTheme()
	const handleNext = () => {
		const payload = { mailCheckIds: checks.map((check) => check._id) }

		if (batchAllPending) {
			payload['batchAllPending'] = true
			delete payload.mailCheckIds
		}

		createBatch(payload, {
			onSuccess: ({ messsage, ...batchInfo }) => {
				const status = batchInfo?.status

				if (status === 'success') {
					setIsBatchCreatedSuccesfully(true)
				}

				if (status === 'partial') {
					setPartialCreationModal({
						open: true,
						failed: batchInfo?.results?.failedChecks,
						success: batchInfo?.results?.successfulChecks
					})
				}

				if (batchInfo.status === 'failed') {
					setOpenErrorModal(true)
				}

				const updatedBatchInfo = {
					confirmedChecks: checks.map((i) => {
						const isSuccessful = batchInfo?.results?.successfulChecks?.find(
							(chk) => chk?.checkId === i._id
						)
						return {
							...i,
							status: isSuccessful ? 'success' : 'error'
						}
					}),
					batchInfo: {
						_id: batchInfo?.results?.batchId,
						createdBy: ``,
						createdDate: batchInfo.results?.createdAt,
						totalSuccessful: batchInfo.results?.totalSuccessful,
						no: batchInfo?.results?.batchNumber
					},
					status: batchInfo.status
				}

				setBatchCreationResponse(updatedBatchInfo)
			},
			onError: () => {
				setOpenErrorModal(true)
			}
		})
	}

	const renderCell = (row, column) => {
		switch (column.id) {
			case 'status':
				return (
					<CustomButton
						size="small"
						sx={{
							width: '80px',
							color: getStatusColor(row.status, theme),
							backgroundColor: `${getStatusColor(row.status, theme)}0D`,
							border: `1px solid ${getStatusColor(row.status, theme)}`,
							'&:hover': {
								backgroundColor: `${getStatusColor(row.status, theme)}1A`,
								border: `1px solid ${getStatusColor(row.status, theme)}`
							}
						}}
					>
						{row.status}
					</CustomButton>
				)

			case 'no':
				return row.check.checkNumber
			case 'payeeName':
				return row.payee.name
			case 'issuedDate':
				return new Date(row.requestedAt).toDateString()
			case 'account':
				return `${row.user?.firstName} ${row.user?.lastName}`
			case 'amount':
				return formatUSD(row.check.amount)
			default:
				return row[column.id]
		}
	}

	const displayLoader = isLoading && batchAllPending

	return (
		<Box>
			<CustomDialog
				open={open}
				onClose={() => onClose('cancel')}
				title="Batch Print Confirmation"
				content={
					<Box sx={styles.content}>
						{displayLoader ? (
							<Box display={'flex'} justifyContent={'center'} my={5}>
								<CircularProgress size={'50px'} />
							</Box>
						) : (
							<Box sx={styles.section}>
								<Typography sx={styles.description}>
									You are about to batch print selected checks. Please review
									the details before proceeding.
								</Typography>
								<Typography sx={styles.checksCount}>
									Number of Checks: {checks?.length}
								</Typography>

								<CustomTable
									columns={[
										{ id: 'no', label: 'Check No.', width: '60px' },
										{ id: 'amount', label: 'Check Amount', width: '100px' },
										{ id: 'payeeName', label: 'Payee Name', width: '120px' },
										{
											id: 'account',
											label: 'User Account',
											width: '120px'
										},
										{ id: 'issuedDate', label: 'Issued Date', width: '60px' }
									]}
									data={checks}
									renderCell={renderCell}
									isCenteredCells={true}
								/>
								{!!error && (
									<Typography color={'red'} variant="subtitle2">
										{error?.response?.data?.error}
									</Typography>
								)}
							</Box>
						)}
					</Box>
				}
				actions={
					<>
						<Button onClick={() => onClose('cancel')} sx={styles.cancelButton}>
							Cancel
						</Button>
						<Button
							disabled={isPending || !!error || !checks.length}
							onClick={handleNext}
							sx={styles.nextButton}
							endIcon={isPending && <CircularProgress size={'14px'} />}
						>
							Confirm
						</Button>
					</>
				}
			/>

			{isPending && <BatchCreationModal open={isPending} />}

			{isBatchCreatedSuccesfully && (
				<BatchCreateSuccessfullyModal
					open={isBatchCreatedSuccesfully}
					onClose={() => {
						setIsBatchCreatedSuccesfully(false)
						setBatchCreationResponse(null)
						onClose()
					}}
					onConfirm={() => {
						setOpenBatchDetailDialog(true)
					}}
				/>
			)}

			{openErrorModal && (
				<BatchFailedModal
					error={error?.response?.data?.error}
					open={openErrorModal}
					onClose={() => {
						setOpenErrorModal(false)
						onClose()
						reset()
					}}
					onConfirm={() => {
						setOpenBatchDetailDialog(true)
					}}
				/>
			)}

			{partialCreationModal?.open && (
				<BatchSuccesswithErrorsModal
					open={partialCreationModal?.open}
					success={partialCreationModal.success || []}
					failed={partialCreationModal.failed || []}
					onClose={() => {
						setPartialCreationModal(null)
						setBatchCreationResponse(null)
						onClose()
						reset()
					}}
					onConfirm={() => {
						onConfirm({
							...batchcreationResponse,
							confirmedChecks: batchcreationResponse?.confirmedChecks?.filter(
								(i) => i.status !== 'error'
							)
						})
					}}
					onViewErrors={() => {
						setOpenBatchDetailDialog(true)
					}}
				/>
			)}

			{openBatchDetailDialog && (
				<BatchCreationDetailModal
					status={batchcreationResponse.status}
					checks={batchcreationResponse?.confirmedChecks || []}
					open={openBatchDetailDialog}
					onClose={() => {
						setOpenBatchDetailDialog(false)
						onClose()
						setBatchCreationResponse(null)
					}}
					title="Batch Created"
					onConfirm={() => {
						onClose()
						onConfirm({
							...batchcreationResponse,
							confirmedChecks: batchcreationResponse?.confirmedChecks?.filter(
								(i) => i.status !== 'error'
							)
						})
					}}
				/>
			)}
		</Box>
	)
}

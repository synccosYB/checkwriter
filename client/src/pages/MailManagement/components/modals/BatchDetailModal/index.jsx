import {
	Box,
	Typography,
	Button,
	Checkbox,
	useTheme,
	IconButton,
	Tab,
	Tabs,
	Tooltip,
	CircularProgress
} from '@mui/material'
import { useState } from 'react'

import { styles } from './styles'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { DownloadAsFdfIcon, MailboxIcon } from '../../../../../components/Icons'
import { CustomDialog } from '../../../../../components/shared/dialog/CustomDialog'
import { CustomTable } from '../../../../../components/table/CustomTable'
import useMarkCheckAsMailed from '../../../../../API/admin/useMarkCheckAsMailed'
import useGenerateCheckPdfAdmin from '../../../../../API/admin/useGenerateCheckPdfAdmin'

export const BatchDetailDialog = ({
	open,
	onClose,
	batch,
	onMarkAsMailed,
	...props
}) => {
	const { mutate: markAsMailed, isPending } = useMarkCheckAsMailed()
	const { mutate: generatePdf, isPending: isGeneratingPdf } =
		useGenerateCheckPdfAdmin()
	const theme = useTheme()
	const checks = props.checks || []
	const [selectedChecks, setSelectedChecks] = useState([])
	const [isCheckedAll, setIsCheckedAll] = useState(false)
	const [currentTab, setCurrentTab] = useState('all')
	const [step, setStep] = useState(0)

	const handleTabChange = (event, newTab) => {
		setCurrentTab(newTab)
	}

	const handleSelectAll = (event) => {
		const checked = event.target.checked
		setIsCheckedAll(checked)

		if (checked) {
			setSelectedChecks(checks)
		} else {
			setSelectedChecks([])
		}
	}

	const handleSelectCheck = (checkId) => {
		setSelectedChecks((prev) => {
			const check = checks.find((c) => c._id === checkId)
			const isSelected = prev.some(
				(selectedCheck) => selectedCheck._id === checkId
			)

			if (isSelected) {
				return prev.filter((selectedCheck) => selectedCheck._id !== checkId)
			} else {
				return [...prev, check]
			}
		})
	}

	const handleCancel = () => {
		if (step) {
			setStep(0)
		} else {
			onClose('cancel')
		}
	}

	const handleConfirm = () => {
		const payload = {
			mailCheckIds: selectedChecks.map((i) => i._id),
			batchId: batch._id
		}
		if (isCheckedAll || selectedChecks.length === checks.length) {
			payload.markAll = true
		}

		markAsMailed(payload, {
			onSuccess: () => {
				setStep(0)
				setSelectedChecks([])
				setIsCheckedAll(false)
				onMarkAsMailed &&
					onMarkAsMailed({
						ids: isCheckedAll ? checks.map((i) => i._id) : payload.mailCheckIds
					})
			}
		})
	}

	const handleMarkAsMailedClick = ({ ids, markAll }) => {
		setStep(1)
	}

	const handleDownloadPdf = ({ ids, generateAll }) => {
		const payload = {
			mailCheckIds: ids,
			batchId: batch._id,
			batchNumber: batch.no
		}
		if (generateAll || ids.length === checks.length) {
			payload.generateAll = true
		}

		generatePdf(payload, {
			onSuccess: () => {
				setSelectedChecks([])
				setIsCheckedAll(false)
			}
		})
	}

	const getStatusColor = (status) => {
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

	const renderHeaderCell = (column) => {
		switch (column.id) {
			case 'selected':
				return (
					<Checkbox
						checked={selectedChecks.length === checks.length}
						onChange={handleSelectAll}
						sx={styles.checkbox}
					/>
				)

			default:
				return column.label
		}
	}

	const renderCell = (row, column) => {
		switch (column.id) {
			case 'selected':
				return (
					<Checkbox
						checked={selectedChecks.some((check) => check._id === row._id)}
						onChange={() => handleSelectCheck(row._id)}
						sx={styles.checkbox}
					/>
				)
			case 'status':
				return (
					<CustomButton
						size="small"
						sx={{
							width: '80px',
							color: getStatusColor(row.status),
							backgroundColor: `${getStatusColor(row.status)}0D`,
							border: `1px solid ${getStatusColor(row.status)}`,
							'&:hover': {
								backgroundColor: `${getStatusColor(row.status)}1A`,
								border: `1px solid ${getStatusColor(row.status)}`
							}
						}}
					>
						{row.status}
					</CustomButton>
				)
			case 'action':
				return (
					<Box sx={{ display: 'flex' }}>
						<Tooltip title="Download PDF">
							<IconButton
								onClick={() => {
									setSelectedChecks([row])
									handleDownloadPdf({ ids: [row._id] })
								}}
							>
								<DownloadAsFdfIcon width="16px" /> &nbsp;{' '}
								{isGeneratingPdf &&
									selectedChecks.find((i) => i._id === row._id) && (
										<CircularProgress size={'10px'} />
									)}
							</IconButton>
						</Tooltip>
						{row.status !== 'Mailed' && (
							<Tooltip title="Mark as Mailed">
								<IconButton
									onClick={() => {
										setSelectedChecks([row])
										handleMarkAsMailedClick({ ids: [row._id] })
									}}
								>
									<MailboxIcon width="20px" /> &nbsp;{' '}
									{isPending &&
										selectedChecks.find((i) => i._id === row._id) && (
											<CircularProgress size={'10px'} />
										)}
								</IconButton>
							</Tooltip>
						)}
					</Box>
				)
			case 'no':
				return row.check.checkNumber
			case 'payeeName':
				return row.payee.name
			case 'issuedDate':
				return new Date(row.requestedAt).toDateString()
			case 'account':
				return `${row.user?.firstName} ${row.user?.lastName}`
			default:
				return row[column.id]
		}
	}

	const renderBatchDetailsSection = () => {
		return (
			<>
				<Box sx={styles.content}>
					<Box sx={styles.section}>
						<Typography sx={styles.description}>
							Review and manage check statuses. Mark checks as mailed, download
							individual or batch PDFs, and track processing progress.
						</Typography>
					</Box>
					<Box sx={styles.section}>
						<Typography sx={styles.checksCount}>
							Created By: {batch?.createdBy}
						</Typography>
						<Typography sx={styles.checksCount}>
							Batch Created On: {batch?.createdDate}
						</Typography>
						<Typography sx={styles.checksCount}>
							Number of Checks: {batch?.totalSuccessful || checks?.length}
						</Typography>
					</Box>
					<Box sx={styles.section}>
						<Box sx={styles.tabContainer}>
							<Tabs
								value={currentTab}
								onChange={handleTabChange}
								sx={styles.tabs}
							>
								<Tab value="all" label="All" className="tab-all" />
								<Tab
									value="processing"
									label="Processing"
									className="tab-processing"
								/>
								<Tab value="mailed" label="Mailed" className="tab-mailed" />
							</Tabs>
						</Box>
						<Box sx={styles.actionContainer}>
							<Box sx={styles.actionButtons}>
								<CustomButton
									variant="outlined"
									startIcon={<DownloadAsFdfIcon />}
									onClick={() => {
										setIsCheckedAll(true)
										handleDownloadPdf({
											ids: checks?.map((c) => c._id),
											generateAll: true
										})
									}}
									disabled={checks.length === 0}
									sx={styles.actionButton}
									endIcon={
										isGeneratingPdf &&
										isCheckedAll && <CircularProgress size={'10px'} />
									}
								>
									<Box>Batch PDF Download</Box>
								</CustomButton>
								{currentTab !== 'mailed' && (
									<CustomButton
										variant="outlined"
										startIcon={<MailboxIcon />}
										disabled={
											checks.length === 0 ||
											checks.every((c) => c.status === 'Mailed')
										}
										sx={styles.actionButton}
										onClick={() => {
											setIsCheckedAll(true)
											handleMarkAsMailedClick({
												ids: checks?.map((c) => c._id),
												markAll: true
											})
										}}
										endIcon={
											isPending &&
											isCheckedAll && <CircularProgress size={'10px'} />
										}
									>
										<Box>Mark All as Mailed</Box>
									</CustomButton>
								)}
								<CustomButton
									variant="outlined"
									startIcon={<DownloadAsFdfIcon />}
									disabled={
										selectedChecks.length === 0
										// || selectedChecks.some((c) => c.status !== "Submitted")
									}
									sx={styles.actionButton}
									onClick={() => {
										handleDownloadPdf({
											ids: selectedChecks.map((c) => c._id)
										})
									}}
									endIcon={
										isGeneratingPdf && <CircularProgress size={'10px'} />
									}
								>
									<Box>Download PDF</Box>
								</CustomButton>
								{currentTab !== 'mailed' && (
									<CustomButton
										variant="outlined"
										startIcon={<MailboxIcon />}
										disabled={
											selectedChecks.length === 0 ||
											selectedChecks.some((c) => c.status === 'Mailed')
										}
										sx={styles.actionButton}
										onClick={() =>
											handleMarkAsMailedClick({
												ids: selectedChecks.map((c) => c._id)
											})
										}
										endIcon={isPending && <CircularProgress size={'10px'} />}
									>
										<Box>Mark as Mailed</Box>
									</CustomButton>
								)}
							</Box>
						</Box>
						<CustomTable
							columns={[
								{ id: 'selected', label: 'selected', width: '20px' },
								{ id: 'no', label: 'Check No.', width: '30px' },
								{ id: 'payeeName', label: 'Payee Name', width: '80px' },
								{
									id: 'account',
									label: 'User Account',
									width: '80px'
								},
								{ id: 'issuedDate', label: 'Issued Date', width: '60px' },
								{ id: 'status', label: 'Status', width: '80px' },
								{ id: 'action', label: 'Action', width: '80px' }
							]}
							data={checks.filter(
								(c) =>
									currentTab === 'all' || c.status.toLowerCase() === currentTab
							)}
							isCenteredCells={true}
							renderCell={renderCell}
							renderHeaderCell={renderHeaderCell}
						/>
					</Box>
					<Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={2}>
						<Button onClick={handleCancel} sx={styles.nextButton}>
							Close
						</Button>
					</Box>
				</Box>
			</>
		)
	}

	const renderConfirmationSection = () => {
		return (
			<>
				<Box sx={styles.content}>
					<Box sx={styles.section}>
						<Typography sx={styles.description}>
							Are you sure you want to mark this check as mailed?
						</Typography>
					</Box>
				</Box>
				<Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={2}>
					<Button onClick={handleCancel} sx={styles.cancelButton}>
						Cancel
					</Button>
					<Button
						disabled={isPending}
						endIcon={isPending && <CircularProgress size={'14px'} />}
						onClick={handleConfirm}
						sx={styles.nextButton}
					>
						Confirm
					</Button>
				</Box>
			</>
		)
	}

	const componentsList = [
		renderBatchDetailsSection(),
		renderConfirmationSection()
	]

	return (
		<CustomDialog
			open={open}
			onClose={() => onClose('cancel')}
			title={`Batch Detail - ${batch?.no}`}
			content={componentsList[step]}
		/>
	)
}

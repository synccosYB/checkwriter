import React, { useEffect, useRef, useState } from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Link,
	Button,
	Menu,
	MenuItem,
	IconButton as MuiIconButton,
	Tooltip,
	CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styles as globalStyles } from '../../../styles'
import { styles as modalStyles } from './styles'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { CustomTable } from '../../../../../components/table/CustomTable'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import 'quill-emoji'
import 'react-quill/dist/quill.snow.css'
import 'quill-emoji/dist/quill-emoji.css'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
	CrossSequareIcon,
	CSVIcon,
	DocumentCrossIcon,
	EditIcon,
	ExportIcon,
	XLSIcon
} from '../../../../../components/Icons'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { FiDownload } from 'react-icons/fi'
import { AlertModal } from '../AlertModal'
import ProgressBar from '../../../../../components/progress/ProgressBar'
import ImportFileReview from '../importFileReview'
import Tabs from '../../../../../components/shared/tabs'
import useCheckImports, {
	ICheckImport,
	ICheckImportInput,
	IRowCounts
} from '../../../../../API/checkImports/useCheckImports'
import useCreateImport from '../../../../../API/checkImports/useCreateImport'
import BankSelectionModal from '../importFileReview/BankSelectionModal'
import useCancelImport from '../../../../../API/checkImports/useCancelImport'
import useExportRows from '../../../../../API/checkImports/useExportRows'
import useDownloadImport from '../../../../../API/checkImports/useDownloadImport'
import { calculateProgressPercentage } from '../../../utils/helpers'
import useCheckImportTemplate from '../../../../../API/checkImports/useCheckImportTemplate'

interface ActionCellMenuProps {
	status: ICheckImport['status']
	rowCounts: IRowCounts
	onShowCancel: () => void
	onShowFailed: () => void
	onView: () => void
	onExport: () => void
	onDownload: () => void
}

interface ImportFilesModalProps {
	open: boolean
	onClose: () => void
	attachments?: File[]
}

interface Column {
	id: string
	label: string
	width?: string
	align?: 'left' | 'right' | 'center'
}

const columns: Column[] = [
	{ id: 'fileName', label: 'File Name', width: '100px', align: 'center' },
	{
		id: 'dateOfUpload',
		label: 'Date of Upload',
		width: '100px',
		align: 'center'
	},
	{ id: 'status', label: 'Status', width: '100px', align: 'center' },
	{ id: 'progress', label: 'Progress', width: '100px', align: 'center' },
	{ id: 'action', label: 'Action', width: '150px', align: 'center' }
]

const ActionCellMenu: React.FC<ActionCellMenuProps> = ({
	rowCounts,
	status,
	onShowCancel,
	onShowFailed,
	onView,
	onExport,
	onDownload
}) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
	const open = Boolean(anchorEl)
	const handleMenuClick = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget)
	const handleMenuClose = () => setAnchorEl(null)

	return (
		<Box sx={modalStyles.actionCell}>
			{status === 'Completed' ? (
				<Button
					variant="outlined"
					startIcon={<VisibilityOutlinedIcon />}
					sx={modalStyles.actionButton}
					onClick={onView}
				>
					View
				</Button>
			) : (
				<Button
					variant="outlined"
					startIcon={<EditIcon />}
					sx={modalStyles.actionButton}
					onClick={onView}
				>
					Continue
				</Button>
			)}
			<MuiIconButton onClick={handleMenuClick}>
				<MoreVertIcon />
			</MuiIconButton>
			<Menu
				sx={modalStyles.actionMenuPaper}
				anchorEl={anchorEl}
				open={open}
				onClose={handleMenuClose}
			>
				<MenuItem
					onClick={() => {
						onDownload()
						handleMenuClose()
					}}
				>
					<FiDownload /> <Typography sx={{ ml: 1 }}>Download File</Typography>
				</MenuItem>
				<MenuItem
					hidden={status === 'Canceled' || !!rowCounts.submitted}
					onClick={() => {
						handleMenuClose()
						onShowCancel()
					}}
				>
					<CrossSequareIcon />
					<Typography sx={{ ml: 1 }}>Cancel</Typography>
				</MenuItem>
				<MenuItem
					onClick={() => {
						onExport()
						handleMenuClose()
					}}
				>
					<ExportIcon />
					<Typography sx={{ ml: 1 }}>Export</Typography>
				</MenuItem>
			</Menu>
		</Box>
	)
}

export const ImportFilesModal: React.FC<ImportFilesModalProps> = ({
	open,
	onClose
}) => {
	const { mutate: uploadFile, isPending: isUploadingFile } = useCreateImport()
	const { mutate: downloadTemplate } = useCheckImportTemplate()

	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [bankModalOpen, setBankModalOpen] = useState(false)
	const [selectedBank, setSelectedBank] = useState<Record<string, any> | null>(
		null
	)
	const [files, setFiles] = useState<null | File[]>(null)
	const [uploadedImport, setUploadedImport] = useState<ICheckImport | null>(
		null
	)

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)

		const droppedFiles = Array.from(e.dataTransfer.files)
		if (!selectedBank) {
			setFiles(droppedFiles)
			setBankModalOpen(true)
		} else {
			if (droppedFiles.length > 0) {
				processFiles(droppedFiles, selectedBank)
			}
		}
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || [])

		if (!selectedBank) {
			setFiles(selectedFiles)
			setBankModalOpen(true)
		} else {
			if (selectedFiles.length > 0) {
				processFiles(selectedFiles, selectedBank)
				e.target.value = ''
			}
		}
		e.target.value = ''
		e.target.files = undefined
	}

	const processFiles = (newFiles: File[], bank?: typeof selectedBank) => {
		const formData = new FormData()

		newFiles.forEach((file) => {
			formData.append('files', file)
			formData.append('originalname', file.name || '')
			formData.append('bankId', bank?._id)
		})

		uploadFile(formData, {
			onSuccess: (res) => {
				setUploadedImport(res.checkImport)
				setBankModalOpen(false)
				setFiles(null)
				setSelectedBank(null)
			},
			onError: () => {
				setBankModalOpen(false)
				setFiles(null)
				setSelectedBank(null)
			}
		})
	}

	return (
		<>
			<Dialog
				open={open}
				onClose={onClose}
				PaperProps={{
					sx: { ...globalStyles.dialog, minWidth: { xs: '90%', sm: '760px' } }
				}}
			>
				<Box sx={globalStyles.dialogHeader}>
					<DialogTitle sx={globalStyles.dialogTitle}>
						Imported files
					</DialogTitle>
					<IconButton onClick={onClose} sx={globalStyles.dialogCloseButton}>
						<CloseIcon />
					</IconButton>
				</Box>
				<DialogContent sx={{ p: 0, pb: '26px' }}>
					<Box sx={globalStyles.dialogContent}>
						<Typography sx={modalStyles.dragDropInfoText}>
							Start with our pre-filled Excel . CSV to follow the correct
							structure.{' '}
							<Link
								onClick={() => downloadTemplate()}
								sx={{ cursor: 'pointer' }}
							>
								Download Template
							</Link>
						</Typography>

						<Box
							sx={{
								border: isDragging
									? '2px dashed #3EA5F9'
									: '2px dashed #1e3a5f',
								backgroundColor: isDragging ? '#F0F9FF' : '#F9FAFB',
								...modalStyles.attachmentDragDrop
							}}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileInput}
								style={{ display: 'none' }}
								accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
							/>
							<CloudUploadOutlinedIcon
								sx={{ fontSize: 48, color: '#1e3a5f', mb: 2 }}
							/>
							<Typography variant="body1" sx={modalStyles.dragDropTitle}>
								Drag And Drop Files here
							</Typography>
							<Typography variant="body2" sx={modalStyles.dragDropSubtitle}>
								Supported File Format: CVS{' '}
								<Box sx={modalStyles.dragDropDot}>•</Box> Excel
							</Typography>
							<CustomButton
								disabled={isUploadingFile}
								endIcon={isUploadingFile && <CircularProgress size={'14px'} />}
								variant="outlined"
								color="primary"
								onClick={(e) => {
									e.stopPropagation()
									fileInputRef.current?.click()
								}}
							>
								Upload File
							</CustomButton>
						</Box>

						<Tabs
							tabsPanelProps={{}}
							useQueryParam={false}
							tabsData={[
								{
									title: 'In Review',
									titleNode: <Typography color="#1e3a5f">In Review</Typography>,
									component: (
										<ImportTableContainer
											status="In Review"
											currentImport={uploadedImport}
											clearCurrentImport={setUploadedImport}
										/>
									)
								},
								{
									title: 'completed',
									titleNode: <Typography color="green">Completed</Typography>,
									component: (
										<ImportTableContainer
											status="Completed"
											currentImport={uploadedImport}
											clearCurrentImport={setUploadedImport}
										/>
									)
								},
								{
									title: 'canceled',
									titleNode: <Typography color="red">Canceled</Typography>,
									component: (
										<ImportTableContainer
											status="Canceled"
											currentImport={uploadedImport}
											clearCurrentImport={setUploadedImport}
										/>
									)
								}
							]}
						/>
					</Box>
					{bankModalOpen && (
						<BankSelectionModal
							isLoading={isUploadingFile}
							open={bankModalOpen}
							onClose={() => setBankModalOpen(false)}
							selectedBank={selectedBank}
							onSave={(bank) => {
								setSelectedBank(bank)

								if (!files?.length) {
									setBankModalOpen(false)
								} else {
									processFiles(files, bank)
								}
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}

const ImportTableContainer = ({
	status,
	currentImport,
	clearCurrentImport
}: ICheckImportInput & {
	currentImport: ICheckImport | null
	clearCurrentImport: (val: null) => void
}) => {
	const { data, refetch: refreshImports } = useCheckImports({ status })
	const { mutate: cancelImport } = useCancelImport()
	const { mutate: exportRows } = useExportRows()
	const { mutate: downloadImport } = useDownloadImport()
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [showFailedModal, setShowFailedModal] = useState(false)

	const [selectedImport, setSelectedImport] = useState<null | ICheckImport>(
		() => currentImport ?? null
	)

	useEffect(() => {
		if (currentImport) {
			setSelectedImport(currentImport)
			clearCurrentImport(null)
		}
	}, [currentImport, clearCurrentImport])

	const renderUploadedFileCell = (row: ICheckImport, column: Column) => {
		if (column.id === 'fileName') {
			const isExcel =
				row.fileName.endsWith('.xls') || row.fileName.endsWith('.xlsx')
			const isCSV =
				row.fileName.endsWith('.csv') || row.fileName.endsWith('.CSV')
			const maxBaseLen = 7
			const fileName = row.fileName
			const lastDot = fileName.lastIndexOf('.')
			const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName
			const ext = lastDot !== -1 ? fileName.slice(lastDot) : ''
			const displayBase =
				base.length > maxBaseLen ? base.slice(0, maxBaseLen) + '...' : base
			const displayName = displayBase + ext
			return (
				<Box sx={modalStyles.fileNameCell}>
					{isExcel && <XLSIcon color="rgba(0, 0, 0, 0.87)" />}
					{isCSV && <CSVIcon color="rgba(0, 0, 0, 0.87)" />}
					<Tooltip title={fileName} arrow>
						<Typography sx={modalStyles.fileNameText}>{displayName}</Typography>
					</Tooltip>
				</Box>
			)
		}
		if (column.id === 'dateOfUpload') {
			return (
				<Box sx={modalStyles.dateCell}>
					{new Date(row.createdAt).toDateString()}
				</Box>
			)
		}
		if (column.id === 'status') {
			let label = 'In Review'
			let color = '#BDBDBD'
			let border = '1px solid #BDBDBD'
			let textColor = '#757575'
			let disabled = true
			if (status === 'Completed') {
				label = 'Completed'
				color = '#E6F4EA'
				border = '1px solid #058205'
				textColor = '#058205'
				disabled = false
			} else if (status === 'Canceled') {
				label = 'Canceled'
				color = '#FDEAEA'
				border = '1px solid #F03D3E'
				textColor = '#F03D3E'
				disabled = false
			}
			return (
				<Box sx={modalStyles.statusChip(color, border, textColor, disabled)}>
					{label}
				</Box>
			)
		}
		if (column.id === 'progress') {
			return (
				<>
					<ProgressBar
						percentage={calculateProgressPercentage(
							row.rowCounts.submitted,
							row.rowCounts.skipped,
							row.rowCounts.total
						)}
						total={row.rowCounts.total}
						value={row.rowCounts.total}
						isCompleted={status === 'Completed'}
						segments={{
							orangeSegment: row.rowCounts.valid,
							redSegment: row?.rowCounts?.invalid,
							greenSegment: row.rowCounts?.submitted,
							graySegment: row.rowCounts.skipped
						}}
					/>
				</>
			)
		}
		if (column.id === 'action') {
			return (
				<ActionCellMenu
					rowCounts={row.rowCounts}
					status={row.status}
					onShowCancel={() => {
						setSelectedImport(row)
						setShowCancelModal(true)
					}}
					onShowFailed={() => setShowFailedModal(true)}
					onView={() => {
						setSelectedImport(row)
					}}
					onExport={() => exportRows({ returnAs: 'csv', importId: row?._id })}
					onDownload={() => downloadImport({ importId: row?._id })}
				/>
			)
		}
		return (row as any)[column.id]
	}

	const handleCloseCancel = () => {
		setSelectedImport(null)
		setShowCancelModal(false)
	}
	const handleCancelImport = () => {
		cancelImport(
			{ importId: selectedImport?._id },
			{ onSuccess: () => handleCloseCancel() }
		)
	}
	const handleCloseFailed = () => setShowFailedModal(false)
	const handleTryAgain = () => {
		setShowFailedModal(false)
	}

	return (
		<Box>
			<CustomTable
				columns={columns}
				data={data?.importsList || []}
				renderCell={renderUploadedFileCell}
				isCenteredCells
				tableHight="300px"
			/>

			<AlertModal
				open={showCancelModal}
				onClose={handleCloseCancel}
				onConfirm={handleCancelImport}
				icon={<CrossSequareIcon color="#fff" width="60px" height="60px" />}
				title="Cancel Import?"
				description="Are you sure you want to cancel this import? All progress and added rows will be discarded."
				confirmLabel="Cancel Import"
				cancelLabel="Go Back"
			/>
			<AlertModal
				open={showFailedModal}
				onClose={handleCloseFailed}
				onConfirm={handleTryAgain}
				icon={<DocumentCrossIcon color="#fff" width="60px" height="60px" />}
				title="Import Failed"
				description="Without payee name you could not import your file. Because payee name is required field for all checks."
				confirmLabel="Try Again"
				cancelLabel="Cancel"
			/>
			{!!selectedImport && !showCancelModal && (
				<ImportFileReview
					open={!!selectedImport}
					onClose={() => {
						setSelectedImport(null)
						refreshImports()
					}}
					selectedImport={selectedImport}
				/>
			)}
		</Box>
	)
}

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Box,
	Typography,
	Button,
	Tooltip,
	Menu,
	MenuItem,
	DialogActions,
	CircularProgress,
	TextField
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
	CrossSequareIcon,
	EditIcon,
	ExportIcon,
	SkipIcon,
	RestoreIcon,
	EyeIcon
} from '../../../../../components/Icons'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { styles as globalStyles } from '../../../styles'
import { styles as modalStyles } from './styles'
import ProgressBar from '../../../../../components/progress/ProgressBar'
import { styles } from '../../../styles'
import AmountField from './AmountField'

import { FiDownload } from 'react-icons/fi'
import PayeeNameField from './PayeeNameField'
import useImportRows, {
	ICheckImportRow
} from '../../../../../API/checkImports/useImportRows'
import useValidateRow from '../../../../../API/checkImports/useValidateRow'
import useSaveRows from '../../../../../API/checkImports/useSaveRows'
import useExportRows from '../../../../../API/checkImports/useExportRows'
import useCancelImport from '../../../../../API/checkImports/useCancelImport'
import useDownloadImport from '../../../../../API/checkImports/useDownloadImport'
import useSubmitRows from '../../../../../API/checkImports/useSubmitRows'
import useFinalizeRows from '../../../../../API/checkImports/useFinalizeRows'
import CheckDetailContainerModal from './CheckDetailContainerModal'
import BankSelectionModal from './BankSelectionModal'
import { ICheckImport } from '../../../../../API/checkImports/useCheckImports'
import useBanks from '../../../../../API/banks/useBanks'
import useUpdateImportBank from '../../../../../API/checkImports/useUpdateImportBank'
import { getStatusColor, getStatusText } from '../../../utils/getStatusColor'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { AlertModal } from '../AlertModal'
import DateInput from './DateInput'
import { calculateProgressPercentage } from '../../../utils/helpers'
import usePayees from '../../../../../API/payees/usePayees'

import { GridColDef } from '@mui/x-data-grid'
import { getErrorState, renderOriginalValue } from './helpers'
import ImportReviewTabs from './components/ImportReviewTabs'
import ImportsLoadingModal from './components/importsLoadingModal'

interface ImportFileReviewProps {
	open: boolean
	onClose: () => void

	selectedImport: ICheckImport
}

const ImportFileReview: React.FC<ImportFileReviewProps> = ({
	open,
	onClose,
	selectedImport
}) => {
	const { data: payees } = usePayees()
	const { data, isLoading: isLoadingRows } = useImportRows({
		importId: selectedImport?._id
	})
	const { data: banksData } = useBanks()

	const { mutate: submitRows, isPending: isSubmittingRows } = useSubmitRows()
	const { mutate: finalizeRows, isPending: isFinalizing } = useFinalizeRows()
	const { mutate: saveRows, isPending: isSavingRows } = useSaveRows()
	const { mutate: validateRow } = useValidateRow()
	const { mutate: exportRows, isPending: isExportingRows } = useExportRows()
	const { mutate: updateImportBank, isPending: isUpdatingBank } =
		useUpdateImportBank()
	const { mutate: downloadImport, isPending: isDownloading } =
		useDownloadImport()
	const { mutate: cancelImport, isPending: isCancellingImport } =
		useCancelImport()

	const rows = data?.importRows || []

	const [allRows, setAllRows] = useState<ICheckImportRow[]>([])
	const [isBatchProcessing, setIsBatchProcessing] = useState(false)

	// 5. Memoize row categories to prevent recalculation
	const rowCategories = useMemo(
		() => ({
			valid: allRows.filter((row) => row.state === 'valid'),
			invalid: allRows.filter((row) => row.state === 'invalid'),
			skipped: allRows.filter((row) => row.state === 'skipped'),
			submitted: allRows.filter((row) => row.state === 'submitted')
		}),
		[allRows]
	)

	// Use the memoized categories instead of individual useMemo hooks
	const validRows = rowCategories.valid
	const invalidRows = rowCategories.invalid
	const skippedRows = rowCategories.skipped
	const submittedRows = rowCategories.submitted

	const [selectedValid] = useState<number[]>([])
	const [selectedSkipped] = useState<number[]>([])
	const [showValidRowsOnly, setShowValidRowsOnly] = useState<boolean>(false)
	const [showInvalidRowsOnly, setShowInvalidRowsOnly] = useState<boolean>(false)

	const [bankModalOpen, setBankModalOpen] = useState(false)
	const [selectedBank, setSelectedBank] = useState<Record<string, any> | null>(
		null
	)

	const [selectedRowCheckId, setSelectedRowCheckId] = useState<string | null>(
		null
	)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const [haveUnsavedChanges, setHaveUnsavedChanges] = useState(false)
	const [displayAlert, setDisplayAlert] = useState(false)

	// Show loading modal when data is loading OR when batch processing
	const showLoadingModal = isLoadingRows || isBatchProcessing

	// Process rows in batches when data arrives
	useEffect(() => {
		if (!rows || rows.length === 0) {
			setAllRows([])
			setIsBatchProcessing(false)
			return
		}

		// Start batch processing
		setIsBatchProcessing(true)
		const BATCH_SIZE = 100
		const BATCH_DELAY = 50 // ms

		let canceled = false
		let batchIndex = 0
		let batchedRows: ICheckImportRow[] = []

		const batchInterval = () => {
			if (canceled) {
				setIsBatchProcessing(false)
				return
			}

			const start = batchIndex * BATCH_SIZE
			const end = start + BATCH_SIZE
			const currentBatch = rows.slice(start, end)

			batchedRows.push(...currentBatch)
			setAllRows([...batchedRows])

			batchIndex++

			if (end < rows.length) {
				setTimeout(batchInterval, BATCH_DELAY)
			} else {
				// All batches processed
				setIsBatchProcessing(false)
			}
		}

		setAllRows([]) // Reset before starting batch set
		batchInterval()

		return () => {
			canceled = true
		}
	}, [rows])

	useEffect(() => {
		if (banksData?.data) {
			setSelectedBank(
				banksData?.data?.find((i) => i._id === selectedImport?.bankDetails?._id)
			)
		}
	}, [banksData?.data, selectedImport])

	const handleInputChange = useCallback(
		(
			rowId: string,
			colId: keyof ICheckImportRow,
			value: string | number,
			triggerValidation = false
		) => {
			// Step 1: Optimistically update the changed value
			setAllRows((prevRows) => {
				const updatedRows = [...prevRows]
				const rowIndex = updatedRows.findIndex((row) => row._id === rowId)

				if (rowIndex !== -1) {
					updatedRows[rowIndex] = {
						...updatedRows[rowIndex],
						[colId]: value
					}
				}

				return updatedRows
			})

			// Step 2: Always trigger backend validation
			if (triggerValidation) {
				const currentRow = allRows.find((row) => row._id === rowId)
				if (!currentRow) return

				const updatedRow = { ...currentRow, [colId]: value }

				validateRow(updatedRow, {
					onSuccess: (validatedRow) => {
						setAllRows((prevRows) => {
							// Step 3: Replace backend-validated row
							const newRows = prevRows.map((row) =>
								row._id === validatedRow._id ? validatedRow : row
							)

							// Step 4: Collect duplicate check numbers across all rows
							const numberMap = new Map<number, ICheckImportRow[]>()
							for (const row of newRows) {
								const number = row.finalCheckNumber
								if (!number) continue
								const existing = numberMap.get(number) || []
								numberMap.set(number, [...existing, row])
							}

							const duplicates = new Set<number>()
							for (const [number, group] of Array.from(numberMap.entries())) {
								if (group.length > 1) {
									duplicates.add(number)
								}
							}

							// Step 5: Update only valid/invalid rows that are involved in duplicates
							const finalRows: ICheckImportRow[] = newRows.map((row) => {
								const isDuplicate = duplicates.has(row.finalCheckNumber)
								const isEditable =
									row.state !== 'submitted' && row.state !== 'skipped'

								if (!isDuplicate || !isEditable) {
									return row // Leave submitted/skipped or non-duplicate rows unchanged
								}

								const backendErrors = row.validationErrors['checkNumber'] || []
								const mergedErrors = Array.from(
									new Set([...backendErrors, 'Check number must be unique'])
								)

								const updatedValidationErrors = {
									...row.validationErrors,
									checkNumber: mergedErrors
								}

								const hasAnyError = Object.values(updatedValidationErrors).some(
									(errs) => errs && errs.length > 0
								)

								const finalState: ICheckImportRow['state'] = hasAnyError
									? 'invalid'
									: 'valid'

								return {
									...row,
									validationErrors: updatedValidationErrors,
									state: finalState
								}
							})

							return finalRows
						})
					}
				})
			}
		},
		[allRows]
	)

	const handleValidRowsFilter = (checked: boolean) => {
		setShowValidRowsOnly(checked)
	}

	const handleInvalidRowsFilter = (checked: boolean) => {
		setShowInvalidRowsOnly(checked)
		if (checked) setShowValidRowsOnly(false)
	}

	const segments = {
		orangeSegment: validRows.length,
		redSegment: invalidRows.length,
		greenSegment: submittedRows.length,
		graySegment: skippedRows.length
	}

	const handleSkipRow = useCallback((row: ICheckImportRow) => {
		setHaveUnsavedChanges(true)
		setAllRows((prev) => {
			const newRows = [...prev]
			const rowIndex = newRows.findIndex((item) => item._id === row._id)
			if (rowIndex !== -1) {
				newRows[rowIndex] = { ...newRows[rowIndex], state: 'skipped' }
			}
			return newRows
		})
	}, [])

	const handleRestoreSkipped = useCallback((rowIdx) => {
		setHaveUnsavedChanges(true)
		setAllRows((prev) => {
			const newRows = [...prev]
			const rowIndex = newRows.findIndex((item) => item._id === rowIdx._id)
			if (rowIndex !== -1) {
				newRows[rowIndex] = { ...newRows[rowIndex], state: 'valid' }
			}
			return newRows
		})
	}, [])

	const handleSkipSelected = async () => {}

	const handleRestoreSelected = async () => {
		setHaveUnsavedChanges(true)
		setAllRows((prev) =>
			prev.map((i) => (i.state === 'skipped' ? { ...i, state: 'valid' } : i))
		)
	}

	const handleSubmit = () => {
		if (haveUnsavedChanges) {
			saveRows(
				{
					importId: selectedImport?._id,
					rows: allRows.filter((item) => item.state !== 'submitted')
				},
				{
					onSuccess: () => {
						submitRows({
							rowIds: allRows.map((i) => i._id),
							importId: selectedImport?._id
						})
					}
				}
			)
		} else {
			submitRows({
				rowIds: allRows.map((i) => i._id),
				importId: selectedImport?._id
			})
		}
		setHaveUnsavedChanges(false)
	}

	const handleMenuClick = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget)

	const handleMenuClose = () => setAnchorEl(null)

	const handleDownload = () => {
		downloadImport(
			{ importId: selectedImport?._id },
			{
				onSuccess: () => {
					handleMenuClose()
				}
			}
		)
	}

	const handleCancel = () => {
		cancelImport(
			{ importId: selectedImport?._id },
			{
				onSuccess: () => {
					onClose()
				}
			}
		)
	}

	const handleExport = () => {
		exportRows(
			{ returnAs: 'csv', importId: selectedImport?._id },
			{
				onSuccess: () => {
					handleMenuClose()
				}
			}
		)
	}

	const handleSaveRows = () => {
		saveRows(
			{
				importId: selectedImport?._id,
				rows: allRows.filter((item) => item.state !== 'submitted')
			},
			{ onSuccess: () => setHaveUnsavedChanges(false) }
		)
	}

	const handleFinalize = () => {
		finalizeRows({ importId: selectedImport?._id })
	}

	const handleUpdateBank = (bank: Record<string, any>) => {
		updateImportBank(
			{
				bankAccountId: bank?._id,
				importId: selectedImport?._id
			},
			{
				onSuccess: () => {
					setSelectedBank(bank)
					setBankModalOpen(false)
				}
			}
		)
	}

	const handleCloseModal = () => {
		if (!haveUnsavedChanges) {
			onClose()
		} else {
			setDisplayAlert(true)
		}
	}

	function getDataGridColumns(status: ICheckImportRow['state']): GridColDef[] {
		const editable = status === 'invalid' || status === 'valid'

		const onFieldChange = (
			colId: keyof ICheckImportRow,
			value: string | number,
			triggerValidation = true,
			isEditable = true,
			row: ICheckImportRow
		) => {
			setHaveUnsavedChanges(true)
			if (isEditable) {
				handleInputChange(row._id, colId, value, triggerValidation)
			}
		}

		const baseColumns: GridColDef<ICheckImportRow>[] = [
			{
				field: 'rowNo',
				headerName: 'Row No.',
				headerClassName: 'customHeaderCell',
				// flex: 0.5,
				minWidth: 80,
				align: 'left',
				headerAlign: 'left',
				renderCell: ({ row }) => row.rowNumber
			},
			{
				field: 'checkNo',
				headerName: 'Check No.',
				headerClassName: 'customHeaderCell',
				// flex: 1,
				minWidth: 80,
				align: 'center',
				headerAlign: 'center',
				editable:
					editable &&
					selectedBank?.bankPreferences?.checkNoGeneration !== 'auto',
				renderEditCell: ({ field, row }) => {
					const { isError, errorMessage } = getErrorState({
						row,
						key: 'checkNumber'
					})

					return (
						<Box>
							{renderOriginalValue({
								modalStyles,
								value: row.originalCheckNumber,
								status
							})}
							<TextField
								error={isError}
								fullWidth
								size="small"
								value={row.finalCheckNumber || ''}
								onChange={(e) =>
									onFieldChange(
										'finalCheckNumber',
										+e.target.value,
										true,
										true,
										row
									)
								}
								InputProps={{
									endAdornment: isError && (
										<Tooltip
											title={<span>{errorMessage}</span>}
											placement="top"
											arrow
											componentsProps={{ tooltip: { sx: modalStyles.tooltip } }}
										>
											<Typography sx={modalStyles.infoIcon}>ⓘ</Typography>
										</Tooltip>
									)
								}}
							/>
						</Box>
					)
				},
				renderCell: ({ row }) => {
					const displayAuto =
						selectedBank?.bankPreferences?.checkNoGeneration === 'auto'

					const finalCheckNumber =
						status === 'submitted'
							? row.finalCheckNumber
							: displayAuto
							? ' auto'
							: row.finalCheckNumber

					const { isError, errorMessage } = getErrorState({
						row,
						key: 'checkNumber'
					})

					return (
						<Box>
							{!displayAuto &&
								renderOriginalValue({
									modalStyles,
									value: row.originalCheckNumber,
									status
								})}
							<Typography
								color={displayAuto ? 'black' : isError ? 'red' : 'black'}
								display="flex"
								alignItems="center"
								gap={1}
							>
								{finalCheckNumber}
								{isError && !displayAuto && (
									<Tooltip
										title={<span>{errorMessage}</span>}
										placement="top"
										arrow
										componentsProps={{ tooltip: { sx: modalStyles.tooltip } }}
									>
										<Typography sx={modalStyles.infoIcon}>ⓘ</Typography>
									</Tooltip>
								)}
							</Typography>
						</Box>
					)
				}
			},
			{
				field: 'amount',
				headerName: 'Amount',
				headerClassName: 'customHeaderCell',
				flex: 1,
				minWidth: 160,
				align: 'center',
				headerAlign: 'center',
				editable,
				renderEditCell: ({ row }) => {
					const { isError, errorMessage } = getErrorState({
						row,
						key: 'amount'
					})
					return (
						<AmountField
							value={`${row.finalAmount}`}
							originalValue={row?.originalAmount}
							isInvalid={isError}
							errorMessage={errorMessage}
							onChange={(e) =>
								onFieldChange('finalAmount', +e.target.value, true, true, row)
							}
							isSkipped={row.state === 'skipped'}
							isEditable={row.state === 'valid' || row.state === 'invalid'}
							showDualValues
							modalStyles={modalStyles}
						/>
					)
				},
				renderCell: ({ row }) => {
					const { isError, errorMessage } = getErrorState({
						row,
						key: 'amount'
					})

					return (
						<Box>
							{renderOriginalValue({
								modalStyles,
								value: row.originalAmount,
								status,
								textAlign: 'center'
							})}

							{isError ? (
								<Typography
									sx={{ ...modalStyles.editedValue, color: '#EF4444' }}
									display="flex"
									gap={0.8}
								>
									<span>${row.finalAmount}</span>
									<Tooltip
										title={<span>{errorMessage}</span>}
										placement="top"
										arrow
										componentsProps={{ tooltip: { sx: modalStyles.tooltip } }}
									>
										<Typography sx={modalStyles.infoIcon}>ⓘ</Typography>
									</Tooltip>
								</Typography>
							) : (
								<Typography sx={modalStyles.editedValue}>
									<strong style={{ fontWeight: '500', marginRight: '1px' }}>
										$
									</strong>
									{row.finalAmount}{' '}
								</Typography>
							)}
						</Box>
					)
				}
			},
			{
				field: 'payeeName',
				headerName: 'Payee Name',
				headerClassName: 'customHeaderCell',
				flex: 1,
				minWidth: 200,
				editable,
				align: 'left',
				headerAlign: 'left',
				renderEditCell: ({ api, id, field, row }) => (
					<>
						<PayeeNameField
							key={row.finalPayeeId}
							payees={payees?.data || []}
							rows={allRows.filter(
								(i) =>
									['valid', 'invalid'].includes(i.state) && i._id !== row._id
							)}
							value={row.finalPayeeId}
							originalValue={row?.originalPayeeName}
							isInvalid={!!row?.validationErrors['payeeId']?.length}
							onChange={(value) =>
								onFieldChange('finalPayeeId', value, true, true, row)
							}
							onAddNewPayee={() => {}}
							isSkipped={false}
							isEditable
							showDualValues
							modalStyles={modalStyles}
							onApplyToAll={async (newFinalPayeeId) => {
								setHaveUnsavedChanges(true)

								const updatedRows = allRows.map((item) => {
									const isEditable = !['submitted', 'skipped'].includes(
										item.state
									)
									const isMatching =
										item.originalPayeeName === row.originalPayeeName

									if (isEditable && isMatching) {
										// Clear payeeId errors
										const updatedValidationErrors = {
											...item.validationErrors,
											payeeId: []
										}

										// Check if all error arrays are empty
										const hasNoErrors = Object.values(
											updatedValidationErrors
										).every((errors) => errors.length === 0)

										return {
											...item,
											finalPayeeId: newFinalPayeeId,
											validationErrors: updatedValidationErrors,
											state: hasNoErrors ? 'valid' : item.state
										} satisfies ICheckImportRow
									}

									return item
								})

								setAllRows(updatedRows)
								api.stopCellEditMode({ id, field })
							}}
						/>
					</>
				),
				renderCell: ({ row }) => {
					const payeeName = payees?.data?.find(
						(i) => i._id === row.finalPayeeId
					)?.name
					const { isError } = getErrorState({ row, key: 'payeeId' })
					return (
						<Box>
							{renderOriginalValue({
								modalStyles,
								value: row.originalPayeeName,
								status
							})}
							{isError ? (
								<Typography
									sx={{ ...modalStyles.editedValue, color: '#EF4444' }}
									display="flex"
									gap={1}
								>
									<span>{row.originalPayeeName}</span>
									<Tooltip
										title={<span>Payee does not exist</span>}
										placement="top"
										arrow
										componentsProps={{ tooltip: { sx: modalStyles.tooltip } }}
									>
										<Typography sx={modalStyles.infoIcon}>ⓘ</Typography>
									</Tooltip>
								</Typography>
							) : (
								<Typography sx={modalStyles.editedValue}>
									{payeeName}
								</Typography>
							)}
						</Box>
					)
				}
			},
			{
				field: 'issueDate',
				headerName: 'Issue Date',
				headerClassName: 'customHeaderCell',
				flex: 1,
				minWidth: 180,
				editable,
				renderEditCell: ({ row }) => (
					<DateInput
						originalValue={row.originalIssueDate}
						value={row.finalIssueDate}
						onChange={(value) =>
							onFieldChange('finalIssueDate', value, false, true, row)
						}
					/>
				),
				renderCell: ({ row }) => (
					<Box>
						{renderOriginalValue({
							modalStyles,
							value: (
								<span>{new Date(row.originalIssueDate).toDateString()}</span>
							),
							status
						})}
						{row.finalIssueDate ? (
							<Typography sx={modalStyles.editedValue}>
								{new Date(row.finalIssueDate).toDateString()}
							</Typography>
						) : (
							''
						)}
					</Box>
				)
			},
			{
				field: 'memo',
				headerName: 'Memo',
				headerClassName: 'customHeaderCell',
				flex: 1,
				minWidth: 150,
				editable,
				renderEditCell: ({ row }) => (
					<Box display={'flex'} flexDirection={'column'} sx={{ p: '0px 6px' }}>
						{renderOriginalValue({
							modalStyles,
							value: row.originalNote,
							status
						})}
						<TextField
							fullWidth
							size="small"
							sx={{
								'& .MuiOutlinedInput-root': {
									backgroundColor: '#fff',
									height: '20px',
									fontSize: '12px',
									mt: '3px',
									'& .MuiOutlinedInput-input': {
										pl: '7px'
									}
								}
							}}
							value={row.finalNote || ''}
							onChange={({ target: { value } }) =>
								onFieldChange('finalNote', value, false, true, row)
							}
						/>
					</Box>
				),
				renderCell: ({ row }) => (
					<Box display={'flex'} flexDirection={'column'} sx={{ p: '0px 6px' }}>
						{renderOriginalValue({
							modalStyles,
							value: row.originalNote,
							status
						})}

						<Tooltip
							title={<span>{row.finalNote}</span>}
							placement="top"
							arrow
							componentsProps={{ tooltip: { sx: modalStyles.tooltip } }}
						>
							<Typography sx={modalStyles.editedValue}>
								{row.finalNote}
							</Typography>
						</Tooltip>
					</Box>
				)
			},
			{
				field: 'invoiceId',
				headerName: 'Invoice ID',
				headerClassName: 'customHeaderCell',
				flex: 1,
				minWidth: 180,
				align: 'center',
				headerAlign: 'center',
				editable,
				renderEditCell: ({ api, id, field, row }) => (
					<Box display={'flex'} flexDirection={'column'} sx={{ p: '0px 6px' }}>
						{renderOriginalValue({
							modalStyles,
							value: row.originalInvoiceId,
							status
						})}
						<TextField
							fullWidth
							size="small"
							sx={{
								'& .MuiOutlinedInput-root': {
									backgroundColor: '#fff',
									height: '20px',
									fontSize: '12px',
									mt: '3px',
									'& .MuiOutlinedInput-input': {
										pl: '7px'
									}
								}
							}}
							value={row.finalInvoiceId}
							onChange={(e) =>
								api.setEditCellValue({ id, field, value: e.target.value }, e)
							}
						/>
					</Box>
				),
				renderCell: ({ row }) => (
					<Box>
						{renderOriginalValue({
							modalStyles,
							value: row.originalInvoiceId,
							status
						})}
						<Typography sx={modalStyles.editedValue}>
							{row.finalInvoiceId}
						</Typography>
					</Box>
				)
			},
			{
				field: 'actions',
				headerName: 'Actions',
				headerClassName: 'customHeaderCell',
				flex: 1,
				minWidth: 100,
				sortable: false,
				hideSortIcons: true,
				filterable: false,
				align: 'center',
				headerAlign: 'center',
				renderCell: ({ row }) => {
					return (
						<Box sx={modalStyles.actionsCell}>
							{(row.state === 'valid' || row.state === 'invalid') && (
								<Tooltip
									title={
										<span>
											Skip this row from current import.
											<br />
											You can restore it later.
										</span>
									}
									placement="top"
									arrow
									componentsProps={{ tooltip: { sx: styles.tooltip } }}
								>
									<IconButton
										disabled={!row?._id}
										size="small"
										onClick={() => handleSkipRow(row)}
									>
										<SkipIcon width="20px" height="20px" color="#1e3a5f" />
									</IconButton>
								</Tooltip>
							)}
							{row.state === 'skipped' && (
								<Tooltip
									title={
										<span>
											Restore this row from this skipped row. You can skip it
											later.
										</span>
									}
									placement="top"
									arrow
									componentsProps={{
										tooltip: { sx: styles.tooltip }
									}}
								>
									<Button
										disabled={!row?._id}
										size="small"
										color="primary"
										onClick={() => handleRestoreSkipped(row)}
										startIcon={<RestoreIcon />}
									></Button>
								</Tooltip>
							)}
							{row.state === 'submitted' && !!row.checkDetails?._id && (
								<Tooltip
									title="View Check"
									placement="top"
									arrow
									componentsProps={{
										tooltip: { sx: styles.tooltip }
									}}
								>
									<IconButton
										size="small"
										onClick={() => setSelectedRowCheckId(row.checkId)}
									>
										<EyeIcon />
									</IconButton>
								</Tooltip>
							)}
						</Box>
					)
				}
			}
		]

		if (status === 'submitted') {
			const statusColumn: GridColDef = {
				field: 'status',
				headerName: 'Status',
				flex: 1,
				minWidth: 180,
				editable: false,
				renderCell: ({ row }) => {
					const status = row?.checkDetails?.status
					return (
						status && (
							<CustomButton
								size="small"
								sx={{
									color: getStatusColor(status),
									backgroundColor: `${getStatusColor(status)}0D`,
									border: `1px solid ${getStatusColor(status)}`,
									'&:hover': {
										backgroundColor: `${getStatusColor(status)}1A`,
										border: `1px solid ${getStatusColor(status)}`
									},
									'& .MuiBox-root': {
										display: 'flex',
										alignItems: 'center',
										gap: '5px'
									}
								}}
							>
								{getStatusText(status)}
							</CustomButton>
						)
					)
				}
			}

			const actionsIndex = baseColumns.findIndex(
				(col) => col.field === 'actions'
			)
			if (actionsIndex !== -1) {
				baseColumns.splice(actionsIndex, 0, statusColumn)
			} else {
				baseColumns.push(statusColumn)
			}
		}

		return baseColumns
	}

	return (
		<>
			{/* Main Review Modal - Always shows the review interface */}
			<Dialog open={open} onClose={handleCloseModal} maxWidth="xl" fullWidth>
				<Box sx={globalStyles.dialogHeader}>
					<DialogTitle
						sx={{
							...modalStyles.dialogTitle,
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: 1
						}}
					>
						Review:{' '}
						<Typography
							sx={{ ...modalStyles.dialogTitle, ...modalStyles.dynamicTitle }}
						>
							{selectedImport?.fileName}
						</Typography>
					</DialogTitle>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
						<IconButton
							onClick={handleMenuClick}
							sx={{ color: 'rgba(206, 206, 206, 1)', p: 0 }}
						>
							<MoreVertIcon />
						</IconButton>
						<Menu
							sx={modalStyles?.actionMenuPaper}
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							<MenuItem
								onClick={handleDownload}
								sx={modalStyles.actionMenuItem}
							>
								<FiDownload />
								<Typography sx={modalStyles.actionMenuItemText}>
									Download File &nbsp;
									{isDownloading && <CircularProgress size="14px" />}
								</Typography>
							</MenuItem>
							<MenuItem
								hidden={!!selectedImport?.rowCounts?.submitted}
								onClick={handleCancel}
								sx={modalStyles.actionMenuItem}
							>
								<CrossSequareIcon />
								<Typography sx={modalStyles.actionMenuItemText}>
									Cancel &nbsp;
									{isCancellingImport && <CircularProgress size={'14px'} />}
								</Typography>
							</MenuItem>
							<MenuItem onClick={handleExport} sx={modalStyles.actionMenuItem}>
								<ExportIcon />
								<Typography sx={modalStyles.actionMenuItemText}>
									Export &nbsp;
									{isExportingRows && <CircularProgress size={'14px'} />}
								</Typography>
							</MenuItem>
						</Menu>
						<IconButton
							onClick={handleCloseModal}
							sx={globalStyles.dialogCloseButton}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</Box>

				<DialogContent sx={modalStyles.dialogContent}>
					<Box sx={modalStyles.bankSection}>
						{/* Bank name */}
						<Box sx={modalStyles.bankName}>
							<Typography sx={modalStyles.bankNameText}>
								{selectedBank?.bankName}
							</Typography>
							<IconButton
								hidden={!!submittedRows?.length}
								disabled={!!submittedRows?.length}
								size="small"
								sx={modalStyles.editIcon}
								onClick={() => setBankModalOpen(true)}
							>
								<EditIcon color="rgba(30, 58, 95, 1)" width="20" height="20" />
							</IconButton>
						</Box>
						{/* Progress bar and legend */}
						<Box sx={modalStyles.progressBox}>
							<Box sx={modalStyles.progressBar}>
								<ProgressBar
									key={JSON.stringify(segments)}
									percentage={calculateProgressPercentage(
										submittedRows.length,
										skippedRows.length,
										allRows?.length
									)}
									total={allRows.length}
									value={allRows.length}
									isCompleted={false}
									segments={segments}
								/>
							</Box>
							<Box sx={modalStyles.progressLegend}>
								<Box sx={modalStyles.legendItem}>
									<Box sx={modalStyles.legendDot('#FF9800', undefined)} />
									<Typography variant="caption" sx={modalStyles.legendText}>
										Valid Rows {validRows.length}
									</Typography>
								</Box>
								<Box sx={modalStyles.legendItem}>
									<Box sx={modalStyles.legendDot('#F44336', undefined)} />
									<Typography variant="caption" sx={modalStyles.legendText}>
										Invalid Rows ({invalidRows.length})
									</Typography>
								</Box>
								<Box sx={modalStyles.legendItem}>
									<Box sx={modalStyles.legendDot('#058205', undefined)} />
									<Typography variant="caption" sx={modalStyles.legendText}>
										Submitted Rows ({submittedRows.length})
									</Typography>
								</Box>
								<Box sx={modalStyles.legendItem}>
									<Box
										sx={modalStyles.legendDot('#e2e8f0', '1px solid #e2e8f0')}
									/>
									<Typography variant="caption" sx={modalStyles.legendText}>
										Skipped Rows ({skippedRows.length})
									</Typography>
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Import Review Tabs */}
					<ImportReviewTabs
						validRows={validRows}
						invalidRows={invalidRows}
						submittedRows={submittedRows}
						skippedRows={skippedRows}
						allRows={allRows}
						selectedValid={selectedValid}
						selectedSkipped={selectedSkipped}
						showValidRowsOnly={showValidRowsOnly}
						showInvalidRowsOnly={showInvalidRowsOnly}
						isSubmittingRows={isSubmittingRows}
						isSavingRows={isSavingRows}
						selectedImport={selectedImport}
						modalStyles={modalStyles}
						getDataGridColumns={getDataGridColumns}
						onValidRowsFilter={handleValidRowsFilter}
						onInvalidRowsFilter={handleInvalidRowsFilter}
						onSkipSelected={handleSkipSelected}
						onRestoreSelected={handleRestoreSelected}
						onSubmit={handleSubmit}
					/>
				</DialogContent>

				<DialogActions sx={{ ...modalStyles.dialogActions }}>
					<Box
						hidden={selectedImport?.status === 'Completed'}
						sx={{
							...modalStyles.addPayeeModalActions
						}}
					>
						<Button
							variant="text"
							color="primary"
							onClick={handleCloseModal}
							sx={{
								...modalStyles.addPayeeModalCancelBtn,
								minWidth: { xs: '80px', md: '100px' }
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSaveRows}
							variant="outlined"
							color="primary"
							sx={{
								...modalStyles.addPayeeModalCancelBtn,
								background: '#fff',
								border: '1px solid rgba(30, 58, 95, 1)',
								minWidth: { xs: '80px', md: '100px' }
							}}
							disabled={isSavingRows || !haveUnsavedChanges}
							endIcon={isSavingRows && <CircularProgress size={'14px'} />}
						>
							Save
						</Button>
						<Button
							disabled={
								allRows.some(
									(item) =>
										item.state !== 'submitted' && item.state !== 'skipped'
								) || isFinalizing
							}
							variant="contained"
							color="primary"
							sx={{
								...modalStyles.addPayeeModalSaveBtn,
								minWidth: { xs: '80px', md: '100px' }
							}}
							onClick={handleFinalize}
							endIcon={isFinalizing && <CircularProgress size={'14px'} />}
						>
							Finalize
						</Button>
					</Box>
				</DialogActions>
			</Dialog>

			{/* Loading Modal - Shows on top when data is loading */}
			<ImportsLoadingModal openModal={showLoadingModal} />

			{displayAlert && (
				<AlertModal
					open={displayAlert}
					onClose={() => {
						setDisplayAlert(false)
					}}
					onConfirm={() => {
						onClose()
					}}
					type="unsaved"
				/>
			)}

			{/* Add Payee Modal */}

			{selectedRowCheckId && (
				<CheckDetailContainerModal
					open
					checkId={selectedRowCheckId}
					onClose={() => setSelectedRowCheckId(null)}
				/>
			)}

			{bankModalOpen && (
				<BankSelectionModal
					open={bankModalOpen}
					onClose={() => setBankModalOpen(false)}
					selectedBank={selectedBank}
					onSave={handleUpdateBank}
					isLoading={isUpdatingBank}
				/>
			)}
		</>
	)
}

export default ImportFileReview

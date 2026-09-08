import React from 'react'
import {
	Box,
	Typography,
	Button,
	Checkbox,
	CircularProgress
} from '@mui/material'
import {
	CheckBoxCheckedIcon,
	CheckBoxUncheckedIcon,
	SkipIcon
} from '../../../../../../components/Icons'
import { ICheckImportRow } from '../../../../../../API/checkImports/useImportRows'
import CustomDataGrid from '../CustomDataGrid'
import { GridColDef } from '@mui/x-data-grid'
import { styles as modalStyles } from '../styles'
import { styles } from './styles'

interface ValidInvalidRowsTableProps {
	validRows: ICheckImportRow[]
	invalidRows: ICheckImportRow[]
	allRows: ICheckImportRow[]
	selectedValid: number[]
	showValidRowsOnly: boolean
	showInvalidRowsOnly: boolean
	isSubmittingRows: boolean
	isSavingRows: boolean
	getDataGridColumns: (status: ICheckImportRow['state']) => GridColDef[]
	onValidRowsFilter: (checked: boolean) => void
	onInvalidRowsFilter: (checked: boolean) => void
	onSkipSelected: () => void
	onSubmit: () => void
}

const ValidInvalidRowsTable: React.FC<ValidInvalidRowsTableProps> = ({
	validRows,
	invalidRows,
	allRows,
	selectedValid,
	showValidRowsOnly,
	showInvalidRowsOnly,
	isSubmittingRows,
	isSavingRows,
	getDataGridColumns,
	onValidRowsFilter,
	onInvalidRowsFilter,
	onSkipSelected,
	onSubmit
}) => {
	const getFilteredRows = () => {
		if (showValidRowsOnly) {
			return allRows.filter((i) => i.state === 'valid')
		} else if (showInvalidRowsOnly) {
			return allRows.filter((i) => i.state === 'invalid')
		} else {
			return allRows.filter((i) => i.state === 'valid' || i.state === 'invalid')
		}
	}

	const filteredRows = getFilteredRows()

	return (
		<Box>
			{/* Filter and Actions */}
			<Box sx={modalStyles.filterSubmitBox}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: { xs: '100%', sm: 'auto' }
					}}
				>
					<Typography sx={modalStyles.validTitle}>
						Valid And Invalid Rows
					</Typography>
					{/* Below button would be hidden on Desktop */}
					<Button
						sx={{
							...modalStyles.filterSubmitButton,
							display: { xs: 'flex', sm: 'none' }
						}}
						variant="contained"
						color="primary"
						onClick={onSubmit}
						disabled={!validRows.length || isSubmittingRows || isSavingRows}
						endIcon={
							(isSubmittingRows || isSavingRows) && (
								<CircularProgress size={'14px'} />
							)
						}
					>
						Submit &nbsp;
						<Typography sx={modalStyles.filterSubmitButtonSpan}>
							({validRows.length} Valid Rows)
						</Typography>
					</Button>
				</Box>
				<Box sx={modalStyles.filterSubmitBoxRight}>
					<Button
						variant="outlined"
						color="primary"
						onClick={onSkipSelected}
						sx={{
							...modalStyles.skipButton,
							display: selectedValid.length === 0 ? 'none' : 'flex'
						}}
						startIcon={<SkipIcon width="18px" height="18px" color="#1e3a5f" />}
					>
						Skip Rows
					</Button>
					<Box sx={modalStyles.filterCheckboxInner}>
						<Typography sx={modalStyles.filterCheckboxText}>
							Filter by:
						</Typography>
						<Box sx={modalStyles.filterCheckboxInnerInner}>
							<Checkbox
								checked={showValidRowsOnly}
								onChange={(e) => onValidRowsFilter(e.target.checked)}
								icon={<CheckBoxUncheckedIcon width="18px" height="18px" />}
								checkedIcon={<CheckBoxCheckedIcon width="18px" height="18px" />}
								sx={modalStyles.filterCheckbox}
							/>{' '}
							<Typography sx={modalStyles.filterCheckboxText}>
								Valid Rows
							</Typography>
							<Checkbox
								checked={showInvalidRowsOnly}
								onChange={(e) => onInvalidRowsFilter(e.target.checked)}
								icon={<CheckBoxUncheckedIcon width="18px" height="18px" />}
								checkedIcon={<CheckBoxCheckedIcon width="18px" height="18px" />}
								sx={modalStyles.filterCheckbox}
							/>{' '}
							<Typography sx={modalStyles.filterCheckboxText}>
								Invalid Rows
							</Typography>
						</Box>
					</Box>
					{/* Below button would be hidden on mobile */}
					<Button
						sx={{
							...modalStyles.filterSubmitButton,
							display: { xs: 'none', sm: 'flex' }
						}}
						variant="contained"
						color="primary"
						onClick={onSubmit}
						disabled={!validRows.length || isSubmittingRows}
						endIcon={
							<>{isSubmittingRows && <CircularProgress size={'14px'} />}</>
						}
					>
						Submit &nbsp;
						<Typography sx={modalStyles.filterSubmitButtonSpan}>
							({validRows.length} Valid Rows)
						</Typography>
					</Button>
				</Box>
			</Box>

			{/* Valid/Invalid Table */}
			<CustomDataGrid
				editMode="cell"
				density="comfortable"
				rows={filteredRows}
				columns={getDataGridColumns('valid')}
				rowSelection={false}
				getRowId={(i) => i._id}
				pageSizeOptions={[25, 50, 75, 100]}
				sx={styles.datagridWrapper}
			/>
		</Box>
	)
}

export default ValidInvalidRowsTable

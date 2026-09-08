import React, { useState } from 'react'
import {
	Box,
	Typography,
	Select,
	MenuItem,
	Tooltip,
	SelectChangeEvent,
	FormControl
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import FormModalMUI from '../../../../../components/shared/Modals/FormModalMUI'
import AddPayee from '../../../../../components/views/forms/AddPayee'
import { UpdatePayeeNameModal } from './UpdatePayeeNameModal'
import { ICheckImportRow } from '../../../../../API/checkImports/useImportRows'

interface PayeeNameFieldProps {
	payees: Record<string, any>[]
	rows: ICheckImportRow[]
	value: string
	originalValue?: string
	isInvalid: boolean
	onChange: (value: string) => void
	onAddNewPayee: () => void
	isSkipped?: boolean
	isEditable?: boolean
	showDualValues?: boolean
	modalStyles: { [key: string]: any }
	onApplyToAll?: (value: string) => void
}

const PayeeNameField: React.FC<PayeeNameFieldProps> = ({
	rows,
	value,
	originalValue = '',
	isInvalid,
	onChange,
	isSkipped = false,
	isEditable = true,
	showDualValues = true,
	modalStyles,
	onApplyToAll,
	payees
}) => {
	const [openPayeeModal, setOpenPayeeModal] = useState(false)

	const [selected, setSelected] = useState('')

	const [openModal, setOpenModal] = useState(false)

	const currentPayee = payees?.find((item) =>
		selected ? item?._id === selected : item?._id === value
	)

	const handlePayeeChange = (event: SelectChangeEvent<string>) => {
		const rowsWithSamePayeeId = rows.find(
			(i) => i.originalPayeeName === originalValue
		)

		if (event.target.value !== '') {
			if (!!rowsWithSamePayeeId) {
				setOpenModal(true)
				setSelected(event.target.value)
			} else {
				onChange(event.target.value)
			}
		}
	}

	// If row is skipped or not editable without dual values, show static value only
	if (isSkipped || (!isEditable && !showDualValues)) {
		return (
			<span
				style={{
					color: isInvalid ? '#EF4444' : undefined
				}}
			>
				{currentPayee?.name}
			</span>
		)
	}

	// Non-editable dual values display
	if (showDualValues && !isEditable) {
		return (
			<Box sx={modalStyles.dualValueCell}>
				{/* Current/edited value (non-editable) */}
				<Box sx={modalStyles.editableValueContainer}>
					<Typography
						sx={{
							...modalStyles.editedValue,
							color: isInvalid ? '#EF4444' : '#000'
						}}
					>
						{currentPayee?.name}
					</Typography>
				</Box>
			</Box>
		)
	}

	// Editable dual values display
	return (
		<Box sx={modalStyles.dualValueCell}>
			{/* Original value (non-editable) */}
			<Typography sx={modalStyles.originalValue}>{originalValue}</Typography>
			{/* Editable value */}
			<Box sx={{ ...modalStyles.editableValueContainer, border: 'none' }}>
				<Select
					value={value}
					onChange={handlePayeeChange}
					IconComponent={KeyboardArrowDownIcon}
					sx={{
						...modalStyles.payeeSelect,
						'& .MuiOutlinedInput-notchedOutline': {
							borderColor: isInvalid ? '#EF4444' : '#D1D5DB'
						}
					}}
					displayEmpty
				>
					{payees?.map((opt) => (
						<MenuItem key={opt._id} value={opt._id} sx={{ fontSize: '12px' }}>
							{opt.name}
						</MenuItem>
					))}
					<MenuItem
						value=""
						onClick={() => setOpenPayeeModal(true)}
						sx={modalStyles.addNewMenuItem}
					>
						<Typography sx={modalStyles.addNewMenuItemPlusIcon}>+</Typography>{' '}
						Add New Payee
					</MenuItem>
				</Select>
				{isInvalid && (
					<Tooltip
						title={
							<span>
								Payee name doesn't match with any existing records.
								<br />
								You can select existing payee name or create a new one.
							</span>
						}
						placement="bottom-start"
						arrow
						componentsProps={{
							tooltip: { sx: modalStyles.tooltip }
						}}
					>
						<span style={modalStyles.infoIcon}>ⓘ</span>
					</Tooltip>
				)}
			</Box>

			{openModal && (
				<UpdatePayeeNameModal
					open={openModal}
					onClose={() => setOpenModal(false)}
					payeeName={currentPayee?.name}
					onApplyToAll={() => {
						onApplyToAll(selected)
						setOpenModal(false)
					}}
					onOnlyThisRow={() => {
						onChange(selected)
						setOpenModal(false)
					}}
				/>
			)}

			<FormModalMUI
				title="Add new payee"
				open={openPayeeModal}
				maxWidth="sm"
				onClose={() => setOpenPayeeModal(false)}
				hideDividers={true}
				styles={{
					title: {
						fontSize: '24px',
						fontWeight: 600,
						color: '#111827',
						mb: 1,
						lineHeight: 1.2
					}
				}}
			>
				<AddPayee
					onClose={() => setOpenPayeeModal(false)}
					isEdit={false}
					payeeData={{}}
					setDirty={() => {}}
					setWarning={() => {}}
					warning={''}
					onError={() => {}}
				/>
			</FormModalMUI>
		</Box>
	)
}

export default PayeeNameField

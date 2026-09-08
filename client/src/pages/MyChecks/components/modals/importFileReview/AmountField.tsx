import React from 'react'
import Cleave from 'cleave.js/react'
import {
	Box,
	Typography,
	Tooltip,
	InputBase,
	InputBaseProps,
	Input
} from '@mui/material'

interface AmountFieldProps extends Omit<InputBaseProps, 'onChange'> {
	value: string
	originalValue?: string
	isInvalid: boolean
	onChange: (e: any) => void
	isSkipped?: boolean
	isEditable?: boolean
	showDualValues?: boolean
	errorMessage?: string
	modalStyles: { [key: string]: any }
}

const AmountField: React.FC<AmountFieldProps> = ({
	value,
	originalValue = '',
	isInvalid,
	onChange,
	isSkipped = false,
	isEditable = true,
	showDualValues = true,
	modalStyles,
	errorMessage = ''
}) => {
	const isOriginalEmpty = !originalValue || originalValue.trim() === ''

	const isOriginalValueInvalid = (val: string): boolean => {
		if (!val || val.trim() === '') return false
		const cleanVal = val.replace(/[$,\s]/g, '')
		return isNaN(Number(cleanVal)) || cleanVal === ''
	}

	const originalValueInvalid = isOriginalValueInvalid(originalValue)

	if (isSkipped || (!isEditable && !showDualValues)) {
		return (
			<span style={{ color: isInvalid ? '#EF4444' : undefined }}>
				{value || 'Empty'}
			</span>
		)
	}

	if (showDualValues && !isEditable) {
		return (
			<Box sx={modalStyles.dualValueCell}>
				<Box sx={modalStyles.editableValueContainer}>
					{isOriginalEmpty ? (
						<Typography sx={{ ...modalStyles.originalValue, color: '#EF4444' }}>
							Empty
						</Typography>
					) : originalValueInvalid ? (
						<Typography sx={{ ...modalStyles.originalValue, color: '#EF4444' }}>
							{originalValue}
						</Typography>
					) : (
						<Typography sx={modalStyles.originalValue}>
							{originalValue}
						</Typography>
					)}
				</Box>

				<Box sx={modalStyles.editableValueContainer}>
					<Typography
						sx={{
							...modalStyles.editedValue,
							color: isInvalid ? '#EF4444' : '#000'
						}}
					>
						{value || 'Empty'}
					</Typography>
				</Box>
			</Box>
		)
	}

	return (
		<Box sx={modalStyles.dualValueCell}>
			<Box sx={modalStyles.editableValueContainer}>
				{isOriginalEmpty ? (
					<Typography sx={{ ...modalStyles.originalValue, color: '#EF4444' }}>
						Empty
					</Typography>
				) : (
					<Typography sx={modalStyles.originalValue}>
						{originalValue}
					</Typography>
				)}
			</Box>

			<Box sx={modalStyles.editableValueContainer}>
				<Input
					inputComponent={CleaveInput as any}
					value={value}
					onChange={onChange}
					placeholder="Enter amount"
					sx={{
						...modalStyles.editableInput,
						...modalStyles.editableInputAmount,
						borderColor: isInvalid ? '#EF4444' : '#D1D5DB',
						with: '100% !important'
					}}
					startAdornment={
						<Typography variant="subtitle2" mr={1}>
							$
						</Typography>
					}
					disableUnderline
				/>
				{isInvalid && (
					<Tooltip
						title={<span>{errorMessage}</span>}
						placement="top"
						arrow
						componentsProps={{
							tooltip: { sx: modalStyles.tooltip }
						}}
					>
						<span style={modalStyles.infoIcon}>ⓘ</span>
					</Tooltip>
				)}
			</Box>
		</Box>
	)
}

// Cleave wrapper for MUI InputBase
const CleaveInput = React.forwardRef<HTMLInputElement, any>((props, ref) => {
	const { onChange, ...other } = props

	return (
		<Cleave
			{...other}
			options={{
				numeral: true
			}}
			htmlRef={ref}
			onChange={(e) => {
				const rawValue = e.target.rawValue
				onChange?.({ target: { value: rawValue } })
			}}
		/>
	)
})

export default AmountField

import React from 'react'
import { Box, Typography, Input } from '@mui/material'

interface TextInputFieldProps {
	value: string
	originalValue?: string
	onChange: (value: string) => void
	placeholder: string
	isSkipped?: boolean
	isEditable?: boolean
	showDualValues?: boolean
	modalStyles: { [key: string]: any }
	inputType?: 'memo' | 'invoice'
}

const TextInputField: React.FC<TextInputFieldProps> = ({
	value,
	originalValue = '',
	onChange,
	placeholder,
	isSkipped = false,
	isEditable = true,
	showDualValues = true,
	modalStyles,
	inputType = 'memo'
}) => {
	// If row is skipped or not editable without dual values, show static value only
	if (isSkipped || (!isEditable && !showDualValues)) {
		return <span>{value}</span>
	}

	// Non-editable dual values display
	if (showDualValues && !isEditable) {
		return (
			<Box sx={modalStyles.dualValueCell}>
				{/* Original value (non-editable) */}
				<Typography sx={modalStyles.originalValue}>
					{originalValue || value}
				</Typography>

				{/* Current/edited value (non-editable) */}
				<Box sx={modalStyles.editableValueContainer}>
					<Typography sx={modalStyles.editedValue}>{value}</Typography>
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
			<Box sx={modalStyles.editableValueContainer}>
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					sx={{
						...modalStyles.editableInput,
						...(inputType === 'memo'
							? modalStyles.editableInputMemo
							: modalStyles.editableInputInvoice)
					}}
					disableUnderline
					placeholder={placeholder}
				/>
			</Box>
		</Box>
	)
}

export default TextInputField

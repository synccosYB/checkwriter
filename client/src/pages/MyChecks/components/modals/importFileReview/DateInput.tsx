import { Box, Typography } from '@mui/material'
import {
	LocalizationProvider,
	DatePicker,
	DatePickerProps
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { styles } from './styles'

interface DateProps<T> extends DatePickerProps<T> {
	originalValue: string
}

function DateInput<T>({ originalValue, value, ...rest }: DateProps<T>) {
	return (
		<Box sx={{ p: '0px 6px' }}>
			<Typography sx={styles.originalValue}>
				{originalValue && new Date(originalValue).toLocaleDateString()}
			</Typography>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<DatePicker<any>
					sx={{ backgroundColor: 'red' }}
					value={value ? dayjs(value as any) : null}
					slotProps={{
						textField: {
							sx: {
								width: { xs: '100%', sm: '100%', md: '150px' },

								'& .MuiOutlinedInput-root': {
									height: '20px',
									backgroundColor: '#fff',
									fontSize: '12px',

									'& .MuiOutlinedInput-input': {
										pl: '7px'
									},
									'& fieldset': {
										borderColor: '#e2e8f0'
									},
									'& .MuiIconButton-root': {
										padding: '0px',
										mr: '-10px'
									},
									'& .MuiIconButton-root svg': {
										height: '17px',
										width: '17px'
									},
									'&:hover fieldset': {
										borderColor: '#e2e8f0'
									},
									'&.Mui-focused fieldset': {
										borderColor: '#1e3a5f'
									}
								}
							}
						}
					}}
					{...rest}
				/>
			</LocalizationProvider>
		</Box>
	)
}

export default DateInput

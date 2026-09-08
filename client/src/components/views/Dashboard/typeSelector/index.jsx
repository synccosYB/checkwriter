import React from 'react'
import {
	FormControl,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select
} from '@mui/material'

function TypeSelector({ onSelect }) {
	return (
		<FormControl
			sx={{
				width: { xs: 'auto', sm: 170 },
				maxWidth: { xs: '110px', sm: '100%' }
			}}
			size="small"
		>
			<InputLabel
				id="typeSelector"
				sx={{
					backgroundColor: '#fff',
					padding: '0 5px 0 4px'
				}}
			>
				View By
			</InputLabel>

			<Select
				labelId="typeSelector"
				id="graph"
				variant="outlined"
				input={<OutlinedInput style={{ borderColor: 'green' }} />}
				inputProps={{ 'aria-label': 'Without label' }}
				defaultValue={'Total Expenses'}
				sx={{
					borderRadius: '8px',
					'& .MuiSelect-select': {
						fontSize: '14px',
						minHeight: 'auto',
						padding: '9px 14px'
					}
				}}
				MenuProps={{
					PaperProps: {
						sx: {
							maxWidth: '220px',
							maxHeight: '400px'
						}
					},
					sx: {
						'&.Mui-selected': {
							backgroundColor: '#f5f7fa'
						},
						'&.Mui-focused': {
							backgroundColor: '#FFF8DE'
						}
					}
				}}
				color="success"
				onChange={(e) => {
					onSelect(e.target.value)
				}}
			>
				<MenuItem
					value={'Total Expenses'}
					defaultChecked
					className="menu-item"
					sx={{
						':hover': {
							backgroundColor: 'rgba(0,128,0, 0.1)'
						},
						'&.Mui-selected': {
							backgroundColor: 'rgba(0,128,0, 0.1)',
							'&:hover': {
								backgroundColor: 'rgba(0,128,0, 0.1)'
							}
						}
					}}
				>
					<span style={{ fontWeight: 'bold' }}>Expenses</span>
				</MenuItem>
				<MenuItem
					value={'Total Checks'}
					className="menu-item"
					sx={{
						':hover': {
							backgroundColor: 'rgba(0,128,0, 0.1)'
						},
						'&.Mui-selected': {
							backgroundColor: 'rgba(0,128,0, 0.1)',
							'&:hover': {
								backgroundColor: 'rgba(0,128,0, 0.1)'
							}
						}
					}}
				>
					<span style={{ fontWeight: 'bold' }}>Checks</span>
				</MenuItem>
			</Select>
		</FormControl>
	)
}

export default TypeSelector

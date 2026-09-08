import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'

const ITEM_HEIGHT = 40

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5,
			width: 250
		}
	}
}

const options = ['Personal', 'Merchant', 'Offical', 'Client', 'Food']

function getStyles(name, personName, theme) {
	return {
		fontWeight:
			personName.indexOf(name) === -1
				? theme.typography.fontWeightRegular
				: theme.typography.fontWeightMedium,
		backgroundColor: personName.indexOf(name) === -1 ? 'white' : '#1e3a5f',
		color: personName.indexOf(name) === -1 ? 'black' : '#ffffff'
	}
}

const ChipSelect = () => {
	const theme = useTheme()
	const [personName, setPersonName] = React.useState([])

	const handleChange = (event) => {
		const {
			target: { value }
		} = event
		setPersonName(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		)
	}

	return (
		<div>
			<FormControl sx={{ m: 1, width: 300 }}>
				<InputLabel id="chip-select-label">Chip</InputLabel>
				<Select
					labelId="chip-select-label"
					id="id-chip-select-label"
					multiple
					value={personName}
					onChange={handleChange}
					input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
					renderValue={(selected) => (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
							{selected.map((value) => (
								<Chip
									avatar={
										<span
											className="dot"
											style={{
												backgroundColor: '#5EA479',
												width: '9px',
												height: '9px'
											}}
										/>
									}
									label={value}
									variant="outlined"
									size="small"
								/>
							))}
						</Box>
					)}
					MenuProps={MenuProps}
				>
					{options.map((name) => (
						<MenuItem
							key={name}
							value={name}
							style={{
								display: 'inline-block',
								padding: 3
							}}
						>
							<Chip
								avatar={
									<span
										className="dot"
										style={{ backgroundColor: '#5EA479' }}
									/>
								}
								label={name}
								variant="outlined"
								size="small"
								style={getStyles(name, personName, theme)}
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									':hover': {
										backgroundColor: 'rgba(0,128,0, 0.1)'
									},
									'&.Mui-selected': {
										backgroundColor: 'rgba(0,128,0, 0.1)'
									}
								}}
							/>
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	)
}

export default ChipSelect

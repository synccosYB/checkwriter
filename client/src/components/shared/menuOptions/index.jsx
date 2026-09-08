import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'

function MenuOptions({ optionsList }) {
	const [anchorEl, setAnchorEl] = React.useState(null)
	const open = Boolean(anchorEl)
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<div>
			<MoreVertIcon
				id="basic-button"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			/>

			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button'
				}}
			>
				{optionsList?.map((option, index) => (
					<MenuItem
						disabled={option.disabled}
						key={index}
						onClick={() => {
							option.onClick()
							handleClose()
						}}
					>
						{option.icon} &nbsp; {option.label}
					</MenuItem>
				))}
			</Menu>
		</div>
	)
}

export default MenuOptions

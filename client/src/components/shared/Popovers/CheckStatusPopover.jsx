import React from 'react'
import {
	InsertDriveFileOutlined,
	DoneRounded,
	BlockOutlined,
	AlternateEmailOutlined,
	PrintOutlined,
	PublishRounded
} from '@mui/icons-material'
import { Button, MenuItem, Menu } from '@mui/material'

const CheckStatusPopover = ({
	checkStatus,
	checkId,
	func,
	openChangeConfirmModal,
	freezeStatus
}) => {
	const [anchorEl, setAnchorEl] = React.useState(null)
	const open = Boolean(anchorEl)

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
		event.stopPropagation()
	}

	const handleClose = (event) => {
		setAnchorEl(null)
		event.stopPropagation()
	}

	const handleStatusChange = (status) => (e) => {
		openChangeConfirmModal(status, checkId)
		handleClose(e)
		e.stopPropagation()
	}

	const statusConfig = {
		DRAFT: {
			bgColor: '#F1F4FF',
			color: '#1255D8',
			icon: (
				<InsertDriveFileOutlined
					sx={{
						color: '#1255D8',
						marginRight: '5px',
						width: '0.75rem',
						height: '0.75rem'
					}}
				/>
			),
			actions: ['CLEARED', 'VOID']
		},
		CLEARED: {
			bgColor: '#F3FFF1',
			color: '#257E49',
			icon: (
				<DoneRounded
					sx={{
						color: '#257E49',
						marginRight: '5px',
						width: '0.75rem',
						height: '0.75rem'
					}}
				/>
			),
			disabled: true
		},
		VOID: {
			bgColor: '#FFF1F1',
			color: '#DE0202',
			icon: (
				<BlockOutlined
					sx={{
						color: '#DE0202',
						marginRight: '5px',
						width: '0.75rem',
						height: '0.75rem'
					}}
				/>
			),
			disabled: true
		},
		EMAILED: {
			bgColor: '#F3FFF1',
			color: '#257E49',
			icon: (
				<AlternateEmailOutlined
					sx={{
						color: '#257E49',
						marginRight: '5px',
						width: '0.75rem',
						height: '0.75rem'
					}}
				/>
			),
			actions: ['CLEARED']
		},
		PRINTED: {
			bgColor: '#F3FFF1',
			color: '#257E49',
			icon: (
				<PrintOutlined
					sx={{
						color: '#257E49',
						marginRight: '5px',
						width: '0.75rem',
						height: '0.75rem'
					}}
				/>
			),
			actions: ['CLEARED']
		},
		SUBMITTED: {
			bgColor: '#F3FFF1',
			color: '#257E49',
			icon: (
				<PublishRounded
					sx={{
						color: '#257E49',
						marginRight: '5px',
						width: '0.75rem',
						height: '0.75rem'
					}}
				/>
			)
		},
		BLANK: {
			bgColor: `rgba(226,232,240,0.05)`,
			color: '#aaa',
			icon: (
				<img
					src="/img/blankedCheck_draft.png"
					width="20px"
					height="16px"
					alt="blanked"
				/>
			),
			disabled: true
		}
	}

	const renderStatusButton = () => {
		const config = statusConfig[checkStatus]
		if (!config) return null

		const buttonProps = {
			className: `check-status-div ${checkStatus?.toLowerCase()} d-flex flex-row align-items-center py-2 px-3 rounded justify-content-center text-capitalize mx-auto`,
			id: 'basic-button',
			'aria-controls': open ? 'basic-menu' : undefined,
			'aria-haspopup': 'true',
			'aria-expanded': open ? 'true' : undefined,
			onClick: config.disabled ? undefined : handleClick,
			style: {
				backgroundColor: config.bgColor,
				color: config.color,
				fontSize: '10px',
				fontWeight: '500',
				borderRadius: '6px',
				border: '1px solid #EEE'
			},
			disabled: config.disabled
		}

		return (
			<>
				<Button {...buttonProps}>
					<span className="status-icon">{config.icon}</span>
					{checkStatus.toLowerCase()}
				</Button>
				{!freezeStatus && config.actions && (
					<Menu
						id="basic-menu"
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						MenuListProps={{ 'aria-labelledby': 'basic-button' }}
						PaperProps={{
							style: {
								minWidth: '121px',
								transition: 'all 0.3s linear',
								marginTop: '2px',
								borderRadius: '4px',
								border: '1px solid #EEE',
								boxShadow: 'none'
							}
						}}
					>
						{config.actions.map((action) => (
							<MenuItem
								key={action}
								className="status-choices justify-content-center fs-12"
								sx={{ padding: '5px 10px', color: '#3f3f3f' }}
								onClick={handleStatusChange(action)}
							>
								{action}
							</MenuItem>
						))}
					</Menu>
				)}
			</>
		)
	}

	return <>{renderStatusButton()}</>
}

export default CheckStatusPopover

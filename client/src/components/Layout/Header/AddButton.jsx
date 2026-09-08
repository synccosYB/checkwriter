import { Add } from '@mui/icons-material'
import {
	IconButton,
	List,
	ListItem,
	ListItemText,
	Popover
} from '@mui/material'
import { useState } from 'react'
import { useHistory } from 'react-router'
import FormModalMUI from '../../shared/Modals/FormModalMUI'
import AddPayee from '../../views/forms/AddPayee'
import { AddNewModal } from '../../../pages/Bank/components/modals'

const AddButton = () => {
	const history = useHistory()
	const [anchorEl, setAnchorEl] = useState(null)

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const open = Boolean(anchorEl)
	const id = open ? 'simple-popover' : undefined

	const [isAddBankModalOpen, setAddBankModalOpen] = useState(false)
	const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)
	const [showWarning, setWarning] = useState(false)

	const [isDirty, setIsDirty] = useState(false)

	const setDirty = (dirty) => {
		setIsDirty(dirty)
	}

	const openAddBank = () => {
		setAddBankModalOpen(true)
	}

	const closeAddBank = (forced) => {
		if (isDirty && !forced) {
			setWarning(true)
		} else {
			setAddBankModalOpen(false)
			setWarning(false)
		}
	}

	const openAddPayee = () => {
		setAddPayeeModalOpen(true)
	}

	const closeAddPayee = (forced) => {
		if (isDirty && !forced) {
			setWarning(true)
		} else {
			setAddPayeeModalOpen(false)
			setWarning(false)
		}
	}

	return (
		<div>
			<IconButton
				sx={{
					width: '32px',
					height: '32px',
					borderRadius: '4px',
					border: '0px solid #1e3a5f',
					backgroundColor: '#1e3a5f',
					color: '#fff',
					'&:hover': { color: '#fff', backgroundColor: '#1e3a5f' }
				}}
				onClick={handleClick}
				aria-describedby={id}
			>
				<Add />
			</IconButton>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
				sx={{
					top: '17px',
					left: '-118px'
				}}
			>
				<List>
					<ListItem
						className="list-item-new"
						onClick={() => {
							history.push('/dashboard/my-checks?create=true')
							handleClose()
						}}
						key="New Checks"
						sx={{
							padding: '7px 15px'
						}}
					>
						<ListItemText
							primaryTypographyProps={{
								fontSize: '14px',
								display: 'flex',
								alignItems: 'center'
							}}
							primary={<>New Checks</>}
						/>
					</ListItem>
					<ListItem
						className="list-item-new"
						onClick={() => {
							openAddPayee()
							handleClose()
						}}
						key="New Payee"
						sx={{
							padding: '7px 15px'
						}}
					>
						<ListItemText
							primaryTypographyProps={{
								fontSize: '14px',
								display: 'flex',
								alignItems: 'center'
							}}
							primary={<>New Payee</>}
						/>
					</ListItem>
					<ListItem
						className="list-item-new"
						onClick={() => {
							openAddBank()
							handleClose()
						}}
						key="New Bank Account"
						sx={{
							padding: '7px 15px'
						}}
					>
						<ListItemText
							primaryTypographyProps={{
								fontSize: '14px',
								display: 'flex',
								alignItems: 'center'
							}}
							primary={<>New Bank Account</>}
						/>
					</ListItem>
					<ListItem
						className="list-item-new"
						onClick={() => {
							history.push('/dashboard/create-organization')
							handleClose()
						}}
						key="New Checks"
						sx={{
							padding: '7px 15px'
						}}
					>
						<ListItemText
							primaryTypographyProps={{
								fontSize: '14px',
								display: 'flex',
								alignItems: 'center'
							}}
							primary={<>Organization</>}
						/>
					</ListItem>
				</List>
			</Popover>

			<AddNewModal
				open={isAddBankModalOpen}
				onClose={() => closeAddBank(false)}
			/>

			<FormModalMUI
				title="Add new payee"
				open={isAddPayeeModalOpen}
				maxWidth="sm"
				onClose={() => closeAddPayee(false)}
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
					onClose={closeAddPayee}
					setDirty={setDirty}
					warning={showWarning}
					setWarning={setWarning}
				/>
			</FormModalMUI>
		</div>
	)
}

export default AddButton

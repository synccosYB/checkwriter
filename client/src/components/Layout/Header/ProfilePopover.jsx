import { Divider, IconButton, List, ListItem, Popover, Box, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { logOut } from '../../../redux/loginLogout'
import { emptyAppData } from '../../../redux/appData'
import FormModalMUI from '../../shared/Modals/FormModalMUI'
import {
	ErrorOutline,
	Logout,
	Settings,
	CardMembership
} from '@mui/icons-material'
import ButtonComponent from '../../shared/ButtonComponent'

import { queryClient } from '../../..'
import { MyCookies } from '../../../utils/cookies/Cookies'
import useInactivityLogout from '../../../utils/hooks/useInactivityLogout'

import { LogoutModal } from '../../LogoutModal'
import { MySessionStorage } from '../../../utils/sessionStorage/sessionStorageService'

const ProfilePopover = ({
	userFirstName,
	userLastName,
	userEmail,
	onManageSubscription,
	setSideBarOpen = () => {}
}) => {
	const location = useLocation()
	const history = useHistory()
	const dispatch = useDispatch()
	const [anchorEl, setAnchorEl] = useState(null)

	const { showWarning, warningTimer, setShowWarning } = useInactivityLogout()

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const open = Boolean(anchorEl)
	const id = open ? 'simple-popover' : undefined

	const [logoutModal, setLogoutModal] = useState(false)

	function logout(redirectUrl = '') {
		dispatch(logOut())
		dispatch(emptyAppData())
		MyCookies.removeAll()
		window.sessionStorage.removeItem('user-memory')
		queryClient.clear()

		MySessionStorage.set(MySessionStorage.KEYS.REDIRECT_URL, redirectUrl)

		history.push('/auth/login')
	}

	const handleSubscription = () => {
		onManageSubscription()
		setSideBarOpen(false)
		handleClose()
	}

	const initials = userFirstName && userLastName
		? (userFirstName.charAt(0) + userLastName.charAt(0)).toUpperCase()
		: ''

	return (
		<>
			<IconButton
				sx={{
					width: '36px',
					height: '36px',
					borderRadius: '10px',
					backgroundColor: '#1e3a5f',
					color: '#fff',
					fontSize: '14px',
					fontWeight: 600,
					'&:hover': {
						backgroundColor: '#152d4a',
						color: '#fff',
					}
				}}
				onClick={handleClick}
			>
				{initials}
			</IconButton>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				sx={{
					mt: 1,
				}}
				slotProps={{
					paper: {
						sx: {
							borderRadius: '12px',
							boxShadow: '0px 8px 16px rgba(0,0,0,0.06), 0px 4px 8px rgba(0,0,0,0.04)',
							border: '1px solid #d9e0e8',
							minWidth: 220,
						}
					}
				}}
			>
				<List sx={{ p: 1 }}>
					<ListItem
						sx={{
							py: 1.5,
							px: 1.5,
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: '10px',
									backgroundColor: '#1e3a5f',
									color: '#fff',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '14px',
									fontWeight: 600,
									flexShrink: 0,
								}}
							>
								{initials || 'NA'}
							</Box>
							<Box>
								<Typography
									sx={{
										fontSize: '0.875rem',
										fontWeight: 600,
										color: '#1a1a2e',
										lineHeight: 1.3,
									}}
								>
									{userFirstName || ''} {userLastName || ''}
								</Typography>
								<Typography
									sx={{
										fontSize: '0.75rem',
										color: '#5b6472',
										lineHeight: 1.3,
									}}
								>
									{userEmail || ''}
								</Typography>
							</Box>
						</Box>
					</ListItem>
					<Divider sx={{ borderColor: '#d9e0e8', my: 0.5 }} />
					<ListItem
						sx={{
							fontSize: '0.875rem',
							borderRadius: '8px',
							cursor: 'pointer',
							py: 1,
							px: 1.5,
							'&:hover': { backgroundColor: '#f0f2f5' },
						}}
						onClick={handleSubscription}
					>
						<CardMembership
							sx={{
								fontSize: '16px',
								marginRight: '10px',
								color: '#5b6472',
							}}
						/>
						Manage Subscriptions
					</ListItem>
					<ListItem
						onClick={() => {
							history.push('/dashboard/profile')
							handleClose()
							setSideBarOpen(false)
						}}
						key="goToProfile"
						sx={{
							py: 1,
							px: 1.5,
							borderRadius: '8px',
							cursor: 'pointer',
							fontSize: '0.875rem',
							'&:hover': { backgroundColor: '#f0f2f5' },
						}}
					>
						<Settings
							sx={{
								fontSize: '16px',
								marginRight: '10px',
								color: '#5b6472',
							}}
						/>
						Profile Settings
					</ListItem>
					<Divider sx={{ borderColor: '#d9e0e8', my: 0.5 }} />
					<ListItem
						onClick={() => {
							setLogoutModal(true)
							handleClose()
							setSideBarOpen(false)
						}}
						key="logout"
						sx={{
							py: 1,
							px: 1.5,
							borderRadius: '8px',
							cursor: 'pointer',
							fontSize: '0.875rem',
							color: '#d44040',
							'&:hover': { backgroundColor: '#fdecea' },
						}}
					>
						<Logout
							sx={{
								fontSize: '16px',
								marginRight: '10px',
								transform: 'rotate(180deg)'
							}}
						/>
						Logout
					</ListItem>
				</List>
			</Popover>

			<FormModalMUI
				open={logoutModal}
				onClose={() => {
					setLogoutModal(false)
				}}
				maxWidth="sm"
			>
				<div class="container" style={{ width: '450px' }}>
					<div class="row">
						<div class="d-flex align-items-center justify-content-center txt-danger mt-3 mb-2">
							<ErrorOutline sx={{ fontSize: '80px' }} />
						</div>
						<div class="col d-flex justify-content-center">
							<div class="row">
								<h3>
									<p>
										<b>Logout</b>
									</p>
								</h3>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col d-flex justify-content-center">
							<div class="row text-center">
								<p>Are you sure you want to logout?</p>
							</div>
						</div>
					</div>
				</div>

				<div className="d-flex align-items-center justify-content-center mt-3 mb-4">
					<ButtonComponent
						text="Cancel"
						type="button"
						variant="light"
						click={() => {
							setLogoutModal(false)
						}}
						extraClass="me-3"
					/>
					<ButtonComponent
						text={'Logout'}
						type="submit"
						variant="danger"
						click={() => logout('')}
					/>
				</div>
			</FormModalMUI>
			<LogoutModal
				timer={warningTimer}
				open={showWarning}
				onClose={() => {
					if (warningTimer) {
						setShowWarning(false)
					} else logout()
				}}
				handleLogout={() => {}}
				handleSignInAgain={() => {
					logout(location.pathname)
				}}
			/>
		</>
	)
}

export default ProfilePopover

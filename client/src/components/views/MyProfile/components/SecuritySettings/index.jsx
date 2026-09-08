import {
	Box,
	Typography,
	Switch,
	IconButton,
	Menu,
	MenuItem,
	useMediaQuery,
	Button,
	CircularProgress
} from '@mui/material'
import { useState } from 'react'
import CustomAuthList from '../CustomAuthList'
import {
	EmailIcon,
	GuardIcon,
	MarkIcon,
	MoreVerticalIcon
} from '../../../../shared/Icons/index'
import AddIcon from '@mui/icons-material/Add'
import { EditAppVerificationModal } from '../modals/EditAppVerificationModal'
import { EditEmailVerificationModal } from '../modals/EditEmailVerificationModal'
import { EditPhoneVerificationModal } from '../modals/EditPhoneVerificationModal'
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal'
import { styles } from './styles'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { SelectAddVerificationMethodModal } from '../modals/SelectAddVerificationMethodModal'
import useMfaMethods from '../../../../../API/mfa/useMfaMethods'
import useDeleteMfaMethod from '../../../../../API/mfa/useDeleteMfaMethod'
import useSetDefaultMfaMethod from '../../../../../API/mfa/useSetDefaultMfaMethod'
import useEnableMfa from '../../../../../API/mfa/useEnableMfa'
import { AddPasswordModal } from '../modals/AddPasswordModal'
import useSendValidationCode from '../../../../../API/validation/useSendValidationCode'
import useUserInfo from '../../../../../API/users/useUserInfo'
import { shouldDisableMfaSwitchForSuperAdmin } from '../../helpers'

const SecuritySettings = () => {
	const { data: userData } = useUserInfo()
	const { data: mfaData } = useMfaMethods()
	const { mutate: deleteMfaMethod, isPending: isDeleting } =
		useDeleteMfaMethod()
	const { mutate: setDefaultMethod, isPending: isMakingDefault } =
		useSetDefaultMfaMethod()

	const { mutate: enableMfa, isPending: isSettingDefault } = useEnableMfa()
	const [anchorEl, setAnchorEl] = useState(null)
	const [selectedItemId, setSelectedItemId] = useState(null)
	const [selectedItemType, setSelectedItemType] = useState(null)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [selectedItem, setSelectedItem] = useState(null)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [openDialog, setOpenDialog] = useState(false)
	const isPhone = useMediaQuery('(max-width: 724px)')
	const [selectedMethod, setSelectedMethod] = useState(null)

	const emails = mfaData?.methods?.emails
	const phones = mfaData?.methods?.phoneNumbers
	const apps = mfaData?.methods?.authenticatorApps

	const userAccountEmail = userData?.email

	const defaultMethodId = mfaData?.defaultMethodId

	const handleCloseVerificationMethod = () => {
		setSelectedMethod(null)
		setSelectedItemId(null)
		setSelectedItemType(null)
		setSelectedItem(null)
		setSelectedMethod(null)
	}

	const handleOpenDialog = () => {
		setOpenDialog(true)
	}

	const handleCloseDialog = () => {
		setOpenDialog(false)
		setSelectedItem(null)
		setSelectedItem(null)
	}

	const handleSelectAddVerificationMethod = (method) => {
		setSelectedMethod(method)
	}

	const handleMenuOpen = (event, id, type, item) => {
		setAnchorEl(event.currentTarget)
		setSelectedItemId(id)
		setSelectedItemType(type)
		setSelectedItem(item)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	const handleEditClick = () => {
		setEditModalOpen(true)
		setAnchorEl(null)
	}

	const handleModalClose = () => {
		setEditModalOpen(false)
		setSelectedItemId(null)
		setSelectedItemType(null)
		setSelectedItem(null)
		setSelectedMethod(null)
	}

	const handleDeleteClick = () => {
		setDeleteModalOpen(true)
		setAnchorEl(null)
	}

	const handleMakeDefaultMethod = () => {
		setDefaultMethod(
			{ methodType: selectedItemType, methodId: selectedItemId },
			{
				onSuccess: () => {
					setAnchorEl(null)
				}
			}
		)
	}

	const handleDeleteModalClose = () => {
		deleteMfaMethod(
			{ methodType: selectedItemType, methodId: selectedItemId },
			{
				onSuccess: () => {
					setDeleteModalOpen(false)
					setSelectedItemId(null)
					setSelectedItemType(null)
					setSelectedItem(null)
				}
			}
		)
	}

	const handleEnableMfa = (e) => {
		const numberOfMfaMEthods =
			emails?.length || 0 + phones?.length || 0 + apps?.length || 0

		if (numberOfMfaMEthods < 1) {
			handleOpenDialog()
		} else {
			enableMfa({ enableMfa: e.target.checked })
		}
	}

	return (
		<>
			<ChangePassword />
			<Box sx={styles.container}>
				<Box sx={styles.mfaContainer}>
					<Typography sx={styles.mfaTitle}>
						Multi-Factor Authentication
					</Typography>
					<Box sx={styles.rightSection}>
						<Switch
							disabled={shouldDisableMfaSwitchForSuperAdmin({
								isSuperAdmin: userData?.role === 'superadmin',
								mfaEnabledFromdb: mfaData?.enableMfa
							})}
							checked={mfaData?.enableMfa || false}
							onChange={handleEnableMfa}
							sx={styles.switch}
						/>
						{isSettingDefault && <CircularProgress size={'14px'} />}

						<Button
							variant="outlined"
							startIcon={<AddIcon />}
							sx={styles.addButton}
							onClick={handleOpenDialog}
						>
							Add
						</Button>
					</Box>
				</Box>
				<Box sx={styles.mfaDescription}>
					Enhance your account security by enabling multi-factor authentication
					(MFA). Use an authenticator app, email, or phone verification for
					additional protection.
				</Box>
				<Box sx={styles.authListContainer}>
					<CustomAuthList
						type="app"
						title="Authenticator App Codes"
						description="Verify one-time codes generated in your preferred third-party authenticator app."
						openDialog={selectedMethod === 'app'}
						handleCloseDialog={handleCloseVerificationMethod}
					/>

					<Box sx={styles.appListContainer}>
						{apps?.map((app) => (
							<Box key={app.id} sx={styles.appRow}>
								<Box sx={styles.appInfo}>
									<GuardIcon />
									<Box sx={styles.appTextContainer}>
										<MarkIcon />
										<Typography sx={styles.appName}>{app.label}</Typography>
									</Box>
									<Box>
										{app._id === defaultMethodId && (
											<Typography sx={styles.defaultTextStyle}>
												Default
											</Typography>
										)}
									</Box>
								</Box>

								<IconButton
									sx={styles.moreButton}
									onClick={(e) =>
										handleMenuOpen(e, app._id, 'authenticatorApp', app)
									}
								>
									<MoreVerticalIcon />
								</IconButton>
							</Box>
						))}
					</Box>

					<Box sx={styles.divider} />

					<CustomAuthList
						type="email"
						title="Email Verification"
						description="Verify one-time codes sent to your registered email address."
						openDialog={selectedMethod === 'email'}
						handleCloseDialog={handleCloseVerificationMethod}
					/>
					{emails?.map((email) => (
						<Box key={email._id} sx={styles.emailRow}>
							<Box sx={styles.emailInfo}>
								<EmailIcon />
								<Typography sx={styles.emailName}>{email.address}</Typography>
								{email?.label && (
									<Box sx={styles.appTextContainer}>
										<MarkIcon />
										<Typography sx={styles.appName}>{email?.label}</Typography>
									</Box>
								)}
								{email._id === defaultMethodId && (
									<Typography sx={styles.defaultTextStyle}>Default</Typography>
								)}
							</Box>

							<IconButton
								sx={styles.moreButton}
								onClick={(e) => handleMenuOpen(e, email._id, 'email', email)}
							>
								<MoreVerticalIcon />
							</IconButton>
						</Box>
					))}
					<Box sx={styles.divider} />

					<CustomAuthList
						type="phone"
						title="Phone Verification"
						description="Verify one-time codes sent to your mobile number."
						openDialog={selectedMethod === 'phone'}
						handleCloseDialog={handleCloseVerificationMethod}
					/>
					{phones?.map((phone) => (
						<Box key={phone.id} sx={styles.emailRow}>
							<Box sx={styles.emailInfo}>
								<Box sx={styles.phoneFlag}>
									<PhoneInput
										country={'usa'}
										value={phone.phoneNumber}
										disabled
										enableSearch={false}
										containerStyle={styles.flagContainer}
										inputStyle={styles.flagInput}
										buttonStyle={styles.flagButton}
										disableDropdown
										placeholder=""
										specialLabel=""
										preferredCountries={['us']}
									/>
								</Box>
								{phone?.label && (
									<Box sx={styles.appTextContainer}>
										<MarkIcon />
										<Typography sx={styles.appName}>{phone?.label}</Typography>
									</Box>
								)}
								{phone.default && (
									<Box sx={styles.appTextContainer}>
										<MarkIcon />
										<Typography sx={styles.appName}>
											{isPhone ? 'official' : 'Official Number'}
										</Typography>
									</Box>
								)}
								{phone._id === defaultMethodId && (
									<Typography sx={styles.defaultTextStyle}>Default</Typography>
								)}
							</Box>
							<IconButton
								sx={styles.moreButton}
								onClick={(e) =>
									handleMenuOpen(e, phone._id, 'phoneNumber', phone)
								}
							>
								<MoreVerticalIcon />
							</IconButton>
						</Box>
					))}
				</Box>

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
					PaperProps={{
						sx: styles.menuPaper
					}}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right'
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right'
					}}
				>
					<MenuItem
						onClick={handleMakeDefaultMethod}
						disabled={defaultMethodId === selectedItemId}
						sx={styles.menuItem}
					>
						Make Default &nbsp;
						{isMakingDefault && <CircularProgress size={'14px'} />}
					</MenuItem>
					<MenuItem onClick={handleEditClick} sx={styles.menuItem}>
						Edit
					</MenuItem>
					<MenuItem
						onClick={handleDeleteClick}
						disabled={
							defaultMethodId === selectedItemId ||
							selectedItem?.address === userAccountEmail
						}
						sx={styles.menuItem}
					>
						Delete
					</MenuItem>
				</Menu>

				<EditAppVerificationModal
					key={JSON.stringify(selectedItem) + 1}
					open={editModalOpen && selectedItemType === 'authenticatorApp'}
					onClose={handleModalClose}
					app={selectedItem}
				/>

				<EditEmailVerificationModal
					key={JSON.stringify(selectedItem) + 2}
					open={editModalOpen && selectedItemType === 'email'}
					onClose={handleModalClose}
					email={selectedItem}
				/>
				<EditPhoneVerificationModal
					key={JSON.stringify(selectedItem) + 3}
					open={editModalOpen && selectedItemType === 'phoneNumber'}
					onClose={handleModalClose}
					phone={selectedItem}
				/>
				<DeleteConfirmationModal
					isLoading={isDeleting}
					open={deleteModalOpen}
					onClose={() => setDeleteModalOpen(false)}
					onDelete={handleDeleteModalClose}
				/>

				{openDialog && (
					<SelectAddVerificationMethodModal
						open={openDialog}
						onClose={handleCloseDialog}
						onClickNext={handleSelectAddVerificationMethod}
					/>
				)}
			</Box>
		</>
	)
}

export default SecuritySettings

const ChangePassword = () => {
	const { data: userData } = useUserInfo()
	const { data: mfaData } = useMfaMethods()
	const [showAddPasswordModal, setShowAddPasswordModal] = useState(false)
	const { mutate: sendValidationCode, isPending: isSendingOtp } =
		useSendValidationCode()

	const isNew = !userData?.hasPassword

	const email = mfaData?.methods?.emails?.find(
		(item) => item?.address === userData?.email
	)

	const handleSendVerificationCode = () => {
		sendValidationCode(
			{ methodType: 'email', methodId: email?._id, value: email?.address },
			{ onSuccess: () => setShowAddPasswordModal(true) }
		)
	}

	return (
		<Box hidden={!email}>
			<Box sx={styles.container}>
				<Box sx={styles.mfaHeaderContainer}>
					<Typography sx={styles.mfaTitle}>Password</Typography>
					<Box sx={styles.rightSection}>
						<Button
							disabled={isSendingOtp}
							variant="outlined"
							sx={styles.addButton}
							onClick={handleSendVerificationCode}
							endIcon={isSendingOtp && <CircularProgress size={'14px'} />}
						>
							{isNew ? 'Create Password' : 'Change Password'}
						</Button>
					</Box>
				</Box>
				<Box sx={styles.mfaDescription}>
					Secure your account by setting up or updating your password. If you
					don’t have a password, create one after verifying your email.
				</Box>
			</Box>

			{showAddPasswordModal && (
				<AddPasswordModal
					open={showAddPasswordModal}
					onClose={() => setShowAddPasswordModal(false)}
					onResendCode={handleSendVerificationCode}
					emailInfo={{ email: email?.address, id: email?._id }}
					isNew={isNew}
				/>
			)}
		</Box>
	)
}

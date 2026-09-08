import React, { useEffect, useRef, useState } from 'react'
import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Tabs,
	Tab,
	CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { AddNewModalUSA } from './USA'
import { AddNewModalCanada } from './Canada'
import { styles } from '../styles'
import useAddBank from '../../../../../API/banks/useAddBank'
import useUpdateBank from '../../../../../API/banks/useUpdateBank'
import useBankAccount from '../../../../../API/banks/useBankAccount'
import { DuplicateBankModal } from '../DuplicateBankModal'

export const AddNewModal = ({ open, onClose, bankData }) => {
	const [selectedItem, setSelectedItem] = useState(null)
	const [bankDataLocal, setBankDataLocal] = useState(null)

	const bankDataSource = bankDataLocal ? bankDataLocal : bankData

	const isEdit = !!bankDataSource
	const initialTab = isEdit ? (bankDataSource?.country === 'USA' ? 0 : 1) : 0

	const [activeTab, setActiveTab] = React.useState(initialTab)
	const formRef = useRef(null)
	const [shouldDisable, setShouldDisable] = React.useState(false)

	const { mutate: addBank, isPending: isAdding } = useAddBank(
		activeTab === 0 ? 'USA' : 'CANADA'
	)
	const { mutate: updateBank, isPending: isUpdating } = useUpdateBank(
		activeTab === 0 ? 'USA' : 'CANADA'
	)

	const [displayDuplicateErrorModal, setDisplayDuplicateErrorModal] =
		useState(false)

	const { data } = useBankAccount(selectedItem?.activeId)

	useEffect(() => {
		if (data?.data) {
			setBankDataLocal(data?.data)
		}
	}, [data?.data])

	const isLoading = isAdding || isUpdating

	const [errors, setErrors] = useState({})

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue)
	}

	const handleSubmit = () => {
		if (formRef.current) {
			formRef.current.handleSubmit()
		}
	}

	const successHandler = (res) => {
		onClose(res)
	}

	const errorHandler = (errors) => {
		const obj = errors?.response?.data?.error
		if (obj?.type === 'duplicate') {
			setSelectedItem({ temp: obj?.accountId })
			setDisplayDuplicateErrorModal(true)
		}
		setShouldDisable(true)
	}

	const onSubmit = (values) => {
		setErrors({})

		if (isEdit) {
			updateBank(
				{ id: bankDataSource?._id, body: values },
				{
					onSuccess: successHandler,
					onError: errorHandler
				}
			)
		} else {
			addBank(values, {
				onSuccess: successHandler,
				onError: errorHandler
			})
		}
	}

	const title = isEdit ? 'Edit Bank Account' : 'Add New Bank Account'
	const btnTitle = isEdit ? 'Update Account information' : 'Add Account'

	const forms = [
		<AddNewModalUSA
			key={JSON.stringify(bankDataSource)}
			apiErrors={errors}
			formRef={formRef}
			onSubmit={onSubmit}
			bankData={bankDataSource}
			setShouldDisable={setShouldDisable}
		/>,
		<AddNewModalCanada
			key={JSON.stringify(bankDataSource)}
			apiErrors={errors}
			formRef={formRef}
			onSubmit={onSubmit}
			bankData={bankDataSource}
			setShouldDisable={setShouldDisable}
		/>
	]

	const handleClose = () => {
		setDisplayDuplicateErrorModal(false)
		setBankDataLocal(null)
		onClose()
	}

	return (
		<Box>
			<Dialog
				open={open}
				onClose={handleClose}
				PaperProps={{
					sx: styles.dialog
				}}
			>
				<Box sx={styles.dialogHeader}>
					<DialogTitle sx={styles.dialogTitle}>{title}</DialogTitle>
					<IconButton onClick={handleClose} sx={styles.dialogCloseButton}>
						<CloseIcon />
					</IconButton>
				</Box>
				<DialogContent sx={{ p: 0 }}>
					<Box sx={styles.dialogContent}>
						<Typography color="#00000099">
							Select your bank account type to proceed. Ensure the information
							matches your bank records for successful verification.
						</Typography>
						{isEdit ? (
							bankDataSource?.country === 'USA' ? (
								<Box mt={2}>{forms[0]}</Box>
							) : bankDataSource?.country === 'CANADA' ? (
								<Box mt={2}>{forms[1]}</Box>
							) : null
						) : (
							<>
								<Tabs
									value={activeTab}
									onChange={handleTabChange}
									sx={styles.tabs}
								>
									<Tab label="USA" />
									<Tab label="CANADA" />
								</Tabs>
								{forms[activeTab]}
							</>
						)}
					</Box>
				</DialogContent>
				<DialogActions sx={styles.dialogActions}>
					<Button
						onClick={handleClose}
						variant="outlined"
						sx={styles.cancelButton}
					>
						Cancel
					</Button>
					<Button
						disabled={isLoading || shouldDisable}
						onClick={handleSubmit}
						variant="contained"
						sx={styles.confirmButton}
						endIcon={isLoading && <CircularProgress size={'14px'} />}
					>
						{btnTitle}
					</Button>
				</DialogActions>
			</Dialog>

			{displayDuplicateErrorModal && (
				<DuplicateBankModal
					open={displayDuplicateErrorModal}
					onClose={() => {
						setDisplayDuplicateErrorModal(false)
						setSelectedItem(null)
						setBankDataLocal(null)
					}}
					onConfirm={() => {
						setDisplayDuplicateErrorModal(false)
						setSelectedItem((prev) => ({ ...prev, activeId: prev?.temp }))
					}}
				/>
			)}
		</Box>
	)
}

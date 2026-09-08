import React, { useState, useEffect } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Select,
	MenuItem,
	Typography,
	Box,
	SelectChangeEvent,
	CircularProgress
} from '@mui/material'
import { styles } from './styles'
import useBanks from '../../../../../API/banks/useBanks'

interface BankSelectionModalProps {
	open: boolean
	onClose: () => void
	selectedBank?: Record<string, any>
	onSave: (bankName: Record<string, any>) => void
	isLoading?: boolean
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
	open,
	onClose,
	selectedBank,
	onSave,
	isLoading = false
}) => {
	const { data } = useBanks()
	const banks = data?.data || []
	const [selected, setSelected] = useState<typeof selectedBank | null>(
		selectedBank ?? null
	)

	// Keep selected in sync with prop
	useEffect(() => {
		setSelected(selectedBank || null)
	}, [selectedBank, open])

	const handleChange = (event: SelectChangeEvent<string>) => {
		const value = event.target.value
		const currentBank = banks?.find((i) => i._id === value)
		setSelected(currentBank)
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<Box sx={styles.addPayeeModalContainer}>
				<DialogTitle
					sx={{ ...styles.addPayeeModalTitle, p: 0, mb: { xs: 1, md: 2 } }}
				>
					Select Bank Account
				</DialogTitle>
				<DialogContent sx={{ p: 0 }}>
					<Typography sx={styles.addPayeeModalLabel}>Bank Account*</Typography>
					<Select
						fullWidth
						value={selected?.bankName || ''}
						onChange={handleChange}
						displayEmpty
						size="small"
						renderValue={(selected) =>
							selected ? (
								selected
							) : (
								<Typography sx={{ color: 'text.secondary' }}>
									Select Bank Account
								</Typography>
							)
						}
						sx={{ mb: 2, mt: 1 }}
					>
						{banks.map((bank) => (
							<MenuItem key={bank?._id} value={bank._id}>
								{bank.bankName}
							</MenuItem>
						))}
					</Select>
				</DialogContent>
				<DialogActions sx={{ pb: 0, pt: { xs: 1, md: 2 }, px: 0 }}>
					<Button
						onClick={onClose}
						variant="outlined"
						sx={styles.addPayeeModalCancelBtn}
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							onSave(selected)
						}}
						variant="contained"
						sx={styles.addPayeeModalSaveBtn}
						disabled={!selected || isLoading}
						endIcon={isLoading && <CircularProgress size={'14px'} />}
					>
						Save
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}

export default BankSelectionModal

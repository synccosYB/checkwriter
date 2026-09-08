import React, { useState } from 'react'
import {
	Box,
	CircularProgress,
	IconButton,
	Menu,
	MenuItem,
	Pagination,
	PaginationItem
} from '@mui/material'

import { CustomTable } from '../../../../components/table/CustomTable'
import { AddNewModal, DeleteModal } from '../modals'

import { styles } from '../styles'
import { MoreVerticalIcon } from '../../../../components/Icons'
import usePagination from '../../../../utils/hooks/usePagination'
import useBanks from '../../../../API/banks/useBanks'
import { formatUSD, getTotalPagesForPagination } from '../../../../utils/helper'
import useUpdateBank from '../../../../API/banks/useUpdateBank'
import useDeleteBank from '../../../../API/banks/useDeleteBank'

const ActiveBankAccount = ({ status, search }) => {
	const [selectedItem, setSelectedItem] = useState(null)
	const { page, pageSize, setPage } = usePagination()
	const { data, isLoading } = useBanks({
		page,
		pageSize,
		status,
		search
	})

	const banks = data?.data || []

	const { mutate: updateBank, isPending: isUpdating } = useUpdateBank(selectedItem?.country || '')
	const {
		mutate: deleteBank,
		isPending: isDeleting,
		error,
		reset
	} = useDeleteBank()
	const [anchorEl, setAnchorEl] = useState(null)
	
	const [openDeleteModal, setOpenDeleteModal] = useState(false)
	const [openAddNewModal, setOpenAddNewModal] = useState(false)

	const handleMenuOpen = (event, id) => {
		setAnchorEl(event.currentTarget)
		setSelectedItem(id)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	const handleEditAccount = () => {
		setOpenAddNewModal(true)
		setAnchorEl(null)
	}

	const handleDeactivateAccount = () => {
		const updatedStatus = status === 'active' ? 'inactive' : 'active'

		updateBank(
			{ id: selectedItem?._id, body: { status: updatedStatus } },
			{
				onSuccess: () => {
					setAnchorEl(null)
				}
			}
		)
	}

	const handleDeleteAccount = () => {
		setOpenDeleteModal(true)
		setAnchorEl(null)
	}

	const handleConfirmDelete = () => {
		deleteBank(
			{ id: selectedItem?._id },
			{
				onSuccess: () => {
					setOpenDeleteModal(false)
					setSelectedItem(null)
				}
			}
		)
	}

	const renderHeaderCell = (column) => column.label

	const renderCell = (row, column) => {
		switch (column.id) {
			case 'actions':
				return (
					<IconButton
						sx={styles.moreButton}
						onClick={(e) => handleMenuOpen(e, row)}
					>
						<MoreVerticalIcon />
					</IconButton>
				)
			case 'balance':
				return formatUSD(row.balance)
			default:
				return row[column.id]
		}
	}

	const statusUpdateTitle =
		status === 'active' ? 'Deactivate Bank Account' : 'Activate Bank Account'

	return (
		<Box sx={styles.wrapper}>
			<Box>
				{isLoading ? (
					<Box display={'flex'} justifyContent={'center'} my={10}>
						<CircularProgress size={'48px'} />
					</Box>
				) : (
					<>
						<CustomTable
							columns={[
								{ id: 'accountNickName', label: 'Nick Name' },
								{ id: 'bankName', label: 'Bank Name' },
								{ id: 'accountNumber', label: 'Account Number' },
								{ id: 'balance', label: 'Available Balance' },
								{ id: 'actions', label: 'Actions' }
							]}
							data={banks}
							renderCell={renderCell}
							renderHeaderCell={renderHeaderCell}
							isCenteredCells={true}
						/>
						<Box sx={styles.paginationContainer}>
							<Pagination
								count={getTotalPagesForPagination(data?.totalCount || 0)}
								page={page + 1}
								onChange={(_, value) => setPage(value - 1)}
								renderItem={(item) => (
									<PaginationItem
										slots={{
											previous: () => 'Previous',
											next: () => 'Next'
										}}
										{...item}
										sx={styles.paginationItem}
									/>
								)}
								sx={styles.pagination}
							/>
						</Box>
					</>
				)}
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
				<MenuItem onClick={handleEditAccount} sx={styles.menuItem}>
					Edit Account
				</MenuItem>
				<MenuItem onClick={handleDeactivateAccount} sx={styles.menuItem}>
					{statusUpdateTitle} &nbsp;
					{isUpdating && <CircularProgress size={'14px'} />}
				</MenuItem>
				<MenuItem
					hidden={selectedItem?.inUse}
					onClick={handleDeleteAccount}
					sx={styles.menuItem}
				>
					Delete Account
				</MenuItem>
			</Menu>
			{openDeleteModal && (
				<DeleteModal
					errorMessage={error?.response?.data?.message || ''}
					isLoading={isDeleting}
					open={openDeleteModal}
					onClose={() => {
						setOpenDeleteModal(false)
						reset()
					}}
					onConfirm={handleConfirmDelete}
				/>
			)}
			{openAddNewModal && (
				<AddNewModal
					bankData={selectedItem}
					open={openAddNewModal}
					onClose={() => setOpenAddNewModal(false)}
				/>
			)}
		</Box>
	)
}

export default ActiveBankAccount

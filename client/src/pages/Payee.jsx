import React, { useState } from 'react'

import GenericTable from '../components/shared/GenericTable/GenericTable'
import PageHeader from '../components/shared/PageHeader'
import AddPayee from '../components/views/forms/AddPayee'
import {
	AddOutlined,
	DeleteOutlineOutlined,
	EditOutlined,
	MoreVert
} from '@mui/icons-material'
import ButtonComponent from '../components/shared/ButtonComponent'
import { Menu, MenuItem, IconButton, Typography } from '@mui/material'

import FormModalMUI from '../components/shared/Modals/FormModalMUI'
import usePayees from '../API/payees/usePayees'
import useDeletePayee from '../API/payees/useDeletePayee'
import usePagination from '../utils/hooks/usePagination'
import PaginationContainer from '../components/shared/paginationContainer'

const ContextMenu = ({ rowData }) => {
	const {
		mutate: deletePayee,
		isPending: isSubmitting,
		error,
		reset
	} = useDeletePayee()
	const [anchorEl, setAnchorEl] = React.useState(null)
	const [isEditPayeeModalOpen, setEditPayeeModalOpen] = useState(false)
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

	const [isDirty, setIsDirty] = useState(false)
	const [showWarning, setWarning] = useState(false)

	const setDirty = (dirty) => {
		setIsDirty(dirty)
	}

	const open = Boolean(anchorEl)
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	const openEditPayee = () => {
		setEditPayeeModalOpen(true)
		handleClose()
	}

	const closeEditPayee = (forced) => {
		if (isDirty && !forced) {
			setWarning(true)
		} else {
			setEditPayeeModalOpen(false)
			setWarning(false)
		}
	}

	const openDeleteModal = () => {
		setDeleteModalOpen(true)
	}

	const closeDeleteModal = () => {
		setDeleteModalOpen(false)
		reset()
	}

	const deleteUserPayee = async () => {
		deletePayee(
			{ id: rowData._id },
			{
				onSuccess: () => {
					closeDeleteModal()
				}
			}
		)
	}

	return (
		<>
			<IconButton
				aria-controls={open ? 'long-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup="true"
				onClick={handleClick}
			>
				<MoreVert />
			</IconButton>
			<Menu
				id="long-menu"
				MenuListProps={{
					'aria-labelledby': 'long-button'
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				sx={{
					display: 'flex',
					justifyContent: 'start',
					alignItems: 'center'
				}}
			>
				<MenuItem onClick={openEditPayee}>
					<EditOutlined
						sx={{
							marginRight: '20px'
						}}
					/>
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleClose()
						openDeleteModal()
					}}
				>
					<DeleteOutlineOutlined
						sx={{
							marginRight: '20px'
						}}
					/>
					Delete
				</MenuItem>
			</Menu>

			<FormModalMUI
				title="Edit payee"
				open={isEditPayeeModalOpen}
				maxWidth="sm"
				onClose={() => closeEditPayee(false)}
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
					onClose={closeEditPayee}
					isEdit={true}
					payeeData={rowData}
					setDirty={setDirty}
					warning={showWarning}
					setWarning={setWarning}
				/>
			</FormModalMUI>

			{isDeleteModalOpen && (
				<FormModalMUI
					onClose={closeDeleteModal}
					open={isDeleteModalOpen}
					maxWidth="sm"
				>
					<div className="container">
						<div className="row">
							<div className="row txt-danger pt-3">
								<DeleteOutlineOutlined sx={{ fontSize: '80px' }} />
							</div>
							<div className="col d-flex justify-content-center">
								<div className="row">
									<h3>
										<p>
											<b>Confirm Deletion?</b>
										</p>
									</h3>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col d-flex justify-content-center">
								<div className="row text-center">
									<p>
										Are you sure you want to delete payee with name:{' '}
										<b>{rowData.name}</b> ?
									</p>
								</div>
							</div>
							{error && (
								<div className="row text-center">
									<p className="text-danger">
										{error?.response?.data?.message}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="d-flex align-items-center justify-content-center mt-3 mb-5">
						<ButtonComponent
							text="Cancel"
							type="button"
							variant="light"
							click={closeDeleteModal}
							extraClass="me-3"
						/>
						<ButtonComponent
							text={isSubmitting ? 'Deleting...' : 'Delete'}
							disabled={isSubmitting}
							type="submit"
							variant="danger"
							click={deleteUserPayee}
						/>
					</div>
				</FormModalMUI>
			)}
		</>
	)
}

const Payee = () => {
	const { page, pageSize, setPage, setPageSize } = usePagination()
	const { data, isLoading } = usePayees({ page, pageSize })

	const payees = data?.data || []
	const totalCount = data?.totalCount

	const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)

	const [isDirty, setIsDirty] = useState(false)
	const [showWarning, setWarning] = useState(false)

	const setDirty = (dirty) => {
		setIsDirty(dirty)
	}

	const columnData = [
		{
			key: 'Name',
			value: 'name',
			colWidth: '10%'
		},
		{
			key: 'Address',
			value: 'payeeAddress',
			colWidth: '15%',
			align: 'center'
		},
		{
			key: 'Date',
			value: 'createdDate',
			colWidth: '10%'
		},
		{ key: 'Status', value: 'status', colWidth: '10%' },
		{ key: 'Actions', value: 'contextMenu', colWidth: '9%' }
	]

	const makeTableData = (data) => {
		const temp = []
		data.forEach((item, index) => {
			let obj = {}

			obj = { ...item }

			obj.payeeAddress = `${item?.address?.addressLine1 || ''}, ${
				item?.address?.addressLine2 || ''
			}`

			let timestamp = item._id.toString().substring(0, 8)
			let date = new Date(parseInt(timestamp, 16) * 1000)

			obj.createdDate = `${date.getDate()}/${
				date.getMonth() + 1
			}/${date.getFullYear()}`

			const conditionalStyles = {
				backgroundColor: item.status === 'active' ? '#ACE1AF' : '#FFC0CB',
				color: item.status === 'active' ? 'green' : 'red'
			}

			obj.status = (
				<Typography sx={{ px: 2, py: 1, ...conditionalStyles }}>
					{item.status}
				</Typography>
			)

			obj.contextMenu = (
				<>
					<ContextMenu
						rowData={item}
						setDirty={setDirty}
						showWarning={showWarning}
						setWarning={setWarning}
						isDirty={isDirty}
					/>
				</>
			)
			temp.push(obj)
		})

		return temp
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
		<>
			<div className="container">
				<PageHeader
					text="Payee List"
					info="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
				/>
				<div className="generic-table-container">
					<div className="d-flex align-items-center justify-content-end">
						<ButtonComponent
							text="New"
							variant="dark"
							icon={<AddOutlined />}
							type="button"
							onClick={openAddPayee}
							extraClass="ms-3"
						/>
					</div>
					<PaginationContainer
						page={page}
						pageSize={pageSize}
						onPageChange={setPage}
						onPageSizeChange={setPageSize}
						totalPageCount={totalCount}
					>
						<GenericTable
							columnData={columnData}
							modifiedData={makeTableData(payees || [])}
							count={payees?.length || 0}
							isLoading={isLoading}
							paginationOff={true}
							noDataProps={{
								text: 'All the payees created will be stored here. Create your first payee!',
								head: 'No payees',
								click: () => {
									openAddPayee()
								},
								btnText: 'New Payee'
							}}
						/>
					</PaginationContainer>
				</div>
			</div>

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
		</>
	)
}

export default Payee

import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import GenericTable from '../components/shared/GenericTable/GenericTable'
import PageHeader from '../components/shared/PageHeader'
import AddBank from '../components/views/forms/AddBank'
import {
        AddOutlined,
        DeleteOutlineOutlined,
        EditOutlined,
        MoreVert
} from '@mui/icons-material'
import ButtonComponent from '../components/shared/ButtonComponent'
import {
        Menu,
        MenuItem,
        IconButton,
        Typography,
        FormGroup,
        FormControlLabel,
        Switch,
        Box,
        Chip
} from '@mui/material'
import { updateSnackbar } from '../redux/snackbarState'
import FormModalMUI from '../components/shared/Modals/FormModalMUI'
import useBanks from '../API/banks/useBanks'
import useDeleteBank from '../API/banks/useDeleteBank'
import PaginationContainer from '../components/shared/paginationContainer'
import usePagination from '../utils/hooks/usePagination'
import { amountFix } from '../utils/helper'

const ContextMenu = ({ rowData }) => {
        const {
                mutate: deleteBankAccount,
                isPending: isSubmitting,
                error,
                reset
        } = useDeleteBank()
        const [anchorEl, setAnchorEl] = React.useState(null)
        const [isEditBankModalOpen, setEditBankModalOpen] = useState(false)
        const [isModalOpen, setModalOpen] = useState(false)

        const [showWarning, setWarning] = useState(false)

        const [isDirty, setIsDirty] = useState(false)

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

        const openEditBank = () => {
                setEditBankModalOpen(true)
                handleClose()
        }

        const closeEditBank = (forced) => {
                if (isDirty && !forced) {
                        setWarning(false)
                } else {
                        setEditBankModalOpen(false)
                        setWarning(false)
                }
        }

        const dispatch = useDispatch()

        const handleDeleteModal = () => {
                setModalOpen(!isModalOpen)
                reset()
        }

        const deleteUserBank = async () => {
                try {
                        deleteBankAccount(
                                { id: rowData._id },
                                { onSuccess: () => handleDeleteModal() }
                        )
                } catch (error) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Unable to delete.',
                                        severity: 'error'
                                })
                        )
                }
        }

        return (
                <>
                        <IconButton
                                aria-controls={open ? 'long-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                                sx={{ color: '#64748b' }}
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
                                        minWidth: 300
                                }}
                        >
                                <MenuItem
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                alignItems: 'center',
                                                gap: '10px',
                                                fontSize: '14px',
                                                '&:hover': { backgroundColor: 'rgba(30, 58, 95, 0.06)' },
                                        }}
                                >
                                        <button
                                                className="d-flex align-items-center justify-content-start w-100 p-0 border-0 bg-transparent"
                                                onClick={openEditBank}
                                                style={{ fontSize: '14px', color: '#1a1a2e' }}
                                        >
                                                <EditOutlined
                                                        sx={{
                                                                marginRight: '12px',
                                                                fontSize: '18px',
                                                                color: '#64748b',
                                                        }}
                                                />
                                                Edit
                                        </button>
                                </MenuItem>
                                <MenuItem
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                alignItems: 'center',
                                                gap: '10px',
                                                fontSize: '14px',
                                                color: '#dc2626',
                                                '&:hover': { backgroundColor: '#fef2f2' },
                                        }}
                                        onClick={() => {
                                                handleClose()
                                                handleDeleteModal()
                                        }}
                                >
                                        <DeleteOutlineOutlined
                                                sx={{
                                                        marginRight: '12px',
                                                        fontSize: '18px',
                                                }}
                                        />
                                        Delete
                                </MenuItem>
                        </Menu>

                        <FormModalMUI
                                title="Edit Bank Account Details"
                                open={isEditBankModalOpen}
                                maxWidth="md"
                                onClose={() => closeEditBank(true)}
                        >
                                <AddBank
                                        onClose={closeEditBank}
                                        isEdit={true}
                                        bankData={rowData}
                                        setDirty={setDirty}
                                        warning={showWarning}
                                        setWarning={setWarning}
                                />
                        </FormModalMUI>

                        {isModalOpen && (
                                <FormModalMUI
                                        onClose={handleDeleteModal}
                                        open={isModalOpen}
                                        maxWidth="sm"
                                >
                                        <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
                                                <Box
                                                        sx={{
                                                                width: '80px',
                                                                height: '80px',
                                                                borderRadius: '50%',
                                                                backgroundColor: '#fef2f2',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                mx: 'auto',
                                                                mb: 3,
                                                        }}
                                                >
                                                        <DeleteOutlineOutlined sx={{ fontSize: '40px', color: '#dc2626' }} />
                                                </Box>
                                                <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                                                        Confirm Deletion?
                                                </Typography>
                                                <Typography sx={{ fontSize: '14px', color: '#64748b', mb: 3 }}>
                                                        Are you sure you want to delete bank details for{' '}
                                                        <strong>{rowData.accountName}</strong> with account number:{' '}
                                                        <strong>{rowData.accountNumber}</strong>?
                                                </Typography>
                                                {error && (
                                                        <Typography sx={{ color: '#dc2626', fontSize: '14px', mb: 2 }}>
                                                                {error?.response?.data?.message}
                                                        </Typography>
                                                )}
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                                        <ButtonComponent
                                                                text="Cancel"
                                                                type="button"
                                                                variant="light"
                                                                click={handleDeleteModal}
                                                        />
                                                        <ButtonComponent
                                                                text={isSubmitting ? 'Deleting...' : 'Delete'}
                                                                disabled={isSubmitting}
                                                                type="submit"
                                                                variant="danger"
                                                                click={deleteUserBank}
                                                        />
                                                </Box>
                                        </Box>
                                </FormModalMUI>
                        )}
                </>
        )
}

const Banks = () => {
        const [includeDeactivated, setIncludeDeactivated] = useState(false)
        const { page, pageSize, setPage, setPageSize } = usePagination()
        const { data, isLoading } = useBanks({ page, pageSize, includeDeactivated })

        const banks = data?.data || []
        const totalCount = data?.totalCount

        const [isAddBankModalOpen, setAddBankModalOpen] = useState(false)
        const [showWarning, setWarning] = useState(false)

        const [isDirty, setIsDirty] = useState(false)

        const setDirty = (dirty) => {
                setIsDirty(dirty)
        }


        const makeTableData = (data) => {
                const temp = []
                if (data && data.length !== 0) {
                        data.forEach((item, index) => {
                                let obj = {}
                                const accountNumber = item.accountNumber.toString()

                                obj = { ...item }

                                obj.accountNumber = (
                                        <p className="generic-table-data">
                                                {`XXXXXXX${accountNumber?.substring(
                                                        accountNumber.length - 4,
                                                        accountNumber.length
                                                )}`}
                                        </p>
                                )
                                obj.balance = `${amountFix(item.balance)}`
                                obj.contextMenu = (
                                        <>
                                                <ContextMenu
                                                        rowData={item}
                                                        setWarning={setWarning}
                                                        setDirty={setDirty}
                                                        showWarning={showWarning}
                                                />
                                        </>
                                )

                                obj.status = (
                                        <Chip
                                                label={item.status}
                                                size="small"
                                                sx={{
                                                        fontWeight: 500,
                                                        fontSize: '12px',
                                                        backgroundColor: item.status === 'active' ? '#ecfdf5' : '#fef2f2',
                                                        color: item.status === 'active' ? '#059669' : '#dc2626',
                                                        border: `1px solid ${item.status === 'active' ? '#a7f3d0' : '#fecaca'}`,
                                                }}
                                        />
                                )
                                temp.push(obj)
                        })
                }

                return temp
        }

        const columnData = [
                {
                        key: 'Name',
                        value: 'accountName',
                        colWidth: '10%'
                },
                {
                        key: 'Nick Name',
                        value: 'accountNickName',
                        colWidth: '10%'
                },
                {
                        key: 'Bank Name',
                        value: 'bankName',
                        colWidth: '10%'
                },
                {
                        key: 'Account Number',
                        value: 'accountNumber',
                        colWidth: '10%'
                },
                {
                        key: 'Available Balance',
                        value: 'balance',
                        colWidth: '10%'
                },
                { key: 'Status', value: 'status', colWidth: '10%' },
                { key: 'Actions', value: 'contextMenu', colWidth: '9%' }
        ]

        const openAddBank = () => {
                setAddBankModalOpen(true)
        }

        const closeAddBank = (forced) => {
                if (isDirty && !forced) {
                        setWarning(false)
                } else {
                        setAddBankModalOpen(false)
                        setWarning(false)
                }
        }

        return (
                <>
                        <Box sx={{ px: { xs: 2, md: 3 }, py: 1 }}>
                                <PageHeader
                                        text="Bank Accounts"
                                        info="Please contact at support@synccos.com for queries and support"
                                />
                                <Box
                                        sx={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                p: { xs: 2, md: 3 },
                                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                                        }}
                                >
                                        <Box
                                                sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        mb: 2,
                                                }}
                                        >
                                                <FormGroup>
                                                        <FormControlLabel
                                                                label="Include Deactivated Accounts"
                                                                labelPlacement="start"
                                                                sx={{
                                                                        '& .MuiFormControlLabel-label': {
                                                                                fontSize: '14px',
                                                                                color: '#64748b',
                                                                        },
                                                                }}
                                                                control={
                                                                        <Switch
                                                                                name="status"
                                                                                checked={includeDeactivated}
                                                                                onChange={(e) => {
                                                                                        const checked = e.target.checked
                                                                                        setIncludeDeactivated(checked)
                                                                                }}
                                                                        />
                                                                }
                                                        />
                                                </FormGroup>
                                                <ButtonComponent
                                                        text="New"
                                                        variant="dark"
                                                        icon={<AddOutlined />}
                                                        type="button"
                                                        onClick={openAddBank}
                                                        extraClass="ms-3"
                                                />
                                        </Box>
                                        <PaginationContainer
                                                page={page}
                                                pageSize={pageSize}
                                                totalPageCount={totalCount}
                                                onPageChange={setPage}
                                                onPageSizeChange={setPageSize}
                                        >
                                                <GenericTable
                                                        columnData={columnData}
                                                        modifiedData={makeTableData(banks || [])}
                                                        count={banks?.length || 0}
                                                        isLoading={isLoading}
                                                        paginationOff={true}
                                                        noDataProps={{
                                                                text: 'All the banks created will be stored here. Create your first bank!',
                                                                head: 'No banks',
                                                                click: () => {
                                                                        openAddBank()
                                                                },
                                                                btnText: 'New Bank'
                                                        }}
                                                />
                                        </PaginationContainer>
                                </Box>
                        </Box>

                        <FormModalMUI
                                title="Add new bank account"
                                open={isAddBankModalOpen}
                                maxWidth="md"
                                onClose={() => closeAddBank(true)}
                        >
                                <AddBank
                                        onClose={closeAddBank}
                                        setDirty={setDirty}
                                        warning={showWarning}
                                        setWarning={setWarning}
                                />
                        </FormModalMUI>
                </>
        )
}

export default Banks

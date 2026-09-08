import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
        MenuItem,
        Select,
        Box,
        CircularProgress,
        IconButton,
        Menu,
        Typography,
        Popper,
        Fade,
        Paper,
        Link
} from '@mui/material'
import { AddOutlined, MoreVert, AttachFileOutlined } from '@mui/icons-material'
import { StickyCustomTable } from '../../components/table/StickyCustomTable'
import {
        useColumnSort,
        SortableHeaderLabel
} from '../../components/table/sortableHeader'
import AddTransactionModal from './components/AddTransactionModal'
import { useHistory } from 'react-router'
import FormModalMUI from '../../components/shared/Modals/FormModalMUI'
import { AttachmentsModal } from '../MyChecks/components/modals/AttachmentsModal'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { useUploadAttachments } from '../../API/attachments/useUploadAttachments'
import { useDeleteAttachments } from '../../API/attachments/useDeleteAttachments'
import { useUpdateAttachmentDescriptions } from '../../API/attachments/useUpdateAttachmentDescriptions'
import EditTransactionModal from './components/EditTransactionModal'
import useUpdateTransaction from '../../API/transactions/useUpdateTransaction'
import { queryClient } from '../..'

import { amountFix } from '../../utils/helper'
import useBanks from '../../API/banks/useBanks'
import { useInfiniteTransactions } from '../../API/transactions/useInfiniteTransactions'
import { useGetAttachments } from '../../API/attachments/useGetAttachments'
import { EntityType } from '../../types/attachment.types'
import { useSelector } from 'react-redux'
import { CustomButton } from '../../components/buttons/CustomButton'
import { styles } from './styles'
import { ClearedCheckIcon, ClearedIcon, EditIcon } from '../../components/Icons'
import LinkIcon from '@mui/icons-material/Link'
import { AttachmentItem } from '../MyChecks/components/AttachmentItem'
import CheckDetailContainerModal from '../MyChecks/components/modals/importFileReview/CheckDetailContainerModal'
import useUpdateTransactionStatus from '../../API/transactions/useUpdateTransactionStatus'
import { AlertModal } from '../MyChecks/components/modals'

const columnData = [
        { key: 'Issue date', value: 'issuedDate', colWidth: '1fr', align: 'left' },
        { key: 'Check #', value: 'checkNumber', colWidth: '1fr', align: 'center' },
        { key: 'Contact', value: 'payeeName', colWidth: '1.2fr', align: 'center' },
        {
                key: 'Description',
                value: 'description',
                colWidth: '1.4fr',
                align: 'center'
        },
        { key: 'Category', value: 'category', colWidth: '1fr', align: 'center' },
        {
                key: 'Status',
                type: 'html',
                value: 'status',
                colWidth: '1fr',
                align: 'center'
        },
        {
                key: 'Withdrawals',
                type: 'html',
                value: 'withdrawals',
                colWidth: '1fr',
                align: 'center'
        },
        {
                key: 'Deposits',
                type: 'html',
                value: 'deposits',
                colWidth: '1fr',
                align: 'center'
        },
        {
                key: 'Balance',
                type: 'html',
                value: 'balance',
                colWidth: '1fr',
                align: 'center'
        },
        { value: 'attachments', label: '', width: '30px', colWidth: '1fr' },
        { key: 'Action', value: 'action', colWidth: '1fr', align: 'center' }
]

const AttachmentIcon = React.memo(({ transaction, onClick }) => {
        const hasAttachments = transaction?.attachments?.length > 0
        const transactionId = transaction?._id

        if (!hasAttachments) return null

        return (
                <IconButton
                        size="small"
                        sx={{ p: 0.5 }}
                        onClick={() => onClick(transactionId)}
                >
                        <AttachFileOutlined
                                fontSize="inherit"
                                sx={{ color: '#1e3a5f', fontSize: '18px' }}
                        />
                </IconButton>
        )
})

const CheckRegister = () => {
        const org = useSelector((state) => state?.appData?.selectedOrganization)
        const { data, refetch: refetchBanks } = useBanks()

        // infinite scrolling like MyChecks
        const pageSize = 25

        const banks = data?.data || []
        const [selectedBank, setSelectedBank] = useState('')

        const bankOptions = useMemo(
                () =>
                        banks?.map((bank) => ({
                                key: bank.bankName,
                                value: bank._id,
                                accountNumber: bank.accountNumber,
                                balance: bank.balance
                        })) || [],
                [banks]
        )

        useEffect(() => {
                if (banks?.length && !selectedBank) {
                        setSelectedBank(banks[0]._id)
                }
        }, [banks, selectedBank])

        const SORTABLE_COLUMN_IDS = useMemo(
                () =>
                        new Set([
                                'issuedDate',
                                'checkNumber',
                                'payeeName',
                                'description',
                                'category',
                                'status',
                                'withdrawals',
                                'deposits',
                                'balance'
                        ]),
                []
        )

        const { sort, handleSortClick } = useColumnSort(SORTABLE_COLUMN_IDS)

        const {
                data: transactionsData,
                isLoading,
                fetchNextPage,
                hasNextPage,
                isFetchingNextPage,
                refetch: refetchTransactions
        } = useInfiniteTransactions({
                bankId: selectedBank,
                pageSize,
                sortBy: sort?.sortBy,
                sortOrder: sort?.sortOrder
        })

        const transactions = useMemo(() => {
                if (!transactionsData?.pages) return []
                return transactionsData.pages.flatMap((p) => p?.data || [])
        }, [transactionsData?.pages])

        const [isAddTransactionModalOpen, setAddTransactionModalOpen] =
                useState(false)

        // Attachments modal state
        const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false)
        const [attachmentLoading, setAttachmentLoading] = useState(false)
        const [selectedAttachments, setSelectedAttachments] = useState()
        const [attachmentAnchorEL, setAttachmentAnchorEL] = useState(null)

        // Edit modal state
        const [openEditModal, setOpenEditModal] = useState(false)
        const [selectedTransaction, setSelectedTransaction] = useState(null)

        // Check detail modal state
        const [openCheckDetailDialog, setOpenCheckDetailDialog] = useState(null)

        const [openConfirmatioModal, setOpenConfirmationModal] = useState(false)

        // Attachment operations
        const { mutateAsync: uploadAttachments } = useUploadAttachments()
        const { mutateAsync: deleteAttachments } = useDeleteAttachments()
        const { mutateAsync: updateAttachmentDescription } =
                useUpdateAttachmentDescriptions()

        // Transaction update operations
        const { mutate: updateTransaction } = useUpdateTransaction()
        const { mutate: updateTransactionStatus } = useUpdateTransactionStatus()

        // Get attachments for selected transaction

        const [anchorEl, setAnchorEl] = useState(null)

        // Action menu anchored to viewport coordinates (works with virtualization)
        const [actionAnchorPos, setActionAnchorPos] = useState(null)
        const [selectedActionRow, setSelectedActionRow] = useState(null)

        const handleActionClick = useCallback((event, row) => {
                setSelectedActionRow(row)
                setActionAnchorPos({ top: event.clientY, left: event.clientX })
        }, [])

        const handleActionClose = useCallback(() => {
                setActionAnchorPos(null)
        }, [])

        // Clear out attachment tooltip anchor after a delay
        useEffect(() => {
                if (!attachmentAnchorEL) return
                const timer = window.setTimeout(() => {
                        setAttachmentAnchorEL(null)
                }, 1200)
                return () => clearTimeout(timer)
        }, [attachmentAnchorEL])

        // Handle attachment icon click
        const handleAttachmentClick = useCallback(() => {
                setOpenAttachmentsModal(true)
        }, [])

        // Handle edit transaction
        const handleEditTransaction = () => {
                if (selectedActionRow) {
                        // Find the full transaction object from the data
                        const transaction = transactions.find(
                                (t) => t._id === selectedActionRow._id
                        )
                        setSelectedTransaction(transaction)
                        setOpenEditModal(true)
                }
                handleActionClose()
        }

        // Handle status update (toggle between cleared and pending)
        const handleStatusUpdate = () => {
                // Close menu first to avoid focus issues
                handleActionClose()
                setOpenConfirmationModal(false)

                if (selectedActionRow) {
                        // Find the full transaction object from the data
                        const transaction = transactions.find(
                                (t) => t._id === selectedActionRow._id
                        )
                        if (transaction) {
                                updateTransactionStatus({
                                        transactionId: transaction._id,
                                        body: { status: 'cleared' }
                                })
                        }
                }
        }

        // Handle attachment operations
        const handleAttachmentSave = async (
                filesToUpload,
                filesToDelete,
                filesToUpdate
        ) => {
                try {
                        setAttachmentLoading(true)

                        // Upload new attachments
                        if (filesToUpload.length > 0) {
                                if (!selectedActionRow) {
                                        throw new Error('No transaction selected for attachment upload')
                                }

                                const formData = new FormData()
                                formData.append(
                                        'entityType',
                                        selectedActionRow.checkId ? EntityType.CHECK : EntityType.TRANSACTION
                                )
                                formData.append(
                                        'entityId',
                                        selectedActionRow.checkId || selectedActionRow._id
                                )

                                filesToUpload.forEach((file) => {
                                        formData.append('files', file.file)
                                        formData.append('descriptions', file.description || '')
                                })

                                await uploadAttachments(formData)
                        }

                        // Delete attachments
                        if (filesToDelete.length > 0) {
                                await deleteAttachments({ attachmentIds: filesToDelete })
                        }

                        // Update attachment descriptions
                        if (filesToUpdate.length > 0) {
                                const updates = filesToUpdate.map((file) => ({
                                        attachmentId: file._id,
                                        description: file.description || ''
                                }))
                                await updateAttachmentDescription({ updates })
                        }

                        queryClient.invalidateQueries({
                                queryKey: ['attachments'],
                                exact: false
                        })
                        queryClient.invalidateQueries({
                                queryKey: ['transactions'],
                                exact: false
                        })
                        setAttachmentLoading(false)
                        setOpenAttachmentsModal(false)
                } catch (error) {
                        // Show user-friendly error message
                        alert(
                                `Failed to save attachments: ${
                                        error.response?.data?.message || error.message || 'Unknown error'
                                }`
                        )
                        setAttachmentLoading(false)
                }
        }

        useEffect(() => {
                setSelectedBank('')
        }, [org])

        const openAddTransaction = () => {
                setAddTransactionModalOpen(true)
        }

        const closeAddTransaction = async () => {
                setAddTransactionModalOpen(false)
                setOpenAttachmentsModal(false)
                setAnchorEl(null)
                refetchBanks()
                refetchTransactions()
        }

        const handleClose = () => {
                setAnchorEl(null)
        }

        const getBalanceColor = useCallback((balance) => {
                return balance < 0 ? 'red' : 'green'
        }, [])

        const currentBalanceValue = useMemo(
                () =>
                        bankOptions?.find((item) => item?.value === selectedBank)?.balance || 0,
                [bankOptions, selectedBank]
        )

        return (
                <Box className="container">
                        <Box className="page-header d-flex align-items-center justify-content-between mb-4 pb-4">
                                <Box className="d-flex align-items-start justify-content-between w-100">
                                        <Box className="flex flex-column">
                                                <h3 className="fs-7 fw-semibold mb-2 text-" style={styles.headline}>
                                                        Account
                                                </h3>
                                                <p className="regular-txt fs-18 mb-0 text-dark opacity-30">
                                                        View and manage all check activity, deposits, and withdrawals for
                                                        the selected account.
                                                </p>
                                        </Box>
                                        <Box className="d-flex align-items-center justify-content-center">
                                                <p className="regular-txt fs-18 mb-0 border border-[#e2e8f0] rounded-3 p-2 px-3">
                                                        Current Balance:{' '}
                                                        <span
                                                                className="fw-semibold"
                                                                style={{ color: getBalanceColor(currentBalanceValue) }}
                                                        >
                                                                {amountFix(currentBalanceValue)}
                                                        </span>
                                                </p>
                                        </Box>
                                </Box>
                        </Box>
                        <Box className="d-flex align-items-center justify-content-between mt-4 mb-3">
                                <Box className="d-flex align-items-center justify-content-between w-100">
                                        <Box>
                                                <Select
                                                        sx={styles.bankSelect}
                                                        MenuProps={{ sx: styles.bankDropdownMenu }}
                                                        value={selectedBank}
                                                        onChange={(e) => {
                                                                setSelectedBank(e.target.value)
                                                        }}
                                                >
                                                        {bankOptions.map((bank, index) => (
                                                                <MenuItem
                                                                        key={index}
                                                                        value={bank.value}
                                                                        className="menu-item"
                                                                        sx={styles.bankMenuItem}
                                                                >
                                                                        {bank.key}
                                                                </MenuItem>
                                                        ))}
                                                </Select>
                                        </Box>

                                        <CustomButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={openAddTransaction}
                                                startIcon={<AddOutlined />}
                                        >
                                                Add Transactions
                                        </CustomButton>
                                </Box>
                        </Box>
                        <Box
                                className="generic-table-container"
                                sx={styles.genericTableContainer}
                        >
                                <StickyCustomTable
                                        columns={columnData.map((c) => ({
                                                id: c.value,
                                                label: c.key,
                                                width: c.colWidth,
                                                textAlign: c.align
                                        }))}
                                        renderHeaderCell={(column) => (
                                                <SortableHeaderLabel
                                                        column={column}
                                                        label={column.label}
                                                        sort={sort}
                                                        sortableColumnIds={SORTABLE_COLUMN_IDS}
                                                        onSortClick={handleSortClick}
                                                />
                                        )}
                                        data={useMemo(() => makeTableData(transactions), [transactions])}
                                        renderCell={(row, col) => {
                                                if (col.id === 'action') {
                                                        return (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <AttachmentIcon
                                                                                tranction={row}
                                                                                onClick={handleAttachmentClick}
                                                                        />
                                                                        <IconButton
                                                                                onClick={(e) => handleActionClick(e, row)}
                                                                                size="small"
                                                                        >
                                                                                <MoreVert fontSize="inherit" />
                                                                        </IconButton>
                                                                </Box>
                                                        )
                                                }
                                                if (col.id === 'attachments' && row.attachments.length) {
                                                        return (
                                                                <AttachFileIcon
                                                                        onMouseEnter={(e) => {
                                                                                const x = e.clientX
                                                                                const y = e.clientY
                                                                                setAttachmentAnchorEL({
                                                                                        getBoundingClientRect: () => new DOMRect(x, y, 0, 0)
                                                                                })
                                                                                setSelectedActionRow(row)
                                                                        }}
                                                                        onClick={() => {
                                                                                setSelectedActionRow(row)
                                                                                setOpenAttachmentsModal(true)
                                                                        }}
                                                                        onMouseOut={() => {
                                                                                setAttachmentAnchorEL(null)
                                                                        }}
                                                                        sx={{
                                                                                width: '16px',
                                                                                height: '16px',
                                                                                rotate: '45deg',
                                                                                color: '#00000099'
                                                                        }}
                                                                />
                                                        )
                                                }
                                                if (col.id === 'checkNumber') {
                                                        return row?.checkNumber ? (
                                                                <Link
                                                                        sx={{ cursor: 'pointer' }}
                                                                        onClick={() => {
                                                                                setSelectedActionRow(row)
                                                                                setOpenCheckDetailDialog(true)
                                                                        }}
                                                                >
                                                                        {row?.checkNumber}
                                                                </Link>
                                                        ) : (
                                                                ''
                                                        )
                                                }

                                                const cell = row[col.id]

                                                // If object
                                                if (cell && typeof cell === 'object') {
                                                        if (cell.html) return cell.html
                                                        if (cell.value !== undefined && cell.value !== null)
                                                                return cell.value.toString()
                                                        return ''
                                                }

                                                return cell ?? ''
                                        }}
                                        noDataAavailableText="All the Transactions created will be stored here"
                                        onScroll={(atBottom) => {
                                                if (hasNextPage && !isFetchingNextPage && atBottom) {
                                                        fetchNextPage()
                                                }
                                        }}
                                />

                                {/* Loader overlay (keeps header visible) */}
                                {isLoading && (
                                        <Box sx={styles.loadingOverlay}>
                                                <CircularProgress />
                                        </Box>
                                )}

                                {/* Infinite scroll status */}
                                {!isLoading && isFetchingNextPage && (
                                        <Box sx={styles.loadingMore}>Loading more...</Box>
                                )}
                                {/* Action menu */}
                                <Menu
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                                actionAnchorPos
                                                        ? { top: actionAnchorPos.top, left: actionAnchorPos.left }
                                                        : undefined
                                        }
                                        // you can keep transform/anchor origins if you like:
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        open={Boolean(actionAnchorPos)}
                                        onClose={handleActionClose}
                                        sx={styles.menuPaper}
                                >
                                        {!selectedActionRow?.checkId && (
                                                <MenuItem onClick={handleEditTransaction} sx={styles.menuItem}>
                                                        <EditIcon />
                                                        Edit
                                                </MenuItem>
                                        )}
                                        <MenuItem
                                                onClick={() => {
                                                        handleAttachmentClick(selectedActionRow?._id)
                                                        handleActionClose()
                                                }}
                                                sx={styles.menuItem}
                                        >
                                                <LinkIcon
                                                        sx={{ rotate: '-45deg', width: '18px', height: '18px' }}
                                                />
                                                Attachments
                                        </MenuItem>
                                        {selectedActionRow?.status.value !== 'cleared' && (
                                                <MenuItem
                                                        onClick={() => setOpenConfirmationModal(true)}
                                                        sx={styles.menuItem}
                                                >
                                                        <ClearedIcon />
                                                        Cleared
                                                </MenuItem>
                                        )}
                                </Menu>
                        </Box>
                        {transactions?.length > 0 && (
                                <Typography sx={{ color: '#849098', mt: '32px', marginLeft: '5px' }}>
                                        1 to {transactions?.length} of {transactionsData?.pages[0].totalCount}
                                </Typography>
                        )}
                        <FormModalMUI
                                title=""
                                open={isAddTransactionModalOpen}
                                maxWidth="sm"
                                onClose={closeAddTransaction}
                        >
                                <AddTransactionModal
                                        open={isAddTransactionModalOpen}
                                        onClose={closeAddTransaction}
                                        bankId={selectedBank}
                                />
                        </FormModalMUI>

                        {/* Attachments Modal */}
                        <AttachmentsModal
                                open={openAttachmentsModal}
                                onClose={closeAddTransaction}
                                handleSave={handleAttachmentSave}
                                attachments={selectedActionRow?.attachments || []}
                                title="Transaction Attachments"
                                loading={attachmentLoading}
                        />

                        {/* Edit Transaction Modal */}
                        {openEditModal && (
                                <EditTransactionModal
                                        open={openEditModal}
                                        onClose={() => {
                                                setOpenEditModal(false)
                                                setSelectedTransaction(null)
                                        }}
                                        transaction={selectedTransaction}
                                        attachments={selectedActionRow?.attachments || []}
                                        handleAttachmentSave={handleAttachmentSave}
                                />
                        )}

                        <Popper
                                open={!!attachmentAnchorEL}
                                anchorEl={attachmentAnchorEL}
                                placement="bottom-end"
                                style={{ zIndex: 9999 }}
                                transition
                                disablePortal
                                modifiers={[
                                        {
                                                name: 'offset',
                                                options: {
                                                        offset: [0, 8]
                                                }
                                        }
                                ]}
                        >
                                {({ TransitionProps }) => (
                                        <Fade {...TransitionProps} timeout={200}>
                                                <Paper sx={{ ...styles.tagTablePaper, minWidth: '230px' }}>
                                                        {selectedActionRow &&
                                                                selectedActionRow.attachments &&
                                                                selectedActionRow?.attachments?.map((attachment, index) => (
                                                                        <AttachmentItem
                                                                                attachment={attachment}
                                                                                key={'table_attachment' + index}
                                                                        />
                                                                ))}
                                                </Paper>
                                        </Fade>
                                )}
                        </Popper>
                        {openCheckDetailDialog && (
                                <CheckDetailContainerModal
                                        open={openCheckDetailDialog}
                                        checkId={selectedActionRow?.checkId}
                                        onClose={() => setOpenCheckDetailDialog(false)}
                                />
                        )}

                        <AlertModal
                                onClose={() => setOpenConfirmationModal(false)}
                                open={openConfirmatioModal}
                                title="Change to Cleared?"
                                cancelLabel="Close"
                                confirmLabel="Confirm"
                                icon={<ClearedCheckIcon />}
                                onConfirm={handleStatusUpdate}
                                description="Are you sure you want to update it to Cleared?"
                        />
                </Box>
        )
}

export default CheckRegister

function makeTableData(data, payeesData = null) {
        const payees = payeesData?.data || []
        const safeData = Array.isArray(data) ? data : []
        const temp = safeData.map((item) => {
                const date = new Date(item.issueDate)
                // Find payee name by ID if available
                const payeeName = item?.payee?.name || ''

                return {
                        _id: item._id, // Add transaction ID for attachment queries
                        payeeName,
                        checkId: item.checkId || null,
                        description: item.description || '',
                        checkNumber: item.checkNumber || '',
                        deposit: {
                                value: item.amount,
                                html: (
                                        <Box
                                                sx={{
                                                        backgroundColor: '#FFFFF',
                                                        color: '#06cb52',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        borderRadius: '6px'
                                                }}
                                        >
                                                {item.amount && item.type === 'deposit'
                                                        ? `${amountFix(item.amount)}`
                                                        : ''}
                                        </Box>
                                )
                        },
                        balance: amountFix(item.balance),
                        category: item.category || '',
                        withdrawals: {
                                value: item.type === 'transaction' ? item.amount : null,
                                html:
                                        item.type === 'transaction' ? (
                                                <Box sx={{ color: '#DE0202', fontSize: '12px', fontWeight: '500' }}>
                                                        {amountFix(item.amount)}
                                                </Box>
                                        ) : null
                        },
                        deposits: {
                                value: item.type === 'deposit' ? item.amount : null,
                                html:
                                        item.type === 'deposit' ? (
                                                <Box sx={{ color: '#06cb52', fontSize: '12px', fontWeight: '500' }}>
                                                        {amountFix(item.amount)}
                                                </Box>
                                        ) : null
                        },
                        reference: item.reference || '',
                        // fallback legacy amount & deposit kept for other pages
                        amount: {
                                value: item.amount,
                                html: (
                                        <div
                                                style={{
                                                        backgroundColor: '#FFFFF',
                                                        color: '#DE0202',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        borderRadius: '6px'
                                                }}
                                                disabled={true}
                                        >
                                                {item.amount && item.type === 'transaction'
                                                        ? `${amountFix(item.amount)}`
                                                        : ''}
                                        </div>
                                )
                        },
                        status: {
                                value: item.status,
                                html: (
                                        <>
                                                {item.status !== '' ? (
                                                        <Box
                                                                className={
                                                                        'check-status-div d-flex flex-row align-items-center py-2 px-2 rounded justify-content-center text-capitalize mx-auto'
                                                                }
                                                                sx={{
                                                                        backgroundColor:
                                                                                item.status?.toLowerCase() === 'cleared' ||
                                                                                item.status?.toLowerCase() === 'paid'
                                                                                        ? '#0582050D'
                                                                                        : item.status?.toLowerCase() === 'pending' ||
                                                                                          item.status?.toLowerCase() === 'open'
                                                                                        ? '#1e3a5f0D'
                                                                                        : '#1e3a5f0D',
                                                                        borderColor:
                                                                                item.status?.toLowerCase() === 'cleared' ||
                                                                                item.status?.toLowerCase() === 'paid'
                                                                                        ? '#05820582'
                                                                                        : item.status?.toLowerCase() === 'pending' ||
                                                                                          item.status?.toLowerCase() === 'open'
                                                                                        ? '#1e3a5f'
                                                                                        : '#1e3a5f',
                                                                        color:
                                                                                item.status?.toLowerCase() === 'cleared' ||
                                                                                item.status?.toLowerCase() === 'paid'
                                                                                        ? '#05820582'
                                                                                        : item.status?.toLowerCase() === 'pending' ||
                                                                                          item.status?.toLowerCase() === 'open'
                                                                                        ? '#1e3a5f'
                                                                                        : '#1e3a5f',
                                                                        fontSize: '12px',
                                                                        fontWeight: '500',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid',
                                                                        lineHeight: '1'
                                                                }}
                                                        >
                                                                {item.status === 'cleared' || item.status === 'paid'
                                                                        ? 'Cleared'
                                                                        : item.status === 'open'
                                                                        ? 'Pending'
                                                                        : item.status?.charAt(0)?.toUpperCase() +
                                                                                        item.status?.slice(1) || 'Pending'}
                                                        </Box>
                                                ) : (
                                                        <Box
                                                                className={
                                                                        'check-status-div d-flex flex-row align-items-center py-3 px-2 rounded justify-content-center text-capitalize mx-auto'
                                                                }
                                                                style={{
                                                                        height: '25%',
                                                                        width: '50%',
                                                                        color: '#1a1a2e',
                                                                        fontSize: '10px',
                                                                        fontWeight: '500'
                                                                }}
                                                                disabled={true}
                                                        ></Box>
                                                )}
                                        </>
                                )
                        },
                        attachments: item.attachments || [],
                        issuedDate: item.issueDate
                                ? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
                                : '',
                        action: ''
                }
        })

        return temp
}

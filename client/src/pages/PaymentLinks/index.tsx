import React, { useMemo, useState } from 'react'
import {
        Box,
        Typography,
        IconButton,
        Pagination,
        PaginationItem,
        Menu,
        MenuItem,
        Popper,
        Paper,
        Fade,
        ListItemText
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import AddIcon from '@mui/icons-material/Add'
import LinkIcon from '@mui/icons-material/Link'
import { CustomTable } from '../../components/table/CustomTable'
import { CustomButton } from '../../components/buttons/CustomButton'
import {
        FilterIcon,
        MoreVerticalIcon,
        PaymentCancelIcon,
        PaymentResendIcon,
        PaymentCopyLinkIcon,
        PaymentDownloadIcon
} from '../../components/Icons'
import FilterMenu from './components/FilterMenu'
import { AttachmentsModal } from './components/modals/AttachmentsModal'
import { AttachmentItem } from './components/AttachmentItem'
import { CancelPaymentLinkAlert } from './components/modals/CancelPaymentLinkAlert'
import { CreatePaymentLinkModal } from './components/modals/CreatePaymentLinkModal'
import { styles } from './styles'
import useGetUserPayments from '../../API/payment/useGetUserPayments'
import { PaymentLink } from '../../types/payment.type'
import { useCancelPayment } from '../../API/payment/useCancelPayment'
import { EntityType } from '../../types/attachment.types'
import { useUploadAttachments } from '../../API/attachments/useUploadAttachments'
import { useDeleteAttachments } from '../../API/attachments/useDeleteAttachments'
import { useUpdateAttachmentDescriptions } from '../../API/attachments/useUpdateAttachmentDescriptions'
import { queryClient } from '../..'
import { useResendPaymentLink } from '../../API/payment/useResendPaymenLink'
import { useDownloadReceipt } from '../../API/payment/useDownloadReceipt'
import useStripeAccount from '../../API/integrations/useStripeAccount'
import { ConnectStripeAccountAlert } from './components/modals/ConnectStripeAccountAlert'
import { updateSnackbar } from '../../redux/snackbarState'
import { useDispatch } from 'react-redux'
import { formatUSD } from '../../utils/helper'

interface Column {
        id: string
        label: string
        width?: string
}

export const getStatusColor = (status: string): string => {
        switch (status) {
                case 'paid':
                        return '#058205'
                case 'pending':
                        return '#1e3a5f'
                case 'canceled':
                        return '#F03D3E'
                case 'expired':
                        return '#EF6C00'
                default:
                        return '#000000'
        }
}

const PaymentLinks: React.FC = () => {
        // Use proper typing for the anchor element state
        const [filterMenuAnchorEl, setFilterMenuAnchorEl] =
                useState<HTMLElement | null>(null)
        const [filterList, setFilterList] = useState({
                multiFilter: { Status: [], 'Recipient Name': [] }
        })
        const history = useHistory()
        const { data: userStripeAccount } = useStripeAccount()

        const [openConnectStripeAccountAlert, setOpenConnectStripeAccountAlert] =
                useState(false)

        const [page, setPage] = useState(1)
        const [selectedAttachments, setSelectedAttachments] = useState([])
        const [attachmentAnchorEL, setAttachmentAnchorEL] =
                useState<HTMLElement | null>(null)
        const [selectedItem, setSelectedItem] = useState<any>(null)
        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
        const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false)
        const [openCancelAlert, setOpenCancelAlert] = useState(false)
        const [attachmentLoading, setAttachmentLoading] = useState(false)
        const { mutate: cancelPaymentLink } = useCancelPayment()

        const { mutate: resendPaymentLink } = useResendPaymentLink()

        const { mutate: downloadReceipt } = useDownloadReceipt()

        const { mutateAsync: uploadAttachments } = useUploadAttachments()
        const { mutateAsync: deleteAttachments } = useDeleteAttachments()
        const { mutateAsync: updateAttachmentDescription } =
                useUpdateAttachmentDescriptions()

        const dispatch = useDispatch()

        const paymentLinksPagenatedFilters = useMemo(() => {
                const filters: any = {}
                if (filterList.multiFilter['email']?.length > 0) {
                        filters.recipientEmail = filterList.multiFilter['email']
                }
                if (filterList.multiFilter['Status']?.length > 0) {
                        filters.status = filterList.multiFilter['Status'].map((status: string) =>
                                status.toLowerCase()
                        )
                }
                if (
                        filterList.multiFilter['startDate'] &&
                        filterList.multiFilter['endDate']
                ) {
                        filters.startDate = filterList.multiFilter['startDate']
                        filters.endDate = filterList.multiFilter['endDate']
                }
                if (filterList.multiFilter['Custom Search']) {
                        filters.search = filterList.multiFilter['Custom Search']
                }
                return filters
        }, [filterList])

        const { data: paymentLinksPagenated } = useGetUserPayments({
                page: page,
                pageSize: 10,
                ...paymentLinksPagenatedFilters
        })

        const paymentLinks = paymentLinksPagenated?.results || []

        const [openCreatePaymentLinkModal, setOpenCreatePaymentLinkModal] =
                useState(false)

        const handleMenuOpen = (
                event: React.MouseEvent<HTMLButtonElement>,
                data: PaymentLink
        ) => {
                setAnchorEl(event.currentTarget)
                setSelectedItem(paymentLinks.find((item) => item._id === data._id) || null)
        }
        const handleAttachments = () => {
                setAnchorEl(null)
                setOpenAttachmentsModal(true)
        }

        const renderHeaderCell = (column: Column) => {
                return column.label
        }

        const renderCell = (row: PaymentLink, column: Column) => {
                switch (column.id) {
                        case 'recipientName':
                                return (
                                        <Box sx={{ textAlign: 'left' }}>
                                                <ListItemText primary={row.recipientName} />
                                                <Typography
                                                        sx={{
                                                                color: '#1e3a5f',
                                                                textDecoration: 'underline',
                                                                fontSize: '12px'
                                                        }}
                                                >
                                                        {row.recipientEmail}
                                                </Typography>
                                        </Box>
                                )
                        case 'status':
                                return (
                                        <CustomButton
                                                size="small"
                                                sx={{
                                                        width: '110px',
                                                        color: getStatusColor(row.status),
                                                        backgroundColor: `${getStatusColor(row.status)}0D`,
                                                        border: `1px solid ${getStatusColor(row.status)}`,
                                                        '&:hover': {
                                                                backgroundColor: `${getStatusColor(row.status)}1A`,
                                                                border: `1px solid ${getStatusColor(row.status)}`
                                                        },
                                                        '& .MuiBox-root': {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px'
                                                        }
                                                }}
                                        >
                                                {row.status}
                                        </CustomButton>
                                )
                        case 'attachment':
                                return row.attachments?.length ? (
                                        <AttachFileIcon
                                                onMouseEnter={(event: any) => {
                                                        setAttachmentAnchorEL(event.currentTarget)
                                                        setSelectedAttachments(row.attachments || [])
                                                }}
                                                onMouseLeave={() => {
                                                        setAttachmentAnchorEL(null)
                                                }}
                                                sx={{
                                                        width: '16px',
                                                        height: '16px',
                                                        rotate: '45deg',
                                                        color: '#00000099'
                                                }}
                                        />
                                ) : null
                        case 'createdAtUnix':
                                return new Date(row.createdAtUnix * 1000).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                })
                        case 'actions':
                                return (
                                        <IconButton
                                                sx={styles.moreButton}
                                                onClick={(e) => handleMenuOpen(e, row)}
                                        >
                                                <MoreVerticalIcon />
                                        </IconButton>
                                )
                        case 'amount':
                                return formatUSD(row.amount)
                        default:
                                return row[column.id as keyof PaymentLink]
                }
        }

        const handleAttachmentCancel = () => {
                if (selectedItem) {
                        cancelPaymentLink(selectedItem._id)
                        setOpenCancelAlert(false)
                }
                setAnchorEl(null)
        }

        const handleCopyLink = async () => {
                if (selectedItem) {
                        await navigator.clipboard.writeText(selectedItem.paymentLink)
                        setOpenCancelAlert(false)

                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: 'Link copied to clipboard.',
                                        severity: 'success'
                                })
                        )
                }
                setAnchorEl(null)
        }

        const handleResend = () => {
                if (selectedItem) {
                        resendPaymentLink(selectedItem._id)
                }
                setAnchorEl(null)
        }

        const handleDownloadReceipt = () => {
                if (selectedItem) {
                        downloadReceipt(selectedItem._id, {
                                onSuccess: (res) => {
                                        window.open(res.url, '_blank')
                                }
                        })
                }
                setAnchorEl(null)
        }

        const handleAttachmentSave = async (
                filesToUpload,
                filesToDelete,
                filesToUpdate
        ) => {
                try {
                        setAttachmentLoading(true)
                        // upload new attachments
                        if (filesToUpload.length > 0 && selectedItem._id) {
                                const formData = new FormData()
                                formData.append('entityType', EntityType.PAYMENT_LINK)
                                formData.append('entityId', selectedItem._id)

                                filesToUpload.forEach((file) => {
                                        formData.append('files', file.file)
                                        formData.append('descriptions', file.description || '')
                                })

                                await uploadAttachments(formData)
                        }

                        // delete attachments
                        if (filesToDelete.length > 0) {
                                await deleteAttachments({ attachmentIds: filesToDelete })
                        }

                        // update attachment descriptions
                        if (filesToUpdate.length > 0) {
                                const updates = filesToUpdate.map((file) => ({
                                        attachmentId: file._id,
                                        description: file.description || ''
                                }))
                                await updateAttachmentDescription({ updates })
                        }
                        queryClient.invalidateQueries({ queryKey: ['payment-link'] })
                        setAttachmentLoading(false)
                        setOpenAttachmentsModal(false)
                } catch (error) {
                        console.error('Failed to save attachments:', error)
                        setAttachmentLoading(false)
                }
        }
        return (
                <Box sx={styles.wrapper}>
                        <Box sx={styles.titleContainer}>
                                <Box>
                                        <Typography sx={styles.title}>My Payment Links</Typography>

                                        <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={styles.description}
                                        >
                                                Below is the list of all your Payment links
                                        </Typography>
                                </Box>
                                <Box>
                                        <HelpOutlineIcon sx={styles.helpIcon} />
                                </Box>
                        </Box>

                        <Box sx={styles.actionContainer}>
                                <CustomButton
                                        variant="outlined"
                                        endIcon={<FilterIcon color="#1a3850" />}
                                        color="secondary"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                                                setFilterMenuAnchorEl(e.currentTarget)
                                        }
                                >
                                        Filter
                                </CustomButton>

                                <CustomButton
                                        variant="outlined"
                                        startIcon={<AddIcon sx={{ fontSize: '20px' }} />}
                                        color="primary"
                                        onClick={() => {
                                                if (!userStripeAccount.userAccount) {
                                                        setOpenConnectStripeAccountAlert(true)
                                                } else {
                                                        setOpenCreatePaymentLinkModal(true)
                                                }
                                        }}
                                >
                                        New
                                </CustomButton>
                        </Box>

                        <CustomTable
                                columns={[
                                        { id: 'recipientName', label: 'Recipient Name' },
                                        { id: 'createdAtUnix', label: 'Data Created', width: '120px' },
                                        { id: 'amount', label: 'Amount', width: '100px' },
                                        { id: 'note', label: 'Note' },
                                        { id: 'status', label: 'Status', width: '140px' },
                                        { id: 'paidOn', label: 'Paid On', width: '140px' },
                                        { id: 'attachment', label: '', width: '50px' },
                                        { id: 'actions', label: 'Actions', width: '80px' }
                                ]}
                                data={paymentLinks}
                                renderCell={renderCell}
                                renderHeaderCell={renderHeaderCell}
                                isCenteredCells={true}
                        />

                        <Box sx={styles.paginationContainer}>
                                <Pagination
                                        count={paymentLinksPagenated?.totalPages}
                                        page={page}
                                        onChange={(event, value) => setPage(value)}
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

                        <FilterMenu
                                anchorEl={filterMenuAnchorEl}
                                setAnchorEl={setFilterMenuAnchorEl}
                                setFilterList={setFilterList}
                                filterList={filterList}
                        />

                        <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
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
                                {selectedItem?.status === 'pending' && (
                                        <>
                                                <MenuItem
                                                        onClick={() => {
                                                                setOpenCancelAlert(true)
                                                                setAnchorEl(null)
                                                        }}
                                                        sx={styles.menuItem}
                                                >
                                                        <PaymentCancelIcon color="#1e3a5f" />
                                                        Cancel
                                                </MenuItem>
                                                <MenuItem onClick={handleResend} sx={styles.menuItem}>
                                                        <PaymentResendIcon color="#1e3a5f" />
                                                        Resend
                                                </MenuItem>
                                                <MenuItem onClick={handleCopyLink} sx={styles.menuItem}>
                                                        <PaymentCopyLinkIcon color="#1e3a5f" />
                                                        Copy Link
                                                </MenuItem>
                                        </>
                                )}
                                <MenuItem onClick={handleAttachments} sx={styles.menuItem}>
                                        <LinkIcon sx={{ rotate: '-45deg', width: '18px', height: '18px' }} />
                                        Attachments
                                </MenuItem>
                                {selectedItem?.status === 'paid' && (
                                        <MenuItem onClick={handleDownloadReceipt} sx={styles.menuItem}>
                                                <PaymentDownloadIcon color="#1e3a5f" />
                                                Receipt
                                        </MenuItem>
                                )}
                        </Menu>

                        <Popper
                                open={Boolean(attachmentAnchorEL)}
                                anchorEl={attachmentAnchorEL}
                                placement="bottom-end"
                                style={{ zIndex: 9999 }}
                                transition
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
                                                        {selectedAttachments?.map((attachment: any, index) => (
                                                                <AttachmentItem
                                                                        attachment={attachment}
                                                                        key={`table_attachment_${index}`}
                                                                />
                                                        ))}
                                                </Paper>
                                        </Fade>
                                )}
                        </Popper>

                        <CreatePaymentLinkModal
                                open={openCreatePaymentLinkModal}
                                onClose={() => setOpenCreatePaymentLinkModal(false)}
                        />

                        <CancelPaymentLinkAlert
                                open={openCancelAlert}
                                onClose={() => setOpenCancelAlert(false)}
                                onConfirm={handleAttachmentCancel}
                        />

                        <AttachmentsModal
                                open={openAttachmentsModal}
                                onClose={() => setOpenAttachmentsModal(false)}
                                title="View Attachments"
                                handleSave={handleAttachmentSave}
                                attachments={selectedItem?.attachments}
                                loading={attachmentLoading}
                        />

                        <ConnectStripeAccountAlert
                                open={openConnectStripeAccountAlert}
                                onClose={() => setOpenConnectStripeAccountAlert(false)}
                                onConfirm={() => {
                                        history.push('/dashboard/integrations/payments')
                                }}
                        />
                </Box>
        )
}

export default PaymentLinks

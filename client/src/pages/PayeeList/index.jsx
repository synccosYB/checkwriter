import React, { useState, useMemo } from 'react'

import { StickyCustomTable } from '../../components/table/StickyCustomTable'
import {
        useColumnSort,
        SortableHeaderLabel
} from '../../components/table/sortableHeader'
import {
        AddOutlined,
        DeleteOutlineOutlined,
        EditOutlined,
        CheckBoxOutlined
} from '@mui/icons-material'
import {
        FilterIcon,
        SearchIcon,
        MoreVerticalIcon
} from '../../components/Icons'
import ButtonComponent from '../../components/shared/ButtonComponent'
import {
        Menu,
        MenuItem,
        IconButton,
        Typography,
        TextField,
        InputAdornment,
        Checkbox,
        Box,
        useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import FormModalMUI from '../../components/shared/Modals/FormModalMUI'
import useDeletePayee from '../../API/payees/useDeletePayee'
import useUpdatePayee from '../../API/payees/useUpdatePayee'
import { styles, STATUS_TYPES } from './styles'
import { AlertModal } from '../MyChecks/components/modals'
import { DeactivateWarningIcon } from '../../components/shared/Icons'
import activeLogo from '../../assets/images/ActiveLogo.png'
import { getColumns, makeTableData } from './utils/helper'
import useInfinitePayees from '../../API/payees/useInfinitePayees'
import AddPayee from '../../components/views/forms/AddPayee'

const ActivateConfirmationIcon = () => (
        <img
                src={activeLogo}
                alt="Activate"
                style={{ width: '121px', height: '121px' }}
        />
)

const Payee = () => {
        const theme = useTheme()
        const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
        const pageSize = 25

        const SORTABLE_COLUMN_IDS = useMemo(
                () => new Set(['name', 'payeeAddress', 'email', 'phone', 'status']),
                []
        )
        const { sort, handleSortClick } = useColumnSort(SORTABLE_COLUMN_IDS)

        const {
                data,
                isLoading,
                fetchNextPage,
                hasNextPage,
                isFetchingNextPage,
                refetch
        } = useInfinitePayees({
                pageSize,
                sortBy: sort?.sortBy,
                sortOrder: sort?.sortOrder
        })

        const payees = useMemo(() => {
                if (!data?.pages) return []
                return data.pages.flatMap((page) => page?.data || [])
        }, [data?.pages])

        const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)
        const [selectedRows, setSelectedRows] = useState([])

        const [isDirty, setIsDirty] = useState(false)
        const [showWarning, setWarning] = useState(false)

        const [filterAnchorEl, setFilterAnchorEl] = useState(null)
        const [searchQuery, setSearchQuery] = useState('')
        const [selectedStatuses, setSelectedStatuses] = useState([])
        const [filteredData, setFilteredData] = useState([])
        const [anchorEl, setAnchorEl] = useState(null)
        const [selectedPayee, setSelectedPayee] = useState(null)
        const [isEditPayeeModalOpen, setEditPayeeModalOpen] = useState(false)
        const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
        const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

        const setDirty = (dirty) => {
                setIsDirty(dirty)
        }

        const {
                mutate: deletePayee,
                isPending: isDeletingPayee,
                reset: resetDelete
        } = useDeletePayee()
        const { mutate: updatePayee, isPending: isUpdatingPayee } = useUpdatePayee()

        const handleMenuOpen = (event, payeeData) => {
                setAnchorEl({ top: event.clientY, left: event.clientX })
                setSelectedPayee(payeeData)
        }

        const handleMenuClose = () => {
                setAnchorEl(null)
        }

        const openEditPayee = () => {
                setEditPayeeModalOpen(true)
                handleMenuClose()
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
                handleMenuClose()
                setDeleteModalOpen(true)
        }

        const closeDeleteModal = () => {
                setDeleteModalOpen(false)
                resetDelete()
        }

        const confirmDelete = () => {
                deletePayee(
                        { id: selectedPayee._id },
                        {
                                onSuccess: () => {
                                        closeDeleteModal()
                                }
                        }
                )
        }

        const handleToggleStatus = () => {
                handleMenuClose()
                setIsStatusModalOpen(true)
        }

        const confirmStatusChange = () => {
                const newStatus = selectedPayee.status === 'active' ? 'inactive' : 'active'
                const updatedPayee = {
                        name: selectedPayee.name,
                        email: selectedPayee._originalEmail,
                        phone: selectedPayee._originalPhone,
                        companyName: selectedPayee.companyName,
                        address: selectedPayee.address,
                        status: newStatus
                }
                updatePayee(
                        { id: selectedPayee._id, body: updatedPayee },
                        {
                                onSuccess: () => {
                                        setIsStatusModalOpen(false)
                                        refetch()
                                },
                                onError: (error) => {
                                        console.error('Error updating payee status:', error)
                                }
                        }
                )
        }

        const closeStatusModal = () => {
                setIsStatusModalOpen(false)
        }

        const handleSelectRow = (id, isMultiple = false, event) => {
                if (event && event.target.type === 'checkbox') {
                        if (isMultiple) {
                                setSelectedRows(id)
                        } else {
                                setSelectedRows((prev) => {
                                        if (prev.includes(id)) {
                                                return prev.filter((rowId) => rowId !== id)
                                        } else {
                                                return [...prev, id]
                                        }
                                })
                        }
                }
        }

        const handleSelectAll = (event) => {
                const checked = event.target.checked
                const currentData =
                        searchQuery || selectedStatuses.length > 0 ? filteredData : payees

                if (checked) {
                        setSelectedRows(currentData.map((item) => item._id))
                } else {
                        setSelectedRows([])
                }
        }

        // Get current data for checkbox calculations
        const currentTableData = React.useMemo(() => {
                return searchQuery || selectedStatuses.length > 0 ? filteredData : payees
        }, [searchQuery, selectedStatuses, filteredData, payees])

        const isAllSelected = React.useMemo(() => {
                return (
                        currentTableData.length > 0 &&
                        selectedRows.length > 0 &&
                        selectedRows.length === currentTableData.length &&
                        currentTableData.every((item) => selectedRows.includes(item._id))
                )
        }, [selectedRows, currentTableData])

        const isIndeterminate = React.useMemo(() => {
                return (
                        selectedRows.length > 0 && selectedRows.length < currentTableData.length
                )
        }, [selectedRows, currentTableData])

        const handleFilterClick = (event) => {
                setFilterAnchorEl(event.currentTarget)
        }

        const handleFilterClose = () => {
                setFilterAnchorEl(null)
        }

        const handleStatusFilterChange = (status) => {
                setSelectedStatuses((prev) => {
                        if (prev.includes(status)) {
                                return prev.filter((s) => s !== status)
                        } else {
                                return [...prev, status]
                        }
                })
        }

        React.useEffect(() => {
                let filtered = [...payees]

                if (selectedStatuses.length > 0) {
                        filtered = filtered.filter((payee) =>
                                selectedStatuses.includes(payee.status)
                        )
                }

                if (searchQuery.trim()) {
                        const query = searchQuery.toLowerCase().trim()
                        filtered = filtered.filter((payee) => {
                                return (
                                        payee.name?.toLowerCase().includes(query) ||
                                        payee.email?.toLowerCase().includes(query) ||
                                        payee.phone?.toLowerCase().includes(query) ||
                                        `${payee?.address?.addressLine1 || ''}, ${
                                                payee?.address?.addressLine2 || ''
                                        }`
                                                .toLowerCase()
                                                .includes(query)
                                )
                        })
                }

                setFilteredData(filtered)
        }, [payees, selectedStatuses, searchQuery])

        // Update selectedPayee when payees data refreshes
        React.useEffect(() => {
                if (selectedPayee?._id && payees.length > 0) {
                        const updatedPayee = payees.find(
                                (payee) => payee._id === selectedPayee._id
                        )
                        if (updatedPayee) {
                                setSelectedPayee(updatedPayee)
                        }
                }
        }, [payees, selectedPayee?._id])

        const columns = useMemo(() => {
                return getColumns(isSmallScreen)
        }, [isSmallScreen])

        const tableData = useMemo(() => {
                const dataToUse = currentTableData || []
                return makeTableData(dataToUse)
        }, [currentTableData])

        const renderHeaderCell = (column) => {
                if (column.id === 'checkbox') {
                        return (
                                <Checkbox
                                        checked={isAllSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAll}
                                        sx={{
                                                '&.MuiCheckbox-root': {
                                                        padding: '8px',
                                                        '&.Mui-checked': {
                                                                color: '#5EA479'
                                                        },
                                                        '&:hover': {
                                                                backgroundColor: '#1e3a5f29'
                                                        },
                                                        '& .MuiSvgIcon-root': {
                                                                width: '18px',
                                                                height: '18px'
                                                        }
                                                }
                                        }}
                                />
                        )
                }
                const label = (
                        <Typography
                                variant="subtitle2"
                                sx={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap'
                                }}
                        >
                                {column.label}
                        </Typography>
                )
                return (
                        <SortableHeaderLabel
                                column={column}
                                label={label}
                                sort={sort}
                                sortableColumnIds={SORTABLE_COLUMN_IDS}
                                onSortClick={handleSortClick}
                        />
                )
        }

        const handleTableScroll = React.useCallback(
                (atBottom) => {
                        if (atBottom && hasNextPage && !isFetchingNextPage) {
                                fetchNextPage()
                        }
                },
                [fetchNextPage, hasNextPage, isFetchingNextPage]
        )

        const renderCell = (row, column) => {
                const isSmallScreenCheck = isSmallScreen
                switch (column.id) {
                        case 'checkbox':
                                return (
                                        <Checkbox
                                                checked={selectedRows.includes(row._id)}
                                                onChange={(e) => {
                                                        handleSelectRow(row._id, false, e)
                                                }}
                                                sx={{
                                                        '&.MuiCheckbox-root': {
                                                                padding: '8px',
                                                                '&.Mui-checked': {
                                                                        color: '#5EA479'
                                                                },
                                                                '&:hover': {
                                                                        backgroundColor: '#1e3a5f29'
                                                                },
                                                                '& .MuiSvgIcon-root': {
                                                                        width: '18px',
                                                                        height: '18px'
                                                                }
                                                        }
                                                }}
                                        />
                                )
                        case 'status':
                                const statusType =
                                        row.status === STATUS_TYPES.ACTIVE.value
                                                ? STATUS_TYPES.ACTIVE
                                                : STATUS_TYPES.INACTIVE
                                return (
                                        <Box
                                                sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        overflow: 'visible'
                                                }}
                                        >
                                                <Typography
                                                        sx={{
                                                                ...statusType.styles,
                                                                color: statusType.styles.color + ' !important',
                                                                fontSize: isSmallScreenCheck ? '11px' : '12px',
                                                                textTransform: 'capitalize',
                                                                padding: isSmallScreenCheck ? '6px 12px' : '8px 16px',
                                                                width: isSmallScreenCheck ? '100px' : '110px',
                                                                minWidth: isSmallScreenCheck ? '100px' : '110px',
                                                                maxWidth: isSmallScreenCheck ? '100px' : '110px',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                        }}
                                                >
                                                        {row.status}
                                                </Typography>
                                        </Box>
                                )
                        case 'contextMenu':
                                return (
                                        <IconButton
                                                sx={styles.moreButton}
                                                onClick={(e) => handleMenuOpen(e, row)}
                                        >
                                                <MoreVerticalIcon />
                                        </IconButton>
                                )
                        case 'name':
                        case 'payeeAddress':
                        case 'email':
                        case 'phone':
                                return (
                                        <Typography
                                                sx={{
                                                        fontSize: '12px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        width: '100%',
                                                        textAlign: column.textAlign || 'left'
                                                }}
                                        >
                                                {row[column.id] || '-'}
                                        </Typography>
                                )
                        default:
                                return (
                                        <Typography
                                                sx={{
                                                        fontSize: '12px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        width: '100%'
                                                }}
                                        >
                                                {row[column.id]?.toString() || '-'}
                                        </Typography>
                                )
                }
        }

        const getRowStyle = (row) => {
                if (selectedRows.includes(row._id)) {
                        return {
                                backgroundColor: 'rgb(175 239 168 / 13%)'
                        }
                }
                return {}
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
                                <Box sx={styles.header}>
                                        <Typography sx={styles.title}>Payee List</Typography>

                                        <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={styles.description}
                                        >
                                                Manage all your payees with ease add, edit, or organize in one
                                                place.
                                        </Typography>
                                </Box>
                                <div className="generic-table-container">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                                        <ButtonComponent
                                                                text="Filter"
                                                                variant="light"
                                                                icon={<FilterIcon color="#1a3850" />}
                                                                type="button"
                                                                onClick={handleFilterClick}
                                                                iconPosition="right"
                                                                styles={{ ...styles.filterButton }}
                                                                isSmallScreen
                                                        />
                                                        <Menu
                                                                anchorEl={filterAnchorEl}
                                                                open={Boolean(filterAnchorEl)}
                                                                onClose={handleFilterClose}
                                                                anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'left'
                                                                }}
                                                                transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'left'
                                                                }}
                                                                sx={{
                                                                        '& .MuiPaper-root': {
                                                                                borderRadius: isSmallScreen ? '4px' : '8px',
                                                                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                                                                                minWidth: '100px',
                                                                                maxHeight: '400px',
                                                                                overflowY: 'auto',
                                                                                padding: '8px 0'
                                                                        }
                                                                }}
                                                        >
                                                                <Typography
                                                                        sx={{
                                                                                padding: '4px 16px',
                                                                                fontSize: '14px',
                                                                                fontWeight: 600,
                                                                                color: '#757575',
                                                                                borderBottom: '1px solid #e0e0e0',
                                                                                marginTop: '0px',
                                                                                marginBottom: '4px'
                                                                        }}
                                                                >
                                                                        Status
                                                                </Typography>
                                                                <MenuItem
                                                                        onClick={() => handleStatusFilterChange('active')}
                                                                        sx={{
                                                                                padding: '8px 16px',
                                                                                minHeight: 'auto'
                                                                        }}
                                                                >
                                                                        <Checkbox
                                                                                checked={selectedStatuses.includes('active')}
                                                                                sx={{
                                                                                        padding: '4px',
                                                                                        '&.Mui-checked': {
                                                                                                color: '#1976d2'
                                                                                        }
                                                                                }}
                                                                        />
                                                                        <Typography
                                                                                sx={{ fontSize: '14px', textTransform: 'capitalize' }}
                                                                        >
                                                                                Active
                                                                        </Typography>
                                                                </MenuItem>
                                                                <MenuItem
                                                                        onClick={() => handleStatusFilterChange('inactive')}
                                                                        sx={{
                                                                                padding: '8px 16px',
                                                                                minHeight: 'auto'
                                                                        }}
                                                                >
                                                                        <Checkbox
                                                                                checked={selectedStatuses.includes('inactive')}
                                                                                sx={{
                                                                                        padding: '4px',
                                                                                        '&.Mui-checked': {
                                                                                                color: '#1976d2'
                                                                                        }
                                                                                }}
                                                                        />
                                                                        <Typography
                                                                                sx={{ fontSize: '14px', textTransform: 'capitalize' }}
                                                                        >
                                                                                Inactive
                                                                        </Typography>
                                                                </MenuItem>
                                                        </Menu>
                                                        <TextField
                                                                placeholder="Search"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                size="small"
                                                                sx={{
                                                                        width: isSmallScreen ? '120px' : '189px',
                                                                        height: '40px',
                                                                        '& .MuiOutlinedInput-root': {
                                                                                height: '40px',
                                                                                backgroundColor: '#f5f7fa',
                                                                                borderRadius: isSmallScreen ? '6px' : '8px',
                                                                                padding: '10px 12px',
                                                                                gap: '8px',
                                                                                boxShadow: '0px 1px 2px 0px #1018280D',
                                                                                '& fieldset': {
                                                                                        borderColor: '#e2e8f0',
                                                                                        borderWidth: '1px'
                                                                                },
                                                                                '&:hover fieldset': {
                                                                                        borderColor: '#e2e8f0'
                                                                                },
                                                                                '&.Mui-focused fieldset': {
                                                                                        borderColor: '#e2e8f0'
                                                                                }
                                                                        }
                                                                }}
                                                                InputProps={{
                                                                        startAdornment: (
                                                                                <InputAdornment
                                                                                        position="start"
                                                                                        sx={{ marginRight: '1px' }}
                                                                                >
                                                                                        <SearchIcon sx={{ color: '#757575' }} />
                                                                                </InputAdornment>
                                                                        )
                                                                }}
                                                        />
                                                </div>
                                                <ButtonComponent
                                                        text="New Payee"
                                                        variant="dark"
                                                        icon={<AddOutlined />}
                                                        type="button"
                                                        onClick={openAddPayee}
                                                        iconPosition="left"
                                                        isSmallScreen
                                                />
                                        </div>
                                        {isLoading ? (
                                                <Box
                                                        sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minHeight: '400px',
                                                                width: '100%'
                                                        }}
                                                >
                                                        <Typography>Loading...</Typography>
                                                </Box>
                                        ) : (
                                                <>
                                                        <Box
                                                                sx={{
                                                                        border: '1px solid #e2e8f0',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden',
                                                                        width: '100%'
                                                                }}
                                                        >
                                                                <StickyCustomTable
                                                                        columns={columns}
                                                                        data={tableData}
                                                                        renderCell={renderCell}
                                                                        renderHeaderCell={renderHeaderCell}
                                                                        getRowStyle={getRowStyle}
                                                                        rowHeight={63}
                                                                        headerHeight={56}
                                                                        containerSx={{
                                                                                border: 'none',
                                                                                borderRadius: '0'
                                                                        }}
                                                                        headerRow={{
                                                                                borderBottom: '1px solid #e2e8f0',
                                                                                backgroundColor: '#F9FAFB'
                                                                        }}
                                                                        headerCellSx={() => ({
                                                                                px: { xs: '8px', md: '12px' },
                                                                                py: '12px'
                                                                        })}
                                                                        bodyRowSx={{
                                                                                '&:hover': {
                                                                                        backgroundColor: '#F9FAFB'
                                                                                }
                                                                        }}
                                                                        noDataAavailableText="No payees found"
                                                                        onScroll={handleTableScroll}
                                                                />
                                                        </Box>
                                                        {isFetchingNextPage && (
                                                                <Box
                                                                        sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                                py: 2,
                                                                                color: '#6B7280'
                                                                        }}
                                                                >
                                                                        <Typography variant="body2">
                                                                                Loading more payees...
                                                                        </Typography>
                                                                </Box>
                                                        )}
                                                </>
                                        )}
                                </div>
                        </div>

                        <FormModalMUI
                                title="Add New Payee"
                                open={isAddPayeeModalOpen}
                                maxWidth="sm"
                                onClose={() => closeAddPayee(false)}
                                styles={{
                                        title: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: '#111827',
                                                mb: 1,
                                                lineHeight: 1.2
                                        }
                                }}
                                hideDividers={true}
                        >
                                <AddPayee
                                        onClose={closeAddPayee}
                                        setDirty={setDirty}
                                        warning={showWarning}
                                        setWarning={setWarning}
                                        onError={() => {}}
                                />
                        </FormModalMUI>

                        {selectedPayee && (
                                <Menu
                                        anchorEl={!!anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        PaperProps={{
                                                sx: styles.menuPaper
                                        }}
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                                anchorEl ? { top: anchorEl.top, left: anchorEl.left } : undefined
                                        }
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                        <MenuItem onClick={openEditPayee} sx={{ ...styles.menuItem }}>
                                                <EditOutlined />
                                                Edit
                                        </MenuItem>
                                        {!selectedPayee?.inUse && (
                                                <MenuItem onClick={openDeleteModal} sx={{ ...styles.menuItem }}>
                                                        <DeleteOutlineOutlined />
                                                        Delete
                                                </MenuItem>
                                        )}
                                        <MenuItem onClick={handleToggleStatus} sx={{ ...styles.menuItem }}>
                                                <CheckBoxOutlined />
                                                {selectedPayee.status === STATUS_TYPES.ACTIVE.value
                                                        ? 'Deactivate'
                                                        : 'Activate'}
                                        </MenuItem>
                                </Menu>
                        )}

                        <AlertModal
                                open={isStatusModalOpen}
                                onClose={closeStatusModal}
                                onConfirm={confirmStatusChange}
                                title={
                                        selectedPayee?.status === STATUS_TYPES.ACTIVE.value
                                                ? 'Deactivate Payee?'
                                                : 'Activate Payee?'
                                }
                                description={
                                        selectedPayee?.status === STATUS_TYPES.ACTIVE.value
                                                ? 'Are you sure you want to deactivate this payee? They will no longer appear as active but their details will remain saved.'
                                                : 'Are you sure you want to activate this payee? They will now be available for use in transactions.'
                                }
                                confirmLabel={
                                        selectedPayee?.status === STATUS_TYPES.ACTIVE.value
                                                ? 'Deactivate'
                                                : 'Activate'
                                }
                                cancelLabel="Cancel"
                                type={
                                        selectedPayee?.status === STATUS_TYPES.ACTIVE.value
                                                ? 'deactivate_payee'
                                                : 'activate_payee'
                                }
                                icon={
                                        selectedPayee?.status === STATUS_TYPES.ACTIVE.value ? (
                                                <DeactivateWarningIcon />
                                        ) : (
                                                <ActivateConfirmationIcon />
                                        )
                                }
                        />

                        <AlertModal
                                open={isDeleteModalOpen}
                                onClose={closeDeleteModal}
                                onConfirm={confirmDelete}
                                title="Confirm Deletion?"
                                description={`Are you sure you want to delete payee with name: ${selectedPayee?.name}? This action cannot be undone.`}
                                confirmLabel="Delete"
                                cancelLabel="Cancel"
                                type="delete"
                        />

                        <FormModalMUI
                                title="Edit payee"
                                open={isEditPayeeModalOpen}
                                maxWidth="sm"
                                onClose={() => closeEditPayee(false)}
                                styles={{
                                        title: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: '#111827',
                                                mb: 0,
                                                lineHeight: 1.2
                                        }
                                }}
                                hideDividers={true}
                        >
                                <AddPayee
                                        onClose={closeEditPayee}
                                        isEdit={true}
                                        payeeData={selectedPayee}
                                        setDirty={setDirty}
                                        warning={showWarning}
                                        setWarning={setWarning}
                                />
                        </FormModalMUI>
                </>
        )
}

export default Payee

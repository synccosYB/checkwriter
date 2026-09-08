import React, { useMemo } from 'react'
import {
        Box,
        Typography,
        Button,
        Dialog,
        DialogTitle,
        DialogContent,
        DialogActions,
        useTheme,
        IconButton,
        TextField,
        InputAdornment,
        Pagination,
        PaginationItem,
        Popover,
        CircularProgress,
        Menu,
        MenuItem,
        Divider
} from '@mui/material'
import { useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CloseIcon from '@mui/icons-material/Close'

import SearchIcon from '@mui/icons-material/Search'
import { CustomTable } from '../../components/table/CustomTable'
import { CustomButton } from '../../components/buttons/CustomButton'
import { CustomSelect } from '../../components/inputs/CustomSelect'
import { styles } from './styles'
import useAllInfoUsers from '../../API/admin/useAllUserInfo'
import useActUser from '../../API/admin/useActUser'
import { useDispatch } from 'react-redux'
import useUserRoleUpdate from '../../API/admin/useUserRoleUpdate'
import { useDebounce } from '../../utils/hooks/useDebounce'
import {
        formatDate,
        formatUSD,
        getDaysUntilExpiration
} from '../../utils/helper'
import useGenerateStripePortalLink from '../../API/stripe/useGenerateStripePortalLink'
import { useHistory } from 'react-router-dom'
import { MyCookies } from '../../utils/cookies/Cookies'
import { updateSelectedOrganization } from '../../redux/appData'
import {
        DetailIcon,
        EditIcon,
        MoreVerticalIcon,
        TrailDaysIcon,
        UserIcon,
        FilterIcon
} from '../../components/Icons'
import LockResetIcon from '@mui/icons-material/LockReset'
import EmailIcon from '@mui/icons-material/Email'
import HistoryIcon from '@mui/icons-material/History'
import { MonthlyPriceModal } from './components/modals/MonthlyPriceModal'
import { FreeTrailDaysModal } from './components/modals/FreeTrailDaysModal'
import useResetPasswordForUser from '../../API/admin/useResetPasswordForUser'
import FilterMenu from './components/FilterMenu'
import { isEmpty, isMultiEmpty } from '../MyChecks/utils/helpers'
import useRefreshSubscription from '../../API/admin/refreshSuscription'
import { RefreshOutlined } from '@mui/icons-material'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import { StickyCustomTable } from '../../components/table/StickyCustomTable'
import {
        useColumnSort,
        SortableHeaderLabel
} from '../../components/table/sortableHeader'
import { AddUserModal } from './components/modals/addUserModal'
import SendEmailModal from './components/modals/SendEmailModal'
import MassEmailModal from './components/modals/MassEmailModal'
import MessageHistoryDrawer from './components/modals/MessageHistoryDrawer'
import useFullAccessOverride from '../../API/admin/useFullAccessOverride'

const roles = [
        { value: 'user', label: 'User' },
        { value: 'superadmin', label: 'Super Admin' }
]

export const getSubscriptionStatusColor = (status, theme) => {
        if (!status) return theme.palette.text.primary

        if (status.startsWith('Trial Ends')) {
                return '#1e3a5f'
        }

        if (status.startsWith('Cancel')) {
                return '#EF6C00'
        }

        if (status === 'No Subscription' || status === 'Past Due') {
                return '#B31F0D'
        }

        if (status === 'Active' || status === 'Manual Full Access') {
                return '#058205'
        }

        return theme.palette.text.primary
}

const UserManagement = () => {
        const dispatch = useDispatch()
        const history = useHistory()
        const theme = useTheme()
        const [addUserModalOpen, setAddUserModalOpen] = useState(false)
        const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null)
        const [filterList, setFilterList] = useState({
                multiFilter: { Status: [] },
                singleFilter: [],
                dateRange: ''
        })
        const [searchQuery, setSearchQuery] = useState('')
        const [selectedFilter, setSelectedFilter] = useState([])
        const debouncedSearch = useDebounce(searchQuery, 500)
        const [sortBy, setSortBy] = useState('')
        const [currentPage, setCurrentPage] = useState(1)

        const SORTABLE_COLUMN_IDS = useMemo(
                () =>
                        new Set([
                                'firstName',
                                'email',
                                'createdAt',
                                'lastLogin',
                                'role',
                                'subscriptionStatus',
                                'price'
                        ]),
                []
        )
        const { sort: columnSort, handleSortClick } =
                useColumnSort(SORTABLE_COLUMN_IDS)

        // Column-sort takes precedence over the legacy "Sort By" dropdown so
        // header clicks always control ordering when active.
        const effectiveSortBy = columnSort?.sortBy || sortBy
        const effectiveSortOrder = columnSort?.sortOrder || ''

        const {
                data,
                isLoading,
                hasPreviousPage,
                fetchNextPage,
                hasNextPage,
                isFetchingNextPage
        } = useAllInfoUsers(
                debouncedSearch,
                effectiveSortBy,
                filterList.multiFilter.Status.map((item) => item.value),
                filterList?.dateRange?.start || '',
                filterList?.dateRange?.end || '',
                effectiveSortOrder
        )

        const { mutate: refreshSuscription } = useRefreshSubscription()
        const { mutate: setFullAccessOverride, isPending: isUpdatingFullAccess } =
                useFullAccessOverride()
        const userData = useMemo(() => {
                if (data?.pages) {
                        return data.pages.flatMap((page) =>
                                (page?.users || []).map((user) => ({
                                        ...user,
                                        lastLogin: user?.lastLogin ? formatDate(user.lastLogin) : ''
                                }))
                        )
                }
                return []
        }, [data])

        const totalPages = data?.totalPages || 1

        const handleScroll = (atBottom) => {
                if (fetchNextPage && hasNextPage && !isFetchingNextPage && atBottom) {
                        fetchNextPage()
                }
        }

        const { mutate: actAsUser } = useActUser()
        const { mutate: useUpdateRole, isPending: isUserUpdating } =
                useUserRoleUpdate()

        const { mutate: getStripeUrl } = useGenerateStripePortalLink()

        const { mutate: resetUserPassword, isPending: isResettingPassword } =
                useResetPasswordForUser()

        const [openDialog, setOpenDialog] = useState(false)

        const [anchorEl, setAnchorEl] = useState(null)

        const [showFilterOptions, setShowFilterOptions] = useState(false)

        const [currentUser, setCurrentUser] = useState(null)

        const [tableAnchorEL, setTableAnchorEL] = useState(null)
        const [openEditMonthlyPrice, setOpenEditMonthlyPrice] = useState(false)
        const [openFreeTrailDays, setOpenFreeTrailDays] = useState(false)
        const [selectedUser, setSelectedUser] = useState(null)
        const [sendEmailModalOpen, setSendEmailModalOpen] = useState(false)
        const [massEmailModalOpen, setMassEmailModalOpen] = useState(false)
        const [messageHistoryOpen, setMessageHistoryOpen] = useState(false)
        const [emailTargetUser, setEmailTargetUser] = useState(null)
        const [fullAccessDialogOpen, setFullAccessDialogOpen] = useState(false)
        const [fullAccessReason, setFullAccessReason] = useState('')
        const handleRoleChange = (user, newRole) => {
                setCurrentUser({ ...user, role: newRole })
                setOpenDialog(true)
        }

        const handleActAsUser = (user) => {
                MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
                dispatch(updateSelectedOrganization(null))
                actAsUser(user._id)
        }

        const HandleConfirmRoleChange = () => {
                useUpdateRole(
                        { userId: currentUser?._id, role: currentUser?.role },
                        {
                                onSuccess: () => {
                                        handleCancelRoleChange()
                                }
                        }
                )
        }

        const handleCancelRoleChange = () => {
                setOpenDialog(false)
                setCurrentUser(null)
        }

        const handleFilterClose = () => {
                setAnchorEl(null)
        }

        const handleMenuOpen = (event, data) => {
                setTableAnchorEL({ top: event.clientY, left: event.clientX })
                setSelectedUser(data)
        }

        const handleSubscriptionNavigation = ({
                userId,
                isSubscribed,
                isTrial,
                stripeCustomerId
        }) => {
                if (!stripeCustomerId || (!isSubscribed && !isTrial)) {
                        history.push(`/subscription?userId=${userId}`)
                } else {
                        getStripeUrl(
                                { userId },
                                {
                                        onSuccess: (data) => {
                                                window.location.replace(data?.url)
                                        }
                                }
                        )
                }
        }

        const handleResetUserPassword = () => {
                resetUserPassword(
                        { id: selectedUser?._id },
                        {
                                onSuccess: () => {
                                        setTableAnchorEL(null)
                                }
                        }
                )
        }

        const renderCell = (row, column, isCurrentUser) => {
                switch (column.id) {
                        case 'firstName':
                                return `${row.firstName} ${row.lastName}`
                        case 'email':
                                return (
                                        <a href={`mailto:${row.email}`} style={{ color: '#1e3a5f' }}>
                                                {row.email}
                                        </a>
                                )
                        case 'role':
                                return (
                                        <CustomSelect
                                                value={row.role}
                                                onChange={(e) => handleRoleChange(row, e.target.value)}
                                                options={roles}
                                                size="small"
                                                color="primary"
                                                // disabled={isCurrentUser}
                                                sx={{ width: '120px' }}
                                        />
                                )
                        case 'actions':
                                return (
                                        <IconButton
                                                sx={styles.moreButton}
                                                onClick={(e) => handleMenuOpen(e, row)}
                                        >
                                                <MoreVerticalIcon />
                                        </IconButton>
                                )
                        case 'subscriptionStatus':
                                const statusColor = getSubscriptionStatusColor(
                                        row?.subscriptionInfo?.subscriptionStatusText,
                                        theme
                                )
                                return (
                                        <CustomButton
                                                size="small"
                                                sx={{
                                                        width: '200px',
                                                        color: statusColor,
                                                        backgroundColor: `${statusColor}0D`, // Lighten the background slightly
                                                        border: `1px solid ${statusColor}`,
                                                        '&:hover': {
                                                                backgroundColor: `${statusColor}1A`, // Darken background on hover
                                                                border: `1px solid ${statusColor}`
                                                        }
                                                }}
                                        >
                                                {row?.subscriptionInfo?.subscriptionStatusText}
                                        </CustomButton>
                                )

                        case 'createdAt':
                                const dateVal = row?.createdAt;
                                if (!dateVal) return '';
                                try {
                                        const d = new Date(dateVal);
                                        if (isNaN(d.getTime())) return String(dateVal);
                                        return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                } catch { return String(dateVal); }
                        case 'lastLogin':
                                const loginVal = row?.lastLogin;
                                if (!loginVal) return '';
                                try {
                                        const d2 = new Date(loginVal);
                                        if (isNaN(d2.getTime())) return String(loginVal);
                                        return d2.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                } catch { return String(loginVal); }
                        case 'price':
                                const priceVal = row?.subscriptionInfo?.price;
                                return (
                                        <Box sx={{ ...styles.actionTableContainer, gap: 0 }}>
                                                <Typography sx={styles.monthlyPriceText}>
                                                        {priceVal != null && !isNaN(priceVal) ? formatUSD(priceVal) : '$0.00'}
                                                </Typography>
                                                <IconButton
                                                        hidden={!row?.subscriptionInfo?.subscriptionId}
                                                        onClick={() => {
                                                                setSelectedUser(row)
                                                                setOpenEditMonthlyPrice(true)
                                                        }}
                                                >
                                                        <EditIcon width="12px" height="12px" />
                                                </IconButton>
                                        </Box>
                                )

                        case 'email':
                                return (
                                        <Typography
                                                sx={{ textDecoration: 'underline' }}
                                                onClick={() => {
                                                        if (row?.email) window.location.href = `mailto:${row?.email}`
                                                }}
                                                role="button"
                                                variant="caption"
                                        >
                                                {row?.email}
                                        </Typography>
                                )
                        default:
                                return row[column.id]
                }
        }

        const Search = (e) => {
                setSearchQuery(e.target.value)
        }

        const SortBy = (e) => {
                setSortBy(e.target.value)
        }

        const handlePagination = (value) => {
                setCurrentPage(value)
        }

        const handleMultiFilterClose = (key, lable) => {
                setFilterList({
                        ...filterList,
                        multiFilter: {
                                ...filterList.multiFilter,
                                [key]: filterList.multiFilter[key].filter((val) => val !== lable)
                        }
                })
                setCurrentPage(1)
        }

        const resetFilters = () => {
                setFilterList({
                        singleFilter: [],
                        multiFilter: { Status: [] },
                        dateRange: ''
                })
                setSortBy('')
                setSearchQuery('')
                setSelectedFilter([])
                setCurrentPage(1)
        }
        return (
                <Box>
                        <Box>
                                <Typography sx={styles.title}>User Management</Typography>
                                <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={styles.description}
                                >
                                        Manage roles, subscriptions and access with ease. Track logins, assign
                                        roles and securely impersonate user data for support.
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}></Box>
                        </Box>

                        <Box sx={styles.actionContainer}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TextField
                                                value={searchQuery}
                                                placeholder="Search"
                                                onChange={(e) => Search(e)}
                                                sx={styles.searchField}
                                                InputProps={{
                                                        startAdornment: (
                                                                <InputAdornment
                                                                        position="start"
                                                                        sx={styles.searchIconContainer}
                                                                >
                                                                        <SearchIcon sx={styles.searchIcon} />
                                                                </InputAdornment>
                                                        )
                                                }}
                                        />
                                        <Typography>User Count: {data?.totalRecords}</Typography>
                                </Box>

                                <Box sx={styles.actionButtons}>
                                        <CustomButton
                                                onClick={() => {
                                                        setAddUserModalOpen(true)
                                                }}
                                        >
                                                Add User
                                        </CustomButton>
                                        <CustomButton
                                                variant="outlined"
                                                onClick={() => setMassEmailModalOpen(true)}
                                        >
                                                Send Mass Email
                                        </CustomButton>
                                        <CustomButton
                                                variant="outlined"
                                                onClick={() => {
                                                        refreshSuscription({ updateAll: true })
                                                }}
                                        >
                                                Refresh Subscriptions
                                        </CustomButton>
                                        <Box display={'flex'} alignItems={'center'} gap={1}>
                                                <Typography>Sort By: </Typography>
                                                <CustomSelect
                                                        value={sortBy}
                                                        onChange={(e) => SortBy(e)}
                                                        options={[
                                                                { value: '', label: 'Select Values' },
                                                                { value: 'recent', label: 'Recent' },
                                                                { value: 'name', label: 'Name' },
                                                                { value: 'email', label: 'Email' }
                                                        ]}
                                                />
                                        </Box>

                                        <CustomButton
                                                variant="outlined"
                                                endIcon={<FilterIcon color="#1a3850" />}
                                                color="secondary"
                                                onClick={(e) => setFilterMenuAnchorEl(e.currentTarget)}
                                        >
                                                Filter
                                        </CustomButton>
                                        <FilterMenu
                                                anchorEl={filterMenuAnchorEl}
                                                setAnchorEl={setFilterMenuAnchorEl}
                                                setFilterList={setFilterList}
                                                filterList={filterList}
                                                setPage={setCurrentPage}
                                        />

                                        <Popover
                                                open={Boolean(anchorEl)}
                                                anchorEl={anchorEl}
                                                onClose={handleFilterClose}
                                                anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'right'
                                                }}
                                                transformOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right'
                                                }}
                                                PaperProps={{
                                                        sx: styles.popoverPaper
                                                }}
                                        >
                                                <Box sx={styles.filterHeader}>
                                                        <Typography sx={styles.filterTitle}>Filters</Typography>
                                                        <IconButton onClick={handleFilterClose} sx={styles.closeButton}>
                                                                <CloseIcon sx={{ fontSize: '20px' }} />
                                                        </IconButton>
                                                </Box>

                                                <Box sx={styles.filterContent}>
                                                        <Box
                                                                onClick={() => setShowFilterOptions(!showFilterOptions)}
                                                                sx={styles.filterOption}
                                                        >
                                                                <Typography sx={styles.filterOptionText}>
                                                                        {selectedFilter.length > 0
                                                                                ? selectedFilter.map((item) => item.label).join(', ')
                                                                                : 'Subscription Status'}
                                                                </Typography>
                                                                <KeyboardArrowDownIcon
                                                                        sx={{
                                                                                ...styles.filterArrow,
                                                                                transform: showFilterOptions ? 'rotate(180deg)' : 'none'
                                                                        }}
                                                                />
                                                        </Box>

                                                        {showFilterOptions && (
                                                                <Box sx={styles.filterOptionsContainer}>
                                                                        {[
                                                                                { value: 'none', label: 'None' },
                                                                                { value: 'trialing', label: 'Trialing' },
                                                                                { value: 'active', label: 'Active' },
                                                                                { value: 'unpaid', label: 'Unpaid' },
                                                                                { value: 'canceled', label: 'Canceled' },
                                                                                { value: 'expired', label: 'Expired' },
                                                                                { value: 'past_due', label: 'Past due' }
                                                                        ].map((option) => (
                                                                                <Box
                                                                                        key={option.value}
                                                                                        onClick={() => {
                                                                                                if (
                                                                                                        selectedFilter.some(
                                                                                                                (item) => item.value === option.value
                                                                                                        )
                                                                                                ) {
                                                                                                        setSelectedFilter(
                                                                                                                selectedFilter.filter(
                                                                                                                        (item) => item.value !== option.value
                                                                                                                )
                                                                                                        )
                                                                                                } else {
                                                                                                        setSelectedFilter([...selectedFilter, option])
                                                                                                }
                                                                                        }}
                                                                                        sx={{
                                                                                                ...styles.filterOptionItem,
                                                                                                color:
                                                                                                        selectedFilter === option.value
                                                                                                                ? '#9CA3AF'
                                                                                                                : '#111827'
                                                                                        }}
                                                                                >
                                                                                        {option.label}
                                                                                </Box>
                                                                        ))}
                                                                </Box>
                                                        )}
                                                </Box>
                                        </Popover>
                                </Box>
                        </Box>

                        {((!isEmpty(filterList.multiFilter) &&
                                !isMultiEmpty(filterList.multiFilter)) ||
                                (filterList?.dateRange?.start && filterList?.dateRange?.end)) && (
                                <>
                                        <Divider />

                                        <Box sx={styles.filterContainer}>
                                                {/* Multi-filter chips */}
                                                {Object.keys(filterList.multiFilter).map((key) =>
                                                        filterList.multiFilter[key].map((val) => (
                                                                <Box
                                                                        key={`${key}-${val.value ?? val.labelValue}`}
                                                                        sx={styles.filterItemContainer}
                                                                >
                                                                        <Typography sx={styles.filterlableTitle}>
                                                                                {val.label}:
                                                                                <Typography
                                                                                        sx={{ color: '#e2e8f0', ml: '4px', fontSize: '12px' }}
                                                                                >
                                                                                        {val.labelValue}
                                                                                </Typography>
                                                                        </Typography>
                                                                        <CloseIcon
                                                                                onClick={() => handleMultiFilterClose(key, val)}
                                                                                sx={styles.filterCloseIcon}
                                                                        />
                                                                </Box>
                                                        ))
                                                )}

                                                {/* Date-range chip */}
                                                {filterList?.dateRange?.start && filterList?.dateRange?.end && (
                                                        <Box sx={styles.filterItemContainer} key="date-range-chip">
                                                                <Typography sx={styles.filterlableTitle}>
                                                                        {filterList.dateRange.label || 'Date'}:
                                                                        <Typography
                                                                                sx={{ color: '#e2e8f0', ml: '4px', fontSize: '12px' }}
                                                                        >
                                                                                {filterList.dateRange.start} - {filterList.dateRange.end}
                                                                        </Typography>
                                                                </Typography>
                                                                <CloseIcon
                                                                        onClick={() => {
                                                                                setFilterList((prev) => ({ ...prev, dateRange: '' }))
                                                                                setCurrentPage(1)
                                                                        }}
                                                                        sx={styles.filterCloseIcon}
                                                                />
                                                        </Box>
                                                )}

                                                <Button
                                                        variant="outlined"
                                                        sx={styles.resetButton}
                                                        onClick={resetFilters}
                                                >
                                                        Reset
                                                </Button>
                                        </Box>
                                </>
                        )}

                        {isLoading ? (
                                <Box display={'flex'} justifyContent={'center'} my={12}>
                                        <CircularProgress size={48} />
                                </Box>
                        ) : (
                                <StickyCustomTable
                                        columns={[
                                                { id: 'firstName', label: 'Name', width: '180px' },
                                                { id: 'email', label: 'Email', width: '220px' },
                                                {
                                                        id: 'subscriptionStatus',
                                                        label: 'Subscription Status',
                                                        width: '200px'
                                                },
                                                { id: 'createdAt', label: 'Date Registered', width: '140px' },
                                                { id: 'price', label: 'Subscription Price', width: '140px' },
                                                { id: 'lastLogin', label: 'Last Login', width: '140px' },
                                                { id: 'role', label: 'Roles', width: '120px' },
                                                { id: 'actions', label: 'Actions', width: '120px' }
                                        ]}
                                        data={userData}
                                        renderCell={renderCell}
                                        renderHeaderCell={(column) => (
                                                <SortableHeaderLabel
                                                        column={column}
                                                        label={column.label}
                                                        sort={columnSort}
                                                        sortableColumnIds={SORTABLE_COLUMN_IDS}
                                                        onSortClick={handleSortClick}
                                                />
                                        )}
                                        uniqueIdentifier={'_id'}
                                        isCenteredCells
                                        onScroll={handleScroll}
                                />
                        )}
                        {userData.length > 0 && (
                                <Typography sx={{ color: '#849098', mt: '32px', marginLeft: '5px' }}>
                                        1 to {userData.length} of {data?.pages[0].totalRecords}{' '}
                                </Typography>
                        )}
                        <Menu
                                anchorEl={!!tableAnchorEL}
                                open={Boolean(tableAnchorEL)}
                                onClose={() => setTableAnchorEL(null)}
                                PaperProps={{
                                        sx: styles.menuPaper
                                }}
                                anchorReference="anchorPosition"
                                anchorPosition={
                                        tableAnchorEL
                                                ? { top: tableAnchorEL.top, left: tableAnchorEL.left }
                                                : undefined
                                }
                                // you can keep transform/anchor origins if you like:
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                                <MenuItem
                                        onClick={() => {
                                                handleActAsUser(selectedUser)
                                                setTableAnchorEL(null)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <UserIcon />
                                        Act As User
                                </MenuItem>
                                <MenuItem
                                        hidden={!selectedUser?.subscriptionInfo?.subscriptionId}
                                        onClick={() => {
                                                setTableAnchorEL(null)
                                                setOpenEditMonthlyPrice(true)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <EditIcon />
                                        Edit Price
                                </MenuItem>
                                <MenuItem
                                        hidden={!selectedUser?.subscriptionInfo?.subscriptionId}
                                        onClick={() => {
                                                setTableAnchorEL(null)
                                                setOpenFreeTrailDays(true)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <TrailDaysIcon />
                                        Edit Trail days
                                </MenuItem>
                                <MenuItem
                                        onClick={() => {
                                                handleSubscriptionNavigation({
                                                        userId: selectedUser?._id,
                                                        isSubscribed: selectedUser?.subscriptionInfo?.isSubscribed,
                                                        isTrial: selectedUser?.subscriptionInfo?.isTrialPeriod,
                                                        stripeCustomerId:
                                                                selectedUser?.subscriptionInfo?.stripeCustomerId
                                                })
                                                setTableAnchorEL(null)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <DetailIcon />
                                        {!selectedUser?.subscriptionInfo?.stripeCustomerId
                                                ? 'Start Trial'
                                                : 'Manage Subscription'}
                                </MenuItem>
                                <MenuItem
                                        onClick={() => {
                                                refreshSuscription({ userId: selectedUser?._id })
                                                setTableAnchorEL(null)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <RefreshOutlined sx={{ width: '18px' }} />
                                        Refresh Subscription
                                </MenuItem>
                                <MenuItem
                                        onClick={() => {
                                                setFullAccessReason('')
                                                setFullAccessDialogOpen(true)
                                                setTableAnchorEL(null)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <VpnKeyOutlinedIcon sx={{ width: '18px' }} />
                                        {selectedUser?.subscriptionInfo?.hasFullAccessOverride
                                                ? 'Disable Manual Access'
                                                : 'Grant Manual Access'}
                                </MenuItem>
                                <MenuItem onClick={handleResetUserPassword} sx={styles.menuItem}>
                                        <LockResetIcon sx={{ width: '18px' }} /> Reset Password
                                        {isResettingPassword && <CircularProgress size={'14px'} />}
                                </MenuItem>
                                <MenuItem
                                        onClick={() => {
                                                setEmailTargetUser(selectedUser)
                                                setSendEmailModalOpen(true)
                                                setTableAnchorEL(null)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <EmailIcon sx={{ width: '18px' }} /> Send Email
                                </MenuItem>
                                <MenuItem
                                        onClick={() => {
                                                setEmailTargetUser(selectedUser)
                                                setMessageHistoryOpen(true)
                                                setTableAnchorEL(null)
                                        }}
                                        sx={styles.menuItem}
                                >
                                        <HistoryIcon sx={{ width: '18px' }} /> Email History
                                </MenuItem>
                        </Menu>

                        {openEditMonthlyPrice && (
                                <MonthlyPriceModal
                                        open={openEditMonthlyPrice}
                                        onClose={() => setOpenEditMonthlyPrice(false)}
                                        user={selectedUser}
                                />
                        )}

                        {openFreeTrailDays && (
                                <FreeTrailDaysModal
                                        open={openFreeTrailDays}
                                        onClose={() => setOpenFreeTrailDays(false)}
                                        user={selectedUser}
                                />
                        )}
                        {addUserModalOpen && (
                                <AddUserModal
                                        open={addUserModalOpen}
                                        onClose={() => setAddUserModalOpen(false)}
                                />
                        )}

                        {massEmailModalOpen && (
                                <MassEmailModal
                                        open={massEmailModalOpen}
                                        onClose={() => setMassEmailModalOpen(false)}
                                        totalUserCount={data?.totalRecords}
                                />
                        )}

                        {sendEmailModalOpen && emailTargetUser && (
                                <SendEmailModal
                                        open={sendEmailModalOpen}
                                        onClose={() => {
                                                setSendEmailModalOpen(false)
                                                setEmailTargetUser(null)
                                        }}
                                        user={emailTargetUser}
                                />
                        )}

                        {messageHistoryOpen && emailTargetUser && (
                                <MessageHistoryDrawer
                                        open={messageHistoryOpen}
                                        onClose={() => {
                                                setMessageHistoryOpen(false)
                                                setEmailTargetUser(null)
                                        }}
                                        user={emailTargetUser}
                                />
                        )}

                        <Dialog
                                open={fullAccessDialogOpen}
                                onClose={() => !isUpdatingFullAccess && setFullAccessDialogOpen(false)}
                                fullWidth
                                maxWidth="sm"
                        >
                                <DialogTitle>
                                        {selectedUser?.subscriptionInfo?.hasFullAccessOverride
                                                ? 'Disable Manual Full Access'
                                                : 'Grant Manual Full Access'}
                                </DialogTitle>
                                <DialogContent>
                                        <Typography sx={{ mb: 2 }}>
                                                Billing in Stripe will not be changed.{' '}
                                                {selectedUser?.subscriptionInfo?.hasFullAccessOverride
                                                        ? 'The user will immediately return to their actual Stripe or trial access.'
                                                        : 'The user will immediately receive full subscription access.'}
                                        </Typography>
                                        <Typography sx={{ mb: 2, fontWeight: 600 }}>
                                                Current status: {selectedUser?.subscriptionInfo?.subscriptionStatusText}
                                        </Typography>
                                        <TextField
                                                autoFocus
                                                fullWidth
                                                required
                                                multiline
                                                minRows={3}
                                                label="Reason"
                                                value={fullAccessReason}
                                                onChange={(event) => setFullAccessReason(event.target.value)}
                                        />
                                </DialogContent>
                                <DialogActions>
                                        <Button
                                                onClick={() => setFullAccessDialogOpen(false)}
                                                disabled={isUpdatingFullAccess}
                                        >
                                                Cancel
                                        </Button>
                                        <Button
                                                variant="contained"
                                                disabled={!fullAccessReason.trim() || isUpdatingFullAccess}
                                                onClick={() =>
                                                        setFullAccessOverride(
                                                                {
                                                                        userId: selectedUser?._id,
                                                                        enabled: !selectedUser?.subscriptionInfo?.hasFullAccessOverride,
                                                                        reason: fullAccessReason
                                                                },
                                                                {
                                                                        onSuccess: () => {
                                                                                setFullAccessDialogOpen(false)
                                                                                setFullAccessReason('')
                                                                        }
                                                                }
                                                        )
                                                }
                                        >
                                                Confirm
                                        </Button>
                                </DialogActions>
                        </Dialog>

                        <Dialog
                                open={openDialog}
                                onClose={() => setOpenDialog(false)}
                                PaperProps={{
                                        sx: styles.dialog
                                }}
                        >
                                <Box sx={styles.dialogHeader}>
                                        <DialogTitle sx={styles.dialogTitle}>Confirm Role Change</DialogTitle>
                                        <IconButton
                                                onClick={() => setOpenDialog(false)}
                                                sx={styles.dialogCloseButton}
                                        >
                                                <CloseIcon />
                                        </IconButton>
                                </Box>
                                <DialogContent sx={{ p: 0 }}>
                                        <Typography sx={styles.dialogContent}>
                                                You are about to change the role of{' '}
                                                <Box component="span" sx={{ fontWeight: 700 }}>
                                                        {currentUser?.firstName}
                                                </Box>{' '}
                                                to{' '}
                                                <Box component="span" sx={{ fontWeight: 700 }}>
                                                        {currentUser?.role}
                                                </Box>
                                                . This action will update their access permissions immediately. Are
                                                you sure you want to proceed?
                                        </Typography>
                                </DialogContent>
                                <DialogActions sx={styles.dialogActions}>
                                        <Button
                                                onClick={handleCancelRoleChange}
                                                variant="outlined"
                                                sx={styles.cancelButton}
                                        >
                                                Cancel
                                        </Button>
                                        <Button
                                                disabled={isUserUpdating}
                                                onClick={HandleConfirmRoleChange}
                                                variant="contained"
                                                sx={styles.confirmButton}
                                                endIcon={isUserUpdating && <CircularProgress size={'14px'} />}
                                        >
                                                Confirm
                                        </Button>
                                </DialogActions>
                        </Dialog>
                </Box>
        )
}

export default UserManagement

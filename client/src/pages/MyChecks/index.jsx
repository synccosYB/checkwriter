import {
        Box,
        Typography,
        TextField,
        InputAdornment,
        Checkbox,
        Menu,
        MenuItem,
        IconButton,
        Button,
        Select,
        Tooltip,
        Divider,
        CircularProgress,
        Fade,
        Paper,
        Popper
} from '@mui/material'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { CustomButton } from '../../components/buttons/CustomButton'
//Mui-icons
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import {
        FilterIcon,
        MailboxIcon,
        MoreVerticalIcon,
        SearchIcon,
        EditIcon,
        EEmailIcon,
        CheckDeleteIcon,
        PrintIcon,
        VoiceIcon,
        DetailIcon,
        ClearedIcon,
        ImportIcon,
        QuickbooksSidebarIcon
} from '../../components/Icons'
import CloseIcon from '@mui/icons-material/Close'
import { styles } from './styles'
import {
        EmailCheckModal,
        RestrictModal,
        DetailModal,
        AlertModal,
        AddModal,
        GeneratingCheckModal,
        BlankCheckModal,
        EditModal,
        AttachmentsModal
} from './components/modals'
import { ShippingRatesModal } from './components/modals/ShippingRatesModal'
import FilterMenu from './components/FilterMenu'
import useUpdateCheck from '../../API/checks/useUpdateCheck'
import useDeleteCheck from '../../API/checks/useDeleteCheck'
import dayjs from 'dayjs'
import {
        mapFiltersToQueryParams,
        statusMap
} from './utils/mapFiltersToQueryParams'
import { getStatusColor, getStatusText } from './utils/getStatusColor'
import { isEmpty, isMultiEmpty } from './utils/helpers'
import usePrintMultipleChecksDownload from '../../API/checks/usePrintMultipleChecksDownload'
import {
        useLocation,
        useHistory
} from 'react-router-dom/cjs/react-router-dom.min'
import { downloadFromUrl } from '../../utils/helpers/downloadFromUrl'
import { CHECK_PERMISSIONS, CHECK_STATUS } from '../../types/check.types'
import useTags from '../../API/tags/useTags'
import TagViewer from './components/TagViewer'
import useCheckUserScubscriptions from '../../API/users/useCheckUserScubscriptions'
import DownloadIcon from '@mui/icons-material/Download'
import useExportChecksAsCsv from '../../API/checks/useExportChecksAsCsv'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import LinkIcon from '@mui/icons-material/Link'
import { AttachmentItem } from './components/AttachmentItem'
import { useUploadAttachments } from '../../API/attachments/useUploadAttachments'
import { EntityType } from '../../types/attachment.types'
import { useDeleteAttachments } from '../../API/attachments/useDeleteAttachments'
import { useUpdateAttachmentDescriptions } from '../../API/attachments/useUpdateAttachmentDescriptions'
import { queryClient } from '../..'
import useBulkVoidChecks from '../../API/checks/useBulkVoidChecks'
import usePrintMultipleBlankChecksDownload from '../../API/checks/userPrintMultipleBlankCheckDownload'
import useUserInfo from '../../API/users/useUserInfo'
import { EXCEED_TRIAL_LIMIT_WARNING } from './utils/constant'
import { useInfiniteChecks } from '../../API/checks/useInfiniteChecks'
import { StickyCustomTable } from '../../components/table/StickyCustomTable'
import { ImportFilesModal } from './components/modals/importFilesModal'
import { useDebounce } from '../../utils/hooks/useDebounce'
import { formatUSD } from '../../utils/helper'

const pageSize = 25

export const ALERT_TYPE = {
        PRINT: 'print',
        DELETE: 'delete',
        VOID: 'void',
        CLEARED: 'cleared',
        UNSAVED: 'unsaved',
        DOWNLOAD_CHECK: 'downloadCheck'
}

const SHOULD_DISABLE_MAILING = JSON.parse(
        process.env.REACT_APP_DISABLE_CHECK_MAILING || false
)

const getCheckIds = (selectedChecks = [], selectedItem = null) => {
        if (selectedChecks.length > 0) {
                return selectedChecks.map((check) => check._id)
        }
        return selectedItem?._id ? [selectedItem._id] : []
}

export const getCheckIdsForPrint = (
        selectedChecks = [],
        selectedItem = null
) => {
        const result = {
                checkIds: [],
                isBlankCheck: false
        }

        if (selectedChecks.length > 0) {
                const nonBlankChecks = selectedChecks.every((x) => !x.isBlankCheck)
                const blankChecks = selectedChecks.every((x) => x.isBlankCheck)
                if (nonBlankChecks) {
                        result.checkIds = selectedChecks.map((check) => check._id)
                        result.isBlankCheck = false
                } else if (blankChecks) {
                        result.checkIds = selectedChecks.map((check) => check._id)
                        result.isBlankCheck = true
                } else {
                        return result
                }
        }
        if (selectedItem?._id) {
                result.checkIds.push(selectedItem._id)
                result.isBlankCheck = selectedItem.isBlankCheck || false
        }
        return result
}

const isOperationAllowed = (checks, operation) => {
        if (!checks || checks.length === 0) return false
        if (!operation) return false
        return checks.every((x) => x?.permissions?.[operation])
}

const MyChecks = () => {
        const location = useLocation()
        const history = useHistory()
        const { data: tagsRaw } = useTags()
        const tags = Array.isArray(tagsRaw) ? tagsRaw : []
        const { data: userSubscription } = useCheckUserScubscriptions()

        const [selectedChecks, setSelectedChecks] = useState([])
        const [isCheckedAll, setIsCheckedAll] = useState(false)
        const [openShippingDialog, setOpenShippingDialog] = useState(false)
        const [openRestrictDialog, setOpenRestrictDialog] = useState(false)
        const [openDetailDialog, setOpenDetailDialog] = useState(false)
        const [openAlertDialog, setOpenAlertDialog] = useState(false)
        const [alertType, setAlertType] = useState(null)
        const [page, setPage] = useState(1)
        const [anchorEl, setAnchorEl] = useState(null)
        const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null)
        const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null)
        const [selectedItem, setSelectedItem] = useState(null)
        const [openAddDialog, setOpenAddDialog] = useState(false)
        const [openGeneratingCheckDialog, setOpenGeneratingCheckDialog] =
                useState(false)
        const [openEmailCheckDialog, setOpenEmailCheckDialog] = useState(false)
        const [openBlankCheckDialog, setOpenBlankCheckDialog] = useState(false)
        const [openEditDialog, setOpenEditDialog] = useState(false)
        const [search, setSearch] = useState('')
        const debouncedSearch = useDebounce(search, 500)
        const [alertDialogValue, setAlertDialogValue] = useState('')
        const [selectedAttachments, setSelectedAttachments] = useState()
        const [attachmentAnchorEL, setAttachmentAnchorEL] = useState(null)
        const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false)
        const [attachmentLoading, setAttachmentLoading] = useState(false)
        const { data: userInfo } = useUserInfo()
        const disableEmailButton = useMemo(
                () => new Set(selectedChecks.map((item) => item.payee?._id)).size !== 1,
                [selectedChecks]
        )
        const [openImportFilesModal, setOpenImportFilesModal] = useState(false)

        const [filterList, setFilterList] = useState({
                singleFilter: [],
                multiFilter: {},
                dateRange: ''
        })
        const removeQueryParams = useCallback(() => {
                const query = new URLSearchParams(location.search)
                if (query.has('create')) {
                        query.delete('create')
                        history.replace({
                                search: query.toString()
                        })
                }
                if (query.has('status')) {
                        query.delete('status')
                        history.replace({
                                search: query.toString()
                        })
                }
        }, [history, location.search])

        const SORTABLE_COLUMN_IDS = useMemo(
                () =>
                        new Set([
                                'checkNumber',
                                'status',
                                'amount',
                                'payeeName',
                                'issuedDate',
                                'accountNickname',
                                'tags'
                        ]),
                []
        )

        // Active sort for the MyChecks table. `null` means "use the server's
        // default ordering" (newest first). Toggling a header cycles
        // null -> desc -> asc -> null on that column. The chosen sort is
        // persisted in the URL query string (so it survives reloads and can
        // be shared via the page URL) and mirrored to localStorage (so it is
        // restored when the user returns to the page via a route that does
        // not carry query params, e.g. a sidebar link).
        const SORT_STORAGE_KEY = 'myChecks.sort'
        const [sort, setSort] = useState(() => {
                const query = new URLSearchParams(location.search)
                const sortBy = query.get('sortBy')
                const sortOrder = query.get('sortOrder')
                if (
                        sortBy &&
                        SORTABLE_COLUMN_IDS.has(sortBy) &&
                        (sortOrder === 'asc' || sortOrder === 'desc')
                ) {
                        return { sortBy, sortOrder }
                }
                try {
                        const raw = window.localStorage.getItem(SORT_STORAGE_KEY)
                        if (raw) {
                                const parsed = JSON.parse(raw)
                                if (
                                        parsed &&
                                        SORTABLE_COLUMN_IDS.has(parsed.sortBy) &&
                                        (parsed.sortOrder === 'asc' || parsed.sortOrder === 'desc')
                                ) {
                                        return { sortBy: parsed.sortBy, sortOrder: parsed.sortOrder }
                                }
                        }
                } catch (e) {
                        // ignore storage access / parse errors
                }
                return null
        })

        const queryParams = useMemo(() => {
                return mapFiltersToQueryParams(filterList, sort)
        }, [filterList, sort])

        useEffect(() => {
                const query = new URLSearchParams(location.search)
                const currentSortBy = query.get('sortBy')
                const currentSortOrder = query.get('sortOrder')
                const nextSortBy = sort?.sortBy || null
                const nextSortOrder = sort?.sortOrder || null
                if (
                        currentSortBy === nextSortBy &&
                        currentSortOrder === nextSortOrder
                ) {
                        return
                }
                if (nextSortBy && nextSortOrder) {
                        query.set('sortBy', nextSortBy)
                        query.set('sortOrder', nextSortOrder)
                } else {
                        query.delete('sortBy')
                        query.delete('sortOrder')
                }
                history.replace({
                        pathname: location.pathname,
                        search: query.toString()
                })
                try {
                        if (nextSortBy && nextSortOrder) {
                                window.localStorage.setItem(
                                        SORT_STORAGE_KEY,
                                        JSON.stringify({ sortBy: nextSortBy, sortOrder: nextSortOrder })
                                )
                        } else {
                                window.localStorage.removeItem(SORT_STORAGE_KEY)
                        }
                } catch (e) {
                        // ignore storage access errors
                }
        }, [sort, history, location.pathname, location.search])

        const handleSortClick = useCallback((columnId) => {
                if (!SORTABLE_COLUMN_IDS.has(columnId)) return
                setSort((prev) => {
                        if (!prev || prev.sortBy !== columnId) {
                                return { sortBy: columnId, sortOrder: 'desc' }
                        }
                        if (prev.sortOrder === 'desc') {
                                return { sortBy: columnId, sortOrder: 'asc' }
                        }
                        return null
                })
        }, [SORTABLE_COLUMN_IDS])

        useEffect(() => {
                const query = new URLSearchParams(location.search)
                const status = query.get('status')
                if (query.get('create') === 'true') {
                        setOpenAddDialog(true)
                }
                if (statusMap[status]) {
                        setFilterList((prev) => {
                                if (prev.singleFilter.includes(status)) return prev
                                return {
                                        ...prev,
                                        singleFilter: [...prev.singleFilter, status]
                                }
                        })
                        removeQueryParams()
                }
        }, [location.search])

        useEffect(() => {
                return () => {
                        queryClient.removeQueries(['checks'])
                }
        }, [])

        useEffect(() => {
                if (!attachmentAnchorEL) return
                const timer = window.setTimeout(() => {
                        setAttachmentAnchorEL(null)
                }, 1200)
                return () => clearTimeout(timer)
        }, [attachmentAnchorEL])

        const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
                useInfiniteChecks({
                        pageSize,
                        extraParams: queryParams,
                        searchParam: debouncedSearch
                })
        const { mutate: exportChecksAsCsv, isPending: isExportingChecks } =
                useExportChecksAsCsv({
                        extraParams: queryParams,
                        searchParam: search
                })

        const { mutate: updateCheck, isPending: isUpdatingCheck } = useUpdateCheck()
        const { mutate: voidBulkChecks } = useBulkVoidChecks()
        const { mutate: printCheckMultiple, isPending: isPrintingCheckMultiple } =
                usePrintMultipleChecksDownload(true)

        const { mutate: printCheckMultipleBlankChecksDownload } =
                usePrintMultipleBlankChecksDownload()

        const { mutate: deleteCheck, isPending: isDeletetingChecks } =
                useDeleteCheck()

        const checks = useMemo(() => {
                if (!data || !data.pages) return []
                return data.pages.flatMap((page) => page?.data || [])
        }, [data])

        const totalCount = data?.pages[0]?.totalCount || 0

        const checksMap = useMemo(() => {
                return checks.reduce((acc, check) => {
                        acc[check._id] = check
                        return acc
                }, {})
        }, [checks])

        const handleScroll = (atBottom) => {
                if (fetchNextPage && hasNextPage && !isFetchingNextPage && atBottom) {
                        fetchNextPage()
                }
        }

        useEffect(() => {
                if (checks.length > 0) {
                        setIsCheckedAll(selectedChecks.length === checks.length)
                }
        }, [selectedChecks, checks.length])

        const handleMenuOpen = (event, data) => {
                setAnchorEl({ top: event.clientY, left: event.clientX })
                setSelectedItem(data)
                setSelectedChecks([])
        }

        const exceedTrialLimit = useMemo(() => {
                if (userInfo?.trialMaxChecks === 0) return false
                return totalCount >= userInfo?.trialMaxChecks
        }, [userInfo, totalCount])

        const handleSelectAll = (event) => {
                const checked = event.target.checked
                setIsCheckedAll(checked)

                if (checked) {
                        setSelectedChecks(checks)
                } else {
                        setSelectedChecks([])
                }
        }

        const handleSelectCheck = (checkId) => {
                setSelectedChecks((prev) => {
                        const check = checksMap[checkId]
                        const isSelected = prev.some(
                                (selectedCheck) => selectedCheck._id === checkId
                        )

                        if (isSelected) {
                                return prev.filter((selectedCheck) => selectedCheck._id !== checkId)
                        } else {
                                return [...prev, check]
                        }
                })
        }
        const handleShipClick = () => {
                const allowTrialMailingChecks = process.env.REACT_APP_ALLOW_TRIAL_MAILING_CHECKS ? process.env.REACT_APP_ALLOW_TRIAL_MAILING_CHECKS : 'true'
                if (userSubscription?.isSubscribed) {
                        setOpenShippingDialog(true)
                } else if (userSubscription?.isTrialPeriod && allowTrialMailingChecks === 'true') {
                        setOpenShippingDialog(true)
                } else {
                        setOpenRestrictDialog(true)
                }
        }

        const renderHeaderLabel = (column) => {
                switch (column.id) {
                        case 'payeeName':
                                return (
                                        <>
                                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>Payee Name</Box>
                                                <Box sx={{ display: { xs: 'block', md: 'none' } }}>Payee</Box>
                                        </>
                                )
                        case 'issuedDate':
                                return (
                                        <>
                                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>Issued Date</Box>
                                                <Box sx={{ display: { xs: 'block', md: 'none' } }}>Date</Box>
                                        </>
                                )
                        case 'accountNickname':
                                return (
                                        <>
                                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                                        Account Nickname
                                                </Box>
                                                <Box sx={{ display: { xs: 'block', md: 'none' } }}>Nickname</Box>
                                        </>
                                )
                        case 'tags':
                                return (
                                        <>
                                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                                        Account Tags
                                                </Box>
                                                <Box sx={{ display: { xs: 'block', md: 'none' } }}>Tags</Box>
                                        </>
                                )
                        default:
                                return column.label
                }
        }

        const renderHeaderCell = (column) => {
                if (column.id === 'selected') {
                        return (
                                <Checkbox
                                        checked={isCheckedAll}
                                        onChange={handleSelectAll}
                                        sx={styles.checkbox}
                                />
                        )
                }

                const label = renderHeaderLabel(column)

                if (!SORTABLE_COLUMN_IDS.has(column.id)) {
                        return label
                }

                const isActive = sort?.sortBy === column.id
                const direction = isActive ? sort.sortOrder : null
                let SortIcon
                if (direction === 'asc') {
                        SortIcon = ArrowUpwardIcon
                } else if (direction === 'desc') {
                        SortIcon = ArrowDownwardIcon
                } else {
                        SortIcon = UnfoldMoreIcon
                }

                return (
                        <Box
                                role="button"
                                tabIndex={0}
                                aria-label={`Sort by ${
                                        typeof column.label === 'string' ? column.label : column.id
                                } (${
                                        direction === 'asc'
                                                ? 'ascending'
                                                : direction === 'desc'
                                                ? 'descending'
                                                : 'unsorted'
                                })`}
                                onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleSortClick(column.id)
                                        }
                                }}
                                onClick={(e) => {
                                        e.stopPropagation()
                                        handleSortClick(column.id)
                                }}
                                sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        color: isActive ? 'primary.main' : 'inherit',
                                        '&:hover': { opacity: 0.8 }
                                }}
                        >
                                {label}
                                <SortIcon
                                        sx={{
                                                fontSize: 14,
                                                opacity: isActive ? 1 : 0.5
                                        }}
                                />
                        </Box>
                )
        }

        const renderCell = (row, column) => {
                if (!row) return null
                switch (column.id) {
                        case 'selected':
                                return (
                                        <Checkbox
                                                checked={selectedChecks.some((check) => check._id === row._id)}
                                                onChange={() => handleSelectCheck(row._id)}
                                                sx={styles.checkbox}
                                        />
                                )
                        case 'status':
                                return (
                                        <>
                                                {row.status === 'BLANK' ||
                                                row.status === 'CLEARED' ||
                                                row.status === 'VOID' ||
                                                row.status === 'DRAFT' ? (
                                                        <CustomButton
                                                                size="small"
                                                                sx={{
                                                                        width: '110px',
                                                                        margin: '0 auto',
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
                                                                {getStatusText(row.status)}
                                                                {row.isBlankCheck && (
                                                                        <img
                                                                                src="/img/blankedCheck_draft.png"
                                                                                width="20px"
                                                                                height="16px"
                                                                                alt="blanked"
                                                                        />
                                                                )}
                                                                {row.qbCheckId && (
                                                                        <QuickbooksSidebarIcon width="16px" height="16px" />
                                                                )}
                                                        </CustomButton>
                                                ) : (
                                                        <Select
                                                                fullWidth
                                                                value={row.status}
                                                                onChange={(e) => {
                                                                        if (e.target.value === 'Cleared') {
                                                                                setOpenAlertDialog(true)
                                                                                setAlertType('cleared')
                                                                                setSelectedItem(row)
                                                                        }
                                                                }}
                                                                renderValue={() => {
                                                                        if (row.isBlankCheck) {
                                                                                return (
                                                                                        <Box
                                                                                                sx={{
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: '5px'
                                                                                                }}
                                                                                        >
                                                                                                {getStatusText(row.status)}
                                                                                                <img
                                                                                                        src="/img/blankedCheck_draft.png"
                                                                                                        width="20px"
                                                                                                        height="16px"
                                                                                                        alt="blanked"
                                                                                                />
                                                                                        </Box>
                                                                                )
                                                                        }
                                                                        if (row.qbCheckId) {
                                                                                return (
                                                                                        <Box
                                                                                                sx={{
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: '5px'
                                                                                                }}
                                                                                        >
                                                                                                {getStatusText(row.status)}
                                                                                                <QuickbooksSidebarIcon width="16px" height="16px" />
                                                                                        </Box>
                                                                                )
                                                                        }
                                                                        return getStatusText(row.status)
                                                                }}
                                                                style={{ textTransform: 'titlecase' }}
                                                                sx={{
                                                                        width: '110px',
                                                                        height: '30px',
                                                                        margin: '0 auto',
                                                                        fontSize: '12px',
                                                                        color: getStatusColor(row.status),
                                                                        backgroundColor: `${getStatusColor(row.status)}0D`,
                                                                        border: `1px solid ${getStatusColor(row.status)}`,
                                                                        borderRadius: '5px',
                                                                        '&:hover': {
                                                                                backgroundColor: `${getStatusColor(row.status)}1A`,
                                                                                border: `1px solid ${getStatusColor(row.status)}`
                                                                        },

                                                                        '& .MuiSvgIcon-root': {
                                                                                color: getStatusColor(row.status)
                                                                        },
                                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                                                border: 'none'
                                                                        },
                                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                                border: 'none'
                                                                        }
                                                                }}
                                                                MenuProps={{
                                                                        PaperProps: {
                                                                                sx: {
                                                                                        mt: '4px',
                                                                                        borderRadius: '5px',
                                                                                        '& .MuiMenuItem-root': {
                                                                                                height: '30px',
                                                                                                fontSize: '12px'
                                                                                        },
                                                                                        '& .MuiMenuItem-root:first-of-type': {
                                                                                                display: 'none'
                                                                                        },
                                                                                        '& .MuiList-root': {
                                                                                                padding: '0px'
                                                                                        }
                                                                                }
                                                                        }
                                                                }}
                                                        >
                                                                <MenuItem value={row.status}>{row.status}</MenuItem>
                                                                <MenuItem value={'Cleared'}>Cleared</MenuItem>
                                                        </Select>
                                                )}
                                        </>
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
                        case 'payeeName':
                                return row.payee ? `${row.payee?.name}` : ''
                        case 'accountNickname':
                                return `${row.bank?.accountNickName}`
                        case 'amount':
                                return row.amount ? formatUSD(row.amount) : ''
                        case 'issuedDate':
                                return row.issuedDate ? dayjs(row.issuedDate).format('MM/DD/YYYY') : ''

                        case 'tags':
                                return <TagViewer tags={tags || []} row={row} mode="table" />
                        case 'attachment':
                                return (
                                        row.attachments?.length > 0 && (
                                                <AttachFileIcon
                                                        onMouseEnter={(e) => {
                                                                const x = e.clientX
                                                                const y = e.clientY
                                                                setAttachmentAnchorEL({
                                                                        getBoundingClientRect: () => new DOMRect(x, y, 0, 0)
                                                                })

                                                                setSelectedAttachments(row)
                                                        }}
                                                        onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedAttachments(row)
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
                                )

                        default:
                                return row[column.id]
                }
        }

        const handleEmail = () => {
                setSelectedChecks([selectedItem])
                setOpenEmailCheckDialog(true)
                setAnchorEl(null)
        }

        const handleDelete = () => {
                const ids = getCheckIds(selectedChecks, selectedItem)
                try {
                        deleteCheck(
                                { checkIds: ids },
                                {
                                        onSettled: () => {
                                                setOpenDetailDialog(false)
                                                setOpenAlertDialog(false)
                                                setSelectedChecks([])
                                                setSelectedItem(null)
                                        }
                                }
                        )
                } catch (err) {
                        console.error(err)
                }
                setAnchorEl(null)
        }
        const printChecks = (checkIds = [], isBlankChecks) => {
                setOpenGeneratingCheckDialog(true)

                if (!isBlankChecks) {
                        printCheckMultiple(
                                { checkIds },
                                {
                                        onSuccess: (response) => {
                                                const url = response?.url
                                                setAlertDialogValue(url)
                                                setOpenGeneratingCheckDialog(false)
                                                setAnchorEl(null)
                                                setSelectedChecks([])
                                                handleOpenDownloadCheckAlert()
                                        },
                                        onError: () => {
                                                setOpenGeneratingCheckDialog(false)
                                        }
                                }
                        )
                } else {
                        printCheckMultipleBlankChecksDownload(
                                { checkIds },
                                {
                                        onSuccess: (response) => {
                                                const url = response?.url
                                                setAlertDialogValue(url)
                                                setOpenGeneratingCheckDialog(false)
                                                setAnchorEl(null)
                                                setSelectedChecks([])
                                                handleOpenDownloadCheckAlert()
                                        },
                                        onError: () => {
                                                setOpenGeneratingCheckDialog(false)
                                        }
                                }
                        )
                }
        }

        const handlePrint = () => {
                const checks = getCheckIdsForPrint(selectedChecks, selectedItem)
                if (checks.checkIds.length === 0) return
                printChecks(checks.checkIds, checks.isBlankCheck)
        }

        const handleSaveandPrint = (checksData) => {
                const ids = checksData.map((check) => check._id)
                printChecks(ids)
        }

        const handleVoid = (isBulk = false) => {
                if (!isBulk) {
                        updateCheck(
                                {
                                        body: { status: CHECK_STATUS.VOID, amount: 0 },
                                        id: selectedItem._id
                                },
                                { onSuccess: () => setAnchorEl(null) }
                        )
                        setAnchorEl(null)
                        handleUnsaved()
                } else {
                        voidBulkChecks(
                                { checkIds: selectedChecks?.map((item) => item?._id) },
                                {
                                        onSuccess: () => {
                                                setOpenAlertDialog(false)
                                                setSelectedChecks([])
                                        }
                                }
                        )
                }
        }

        const handleCleared = () => {
                updateCheck(
                        { body: { status: CHECK_STATUS.CLEARED }, id: selectedItem._id },
                        { onSuccess: () => setAnchorEl(null) }
                )

                handleUnsaved()
        }
        const handleDetail = (row = null) => {
                const itemToShow = row || selectedItem
                if (itemToShow) {
                        if (row) {
                                setSelectedItem(row)
                        }
                        setOpenDetailDialog(true)
                        setAnchorEl(null)
                }
        }

        const handleOpenUnsavedAlert = () => {
                setOpenAlertDialog(true)
                setAlertType('unsaved')
        }

        const handleOpenDownloadCheckAlert = () => {
                setOpenGeneratingCheckDialog(false)
                setOpenAlertDialog(true)
                setAlertType('downloadCheck')
        }

        const handleUnsaved = () => {
                setOpenAddDialog(false)
                setOpenBlankCheckDialog(false)
                setOpenEditDialog(false)
                setOpenAlertDialog(false)
        }

        const handleDownloadCheck = async () => {
                await downloadFromUrl(alertDialogValue)
                setOpenAlertDialog(false)
        }

        const handleSingleFilterClose = (lable) => {
                setFilterList({
                        ...filterList,
                        singleFilter: filterList.singleFilter.filter((val) => val !== lable)
                })
                setPage(1)
        }

        const handleMultiFilterClose = (key, lable) => {
                setFilterList({
                        ...filterList,
                        multiFilter: {
                                ...filterList.multiFilter,
                                [key]: filterList.multiFilter[key].filter((val) => val !== lable)
                        }
                })
                setPage(1)
        }

        const handleDateRangeFilterClose = () => {
                setFilterList({
                        ...filterList,
                        dateRange: ''
                })
                setPage(1)
        }

        const handleResetFilter = () => {
                setFilterList({
                        singleFilter: [],
                        multiFilter: {},
                        dateRange: ''
                })
                setPage(1)
        }

        const handleMoreMenuOpen = (event) => {
                setMoreMenuAnchorEl(event.currentTarget)
        }

        const handleMoreMenuClose = () => {
                setMoreMenuAnchorEl(null)
        }
        const handleAttachments = () => {
                setAnchorEl(null)
                setOpenAttachmentsModal(true)
                setSelectedAttachments(selectedItem)
        }

        const { mutateAsync: uploadAttachments } = useUploadAttachments()
        const { mutateAsync: deleteAttachments } = useDeleteAttachments()
        const { mutateAsync: updateAttachmentDescription } =
                useUpdateAttachmentDescriptions()
        const handleAttachmentSave = async (
                filesToUpload,
                filesToDelete,
                filesToUpdate
        ) => {
                try {
                        setAttachmentLoading(true)
                        // upload new attachments
                        if (filesToUpload.length > 0) {
                                const formData = new FormData()
                                formData.append('entityType', EntityType.CHECK)
                                formData.append('entityId', selectedAttachments._id)

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
                        queryClient.invalidateQueries({ queryKey: ['checks'] })
                        setAttachmentLoading(false)
                        setOpenAttachmentsModal(false)
                } catch (error) {
                        console.error('Failed to save attachments:', error)
                        setAttachmentLoading(false)
                }
        }

        const canDeleteChecks = isOperationAllowed(
                selectedChecks,
                CHECK_PERMISSIONS.canDelete
        )
        const canPrintChecks = isOperationAllowed(
                selectedChecks,
                CHECK_PERMISSIONS.canPrint
        )
        const canEmailChecks = isOperationAllowed(
                selectedChecks,
                CHECK_PERMISSIONS.canEmail
        )
        const canMailChecks = isOperationAllowed(
                selectedChecks,
                CHECK_PERMISSIONS.canMail
        )
        const blankCheckSelect = selectedChecks.some((x) => x.isBlankCheck)
        const allNonBlankCheck = selectedChecks.some((x) => !x.isBlankCheck)
        const mixChecks = blankCheckSelect && allNonBlankCheck
        const canVoidChecks = isOperationAllowed(
                selectedChecks,
                CHECK_PERMISSIONS.canVoid
        )

        const enableCheckImport = JSON.parse(
                process.env.REACT_APP_ENABLE_CHECK_IMPORT || true
        )

        const menuItems = [
                {
                        label: 'Import',
                        icon: <ImportIcon width="20px" height="20px" />,
                        onClick: () => {
                                setOpenImportFilesModal(true)
                        },
                        showOnMobile: enableCheckImport,
                        showOnDesktop: enableCheckImport
                },
                {
                        label: 'Void',
                        icon: <VoiceIcon color="red" />,
                        onClick: () => {
                                setOpenAlertDialog(true)
                                setAlertType('void')
                        },
                        disabled: selectedChecks?.every((item) => !item.permissions?.canVoid),
                        showOnMobile: canVoidChecks,
                        showOnDesktop: canVoidChecks,
                        buttonProps: {
                                variant: 'outlined',
                                color: 'error',
                                sx: {
                                        ...styles.actionDeleteButton
                                }
                        }
                },
                {
                        label: 'Delete',
                        icon: <CheckDeleteIcon color="#FF4D4F" />,
                        onClick: () => {
                                setOpenAlertDialog(true)
                                setAlertType('delete')
                        },
                        disabled: selectedChecks.length === 0,
                        showOnMobile: canDeleteChecks,
                        showOnDesktop: canDeleteChecks,
                        buttonProps: {
                                variant: 'outlined',
                                color: 'error'
                        }
                },
                {
                        label: 'Print',
                        icon: <PrintIcon color="#000000DE" />,
                        onClick: handlePrint,
                        disabled:
                                selectedChecks.length === 0 ||
                                isPrintingCheckMultiple ||
                                !canPrintChecks ||
                                mixChecks,
                        showOnMobile: canPrintChecks,
                        showOnDesktop: canPrintChecks,
                        buttonProps: {
                                variant: 'outlined'
                        },
                        endIcon: isPrintingCheckMultiple && <CircularProgress size={14} />,
                        tooltip: mixChecks
                                ? 'Blank checks cannot be printed together with regular checks.'
                                : ''
                },
                {
                        label: 'Email',
                        icon: <EEmailIcon color={'#000000DE'} />,
                        onClick: () => setOpenEmailCheckDialog(true),
                        disabled: disableEmailButton,
                        showOnMobile: canEmailChecks,
                        showOnDesktop: canEmailChecks,
                        buttonProps: {
                                variant: 'outlined'
                        },
                        tooltip: disableEmailButton
                                ? 'Emails cannot be sent with multiple payees. Please ensure all checks have the same payee to proceed.'
                                : ''
                },
                {
                        label: 'Mail',
                        icon: <MailboxIcon />,
                        onClick: handleShipClick,
                        disabled: SHOULD_DISABLE_MAILING || selectedChecks.length === 0,
                        showOnMobile: canMailChecks,
                        showOnDesktop: canMailChecks,
                        buttonProps: {
                                variant: 'outlined'
                        },
                        tooltip: SHOULD_DISABLE_MAILING ? 'Coming Soon' : selectedChecks.length === 0 ? 'Select one or more checks to mail' : ''
                },
                {
                        label: 'Export ',
                        icon: <DownloadIcon sx={{ fontSize: '20px' }} />,
                        onClick: exportChecksAsCsv,
                        disabled: isExportingChecks,
                        showOnMobile: true,
                        showOnDesktop: true,
                        buttonProps: {
                                variant: 'outlined',
                                color: 'secondary'
                        },
                        endIcon: isExportingChecks && <CircularProgress size={'14px'} />
                },
                {
                        label: 'Blank',
                        icon: <AddIcon />,
                        onClick: () => {
                                setOpenBlankCheckDialog(true)
                                setSelectedItem(null)
                                handleMoreMenuClose()
                        },
                        disabled: exceedTrialLimit,
                        showOnMobile: true,
                        showOnDesktop: true,
                        buttonProps: {
                                variant: 'outlined',
                                color: 'secondary'
                        },
                        tooltip: exceedTrialLimit ? EXCEED_TRIAL_LIMIT_WARNING : ''
                },
                {
                        label: 'New',
                        icon: <AddIcon />,
                        onClick: () => {
                                setOpenAddDialog(true)
                                setSelectedItem(null)
                                handleMoreMenuClose()
                        },
                        disabled: exceedTrialLimit,
                        showOnMobile: true,
                        showOnDesktop: true,
                        buttonProps: {
                                variant: 'outlined',
                                color: 'primary'
                        },
                        tooltip: exceedTrialLimit ? EXCEED_TRIAL_LIMIT_WARNING : ''
                }
        ]

        const renderMenuItem = (item) => {
                const content = (
                        <Box sx={styles.mailMenuConent}>
                                {item.icon}
                                {item.label === 'Export' && !item.showOnDesktop ? item.label : ''}
                                {item.label !== 'Export' && item.label}
                                {item.endIcon}
                        </Box>
                )

                if (item.tooltip) {
                        return (
                                <Tooltip
                                        title={item.tooltip}
                                        placement={item.showOnDesktop ? 'bottom' : 'top'}
                                        arrow
                                        componentsProps={{
                                                tooltip: { sx: { ...styles.tooltip } }
                                        }}
                                >
                                        <span style={{ cursor: item.disabled ? 'default' : 'pointer' }}>
                                                {item.showOnDesktop ? (
                                                        <CustomButton
                                                                {...item.buttonProps}
                                                                disabled={item.disabled}
                                                                onClick={item.onClick}
                                                                sx={{
                                                                        ...(item.label === 'Delete'
                                                                                ? styles.actionDeleteButton
                                                                                : item.label === 'Void'
                                                                                ? styles.actionVoidButton
                                                                                : item.label === 'New'
                                                                                ? styles.primaryVariant
                                                                                : styles.actionButton)
                                                                }}
                                                        >
                                                                {content}
                                                        </CustomButton>
                                                ) : (
                                                        <MenuItem
                                                                onClick={item.onClick}
                                                                sx={styles.menuItem}
                                                                disabled={item.disabled}
                                                        >
                                                                {content}
                                                        </MenuItem>
                                                )}
                                        </span>
                                </Tooltip>
                        )
                }

                return item.showOnDesktop ? (
                        <CustomButton
                                {...item.buttonProps}
                                disabled={item.disabled}
                                onClick={item.onClick}
                                sx={{
                                        ...(item.label === 'Delete'
                                                ? styles.actionDeleteButton
                                                : item.label === 'Void'
                                                ? styles.actionVoidButton
                                                : item.label === 'New'
                                                ? styles.primaryVariant
                                                : styles.actionButton)
                                }}
                        >
                                {content}
                        </CustomButton>
                ) : (
                        <MenuItem
                                onClick={item.onClick}
                                sx={styles.menuItem}
                                disabled={item.disabled}
                        >
                                {content}
                        </MenuItem>
                )
        }

        return (
                <Box sx={{ height: '100%' }}>
                        <Typography sx={styles.title}>My Checks</Typography>

                        <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={styles.description}
                        >
                                Below is the list of all your checks.
                        </Typography>

                        <Box sx={styles.actionContainer}>
                                <Box sx={styles.searchContainer}>
                                        <CustomButton
                                                variant="outlined"
                                                endIcon={<FilterIcon color="#1a3850" />}
                                                color="secondary"
                                                onClick={(e) => setFilterMenuAnchorEl(e.currentTarget)}
                                        >
                                                Filter
                                        </CustomButton>
                                        <TextField
                                                placeholder="Search"
                                                sx={{ ...styles.searchField }}
                                                onChange={(e) => setSearch(e.target.value)}
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
                                </Box>

                                <Box sx={styles.actionButtons}>
                                        {/* Mobile Menu */}
                                        <Box sx={styles.moreButtonContainer}>
                                                <IconButton onClick={handleMoreMenuOpen} sx={styles.moreButton}>
                                                        <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                        anchorEl={moreMenuAnchorEl}
                                                        open={Boolean(moreMenuAnchorEl)}
                                                        onClose={handleMoreMenuClose}
                                                        sx={styles.moreMenuPopOver}
                                                        PaperProps={{
                                                                sx: styles.menuPaper
                                                        }}
                                                >
                                                        {menuItems
                                                                .filter((item) => item.showOnMobile)
                                                                .reverse()
                                                                .map((item, index) => (
                                                                        <MenuItem
                                                                                key={item.label}
                                                                                onClick={item.onClick}
                                                                                sx={{
                                                                                        ...styles.menuItem,
                                                                                        ...(index === 0 && {
                                                                                                backgroundColor: 'rgba(30, 58, 95, 0.1)',
                                                                                                borderRadius: '8px 8px 0px 0px'
                                                                                        })
                                                                                }}
                                                                        >
                                                                                {item.icon}
                                                                                {item.label}
                                                                        </MenuItem>
                                                                ))}
                                                </Menu>
                                        </Box>
                                        {/* Desktop Menu */}
                                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: '12px' }}>
                                                {menuItems
                                                        .filter((item) => item.showOnDesktop)
                                                        .map((item) => renderMenuItem(item))}
                                        </Box>
                                </Box>
                        </Box>

                        {(!isEmpty(filterList.singleFilter) ||
                                (!isEmpty(filterList.multiFilter) &&
                                        !isMultiEmpty(filterList.multiFilter)) ||
                                !!filterList.dateRange) && (
                                <>
                                        <Divider />

                                        <Box sx={styles.filterContainer}>
                                                {filterList.singleFilter.map((val) => (
                                                        <Box key={val} sx={styles.filterItemContainer}>
                                                                <Typography sx={styles.filterlableTitle}>{val}</Typography>
                                                                <CloseIcon
                                                                        onClick={() => handleSingleFilterClose(val)}
                                                                        sx={styles.filterCloseIcon}
                                                                />
                                                        </Box>
                                                ))}

                                                {Object.keys(filterList.multiFilter).map((key) => {
                                                        return filterList.multiFilter[key].map((val) => (
                                                                <Box key={`${key}-${val.label}`} sx={styles.filterItemContainer}>
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
                                                })}
                                                {filterList.dateRange && (
                                                        <Box sx={styles.filterItemContainer}>
                                                                <Typography sx={styles.filterlableTitle}>
                                                                        Issued Date:
                                                                        <Typography
                                                                                sx={{ color: '#e2e8f0', ml: '4px', fontSize: '12px' }}
                                                                        >
                                                                                {filterList.dateRange}
                                                                        </Typography>
                                                                </Typography>
                                                                <CloseIcon
                                                                        sx={styles.filterCloseIcon}
                                                                        onClick={handleDateRangeFilterClose}
                                                                />
                                                        </Box>
                                                )}
                                                <Button
                                                        variant="outlined"
                                                        sx={styles.resetButton}
                                                        onClick={handleResetFilter}
                                                >
                                                        Reset
                                                </Button>
                                        </Box>
                                </>
                        )}

                        <StickyCustomTable
                                columns={[
                                        {
                                                id: 'selected',
                                                label: (
                                                        <Checkbox
                                                                checked={isCheckedAll}
                                                                onChange={handleSelectAll}
                                                                sx={styles.checkbox}
                                                        />
                                                ),
                                                width: '52px',
                                                fixWidth: true
                                        },
                                        {
                                                id: 'checkNumber',
                                                label: 'Check No.',
                                                width: '90px',
                                                textAlign: 'center'
                                        },
                                        { id: 'status', label: 'Status', width: '130px' },
                                        { id: 'amount', label: 'Amount', width: '70px' },
                                        { id: 'payeeName', label: 'Payee Name', width: '160px' },
                                        { id: 'issuedDate', label: 'Issued Date', width: '140px' },
                                        {
                                                id: 'accountNickname',
                                                label: 'Account Nickname',
                                                width: '160px'
                                        },
                                        { id: 'tags', label: 'Tags', width: '140px' },
                                        { id: 'attachment', label: '', width: '30px', fixWidth: true },
                                        { id: 'actions', label: 'Actions', width: '80px' }
                                ]}
                                data={checks}
                                renderCell={renderCell}
                                renderHeaderCell={renderHeaderCell}
                                isCenteredCells={true}
                                sx={{
                                        '&.MuiTableCell-head': {
                                                padding: { xs: '0px 5px !important', md: '0px 0' }
                                        }
                                }}
                                onScroll={handleScroll}
                                renderEmptyRow={
                                        !hasNextPage && !isFetchingNextPage && data?.pages.length > 1
                                }
                                // height={stickyTableHeight}
                                noDataAavailableText="No more checks to load"
                                onRowClick={handleDetail}
                        />
                        {checks.length > 0 && (
                                <Typography sx={{ color: '#849098', mt: '32px', marginLeft: '5px' }}>
                                        1 to {checks.length} of {data?.pages[0].totalCount}{' '}
                                        {selectedChecks.length > 0
                                                ? ` - ${selectedChecks.length} selected`
                                                : ''}
                                </Typography>
                        )}

                        {selectedItem && selectedItem.permissions && (
                                <Menu
                                        anchorEl={!!anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={() => setAnchorEl(null)}
                                        PaperProps={{
                                                sx: styles.menuPaper
                                        }}
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                                anchorEl ? { top: anchorEl.top, left: anchorEl.left } : undefined
                                        }
                                        // you can keep transform/anchor origins if you like:
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                        {selectedItem.permissions.canEdit && (
                                                <MenuItem
                                                        onClick={() => {
                                                                setSelectedAttachments(selectedItem)
                                                                setOpenEditDialog(true)
                                                                setAnchorEl(null)
                                                        }}
                                                        sx={styles.menuItem}
                                                >
                                                        <EditIcon />
                                                        Edit
                                                </MenuItem>
                                        )}
                                        {selectedItem.permissions.canEmail && (
                                                <MenuItem onClick={handleEmail} sx={styles.menuItem}>
                                                        <EEmailIcon />
                                                        Email
                                                </MenuItem>
                                        )}
                                        {selectedItem.permissions.canDelete && !selectedItem.qbCheckId && (
                                                <MenuItem
                                                        onClick={() => {
                                                                setOpenAlertDialog(true)
                                                                setAnchorEl(null)
                                                                setAlertType('delete')
                                                        }}
                                                        sx={styles.menuItem}
                                                >
                                                        <CheckDeleteIcon />
                                                        Delete
                                                </MenuItem>
                                        )}
                                        {selectedItem.permissions.canPrint && (
                                                <MenuItem
                                                        disabled={isPrintingCheckMultiple}
                                                        onClick={handlePrint}
                                                        sx={styles.menuItem}
                                                >
                                                        <PrintIcon />
                                                        Print {isPrintingCheckMultiple && <CircularProgress size={10} />}
                                                </MenuItem>
                                        )}
                                        {selectedItem.permissions.canVoid && (
                                                <MenuItem
                                                        onClick={() => {
                                                                setOpenAlertDialog(true)

                                                                setAlertType('void')
                                                        }}
                                                        sx={styles.menuItem}
                                                >
                                                        <VoiceIcon />
                                                        Void Check
                                                </MenuItem>
                                        )}
                                        {selectedItem.permissions.canClear && (
                                                <MenuItem
                                                        onClick={() => {
                                                                setOpenAlertDialog(true)
                                                                setAnchorEl(null)
                                                                setAlertType('cleared')
                                                        }}
                                                        sx={styles.menuItem}
                                                >
                                                        <ClearedIcon />
                                                        Cleared Check
                                                </MenuItem>
                                        )}
                                        <MenuItem onClick={handleAttachments} sx={styles.menuItem}>
                                                <LinkIcon
                                                        sx={{ rotate: '-45deg', width: '18px', height: '18px' }}
                                                />
                                                Attachments
                                        </MenuItem>
                                        <MenuItem
                                                onClick={() => handleDetail(selectedItem)}
                                                sx={styles.menuItem}
                                        >
                                                <DetailIcon />
                                                View Details
                                        </MenuItem>
                                </Menu>
                        )}

                        <FilterMenu
                                anchorEl={filterMenuAnchorEl}
                                setAnchorEl={setFilterMenuAnchorEl}
                                setFilterList={setFilterList}
                                filterList={filterList}
                                setPage={setPage}
                        />
                        <ShippingRatesModal
                                open={openShippingDialog}
                                onClose={() => {
                                        setOpenShippingDialog(false)
                                        setSelectedChecks([])
                                        setSelectedItem(null)
                                }}
                                checks={selectedChecks}
                        />

                        <RestrictModal
                                open={openRestrictDialog}
                                onClose={() => setOpenRestrictDialog(false)}
                        />

                        {openDetailDialog && selectedItem && (
                                <DetailModal
                                        open={openDetailDialog}
                                        onClose={() => setOpenDetailDialog(false)}
                                        checkData={selectedItem}
                                        handleEmailClick={handleEmail}
                                        onCleared={handleCleared}
                                        onPrint={handlePrint}
                                        onDelete={handleDelete}
                                        onMail={() => {
                                                setSelectedChecks([selectedItem])
                                                setOpenShippingDialog(true)
                                        }}
                                        isPrinting={isPrintingCheckMultiple}
                                        isDeletetingChecks={isDeletetingChecks}
                                        handleVoid={handleVoid}
                                        tags={tags}
                                />
                        )}

                        <AlertModal
                                isLoading={isDeletetingChecks || isUpdatingCheck}
                                open={openAlertDialog}
                                onClose={() => setOpenAlertDialog(false)}
                                checkData={selectedItem}
                                onConfirm={() =>
                                        alertType === 'delete'
                                                ? handleDelete()
                                                : alertType === 'void'
                                                ? handleVoid(!!selectedChecks?.length)
                                                : alertType === 'cleared'
                                                ? handleCleared()
                                                : alertType === 'unsaved'
                                                ? handleUnsaved()
                                                : handleDownloadCheck()
                                }
                                type={alertType}
                        />
                        {openImportFilesModal && (
                                <ImportFilesModal
                                        open={openImportFilesModal}
                                        onClose={() => setOpenImportFilesModal(false)}
                                        onConfirm={() => {
                                                setOpenImportFilesModal(false)
                                        }}
                                />
                        )}

                        {openAddDialog && (
                                <AddModal
                                        open={openAddDialog}
                                        onClose={() => {
                                                removeQueryParams()
                                                setOpenAddDialog(false)
                                        }}
                                        checkData={selectedItem ? [selectedItem] : selectedChecks}
                                        handleOpenUnsavedAlert={handleOpenUnsavedAlert}
                                        handleSaveandPrint={handleSaveandPrint}
                                        totalCount={totalCount}
                                        userMaxCheckLimit={userInfo?.trialMaxChecks || 0}
                                />
                        )}

                        {openEditDialog && (
                                <EditModal
                                        open={openEditDialog}
                                        onClose={() => setOpenEditDialog(false)}
                                        checkData={selectedItem}
                                        handleOpenUnsavedAlert={handleOpenUnsavedAlert}
                                        handleSaveandPrint={handleSaveandPrint}
                                        handleAttachmentSave={handleAttachmentSave}
                                />
                        )}

                        {openBlankCheckDialog && (
                                <BlankCheckModal
                                        open={openBlankCheckDialog}
                                        onClose={() => setOpenBlankCheckDialog(false)}
                                        checkData={selectedItem}
                                        handleOpenUnsavedAlert={handleOpenUnsavedAlert}
                                        handleOpenDownloadCheckAlert={handleOpenDownloadCheckAlert}
                                        setAlertDialogValue={setAlertDialogValue}
                                        totalCount={totalCount}
                                        userMaxCheckLimit={userInfo?.trialMaxChecks || 0}
                                />
                        )}

                        {openGeneratingCheckDialog && (
                                <GeneratingCheckModal open={openGeneratingCheckDialog} />
                        )}

                        {openEmailCheckDialog && (
                                <EmailCheckModal
                                        open={openEmailCheckDialog}
                                        onClose={() => {
                                                setOpenEmailCheckDialog(false)
                                                setSelectedChecks([])
                                        }}
                                        selectedChecks={selectedChecks}
                                        onConfirm={() => {}}
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
                                                        {selectedAttachments &&
                                                                selectedAttachments.attachments &&
                                                                selectedAttachments?.attachments?.map((attachment, index) => (
                                                                        <AttachmentItem
                                                                                attachment={attachment}
                                                                                key={'table_attachment' + index}
                                                                        />
                                                                ))}
                                                </Paper>
                                        </Fade>
                                )}
                        </Popper>

                        {openAttachmentsModal && (
                                <AttachmentsModal
                                        open={openAttachmentsModal}
                                        onClose={() => setOpenAttachmentsModal(false)}
                                        title="View Attachments"
                                        handleSave={handleAttachmentSave}
                                        attachments={selectedAttachments.attachments}
                                        loading={attachmentLoading}
                                />
                        )}
                </Box>
        )
}

export default MyChecks

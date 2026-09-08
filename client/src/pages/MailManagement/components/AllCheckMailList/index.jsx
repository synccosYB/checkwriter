import { useEffect, useMemo, useState } from 'react'
import { CustomTable } from '../../../../components/table/CustomTable'
import {
        Box,
        Checkbox,
        CircularProgress,
        Pagination,
        PaginationItem,
        Tooltip,
        Typography,
        useTheme
} from '@mui/material'
import { CustomButton } from '../../../../components/buttons/CustomButton'
import { styles } from './styles.js'

import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined'
import { FilterIcon } from '../../../../components/Icons'
import { BatchPrintModal } from '../modals/BatchPrintModal/index.jsx'
import { BatchDetailDialog } from '../modals/BatchDetailModal/index.jsx'
import useAllMailChecks from '../../../../API/admin/useAllMailChecks.js'
import {
        useColumnSort,
        SortableHeaderLabel
} from '../../../../components/table/sortableHeader'
import usePagination from '../../../../utils/hooks/usePagination.js'
import useUserInfo from '../../../../API/users/useUserInfo'
import useBatchDetails from '../../../../API/admin/useBatchDetails.js'
import {
        getMappedBatch,
        getColumns,
        getStatusColor,
        shouldDisable
} from './helpers.js'

export const AllCheckMailList = ({ search }) => {
        const { data: userData } = useUserInfo()
        const { page, setPage, pageSize } = usePagination()

        const SORTABLE_COLUMN_IDS = useMemo(
                () =>
                        new Set([
                                'status',
                                'issuedDate',
                                'mailedDate',
                                'no',
                                'payeeName',
                                'account',
                                'org',
                                'batchNumber'
                        ]),
                []
        )
        const { sort, handleSortClick } = useColumnSort(SORTABLE_COLUMN_IDS)

        const { data, isLoading } = useAllMailChecks({
                page,
                pageSize,
                status: search,
                sortBy: sort?.sortBy,
                sortOrder: sort?.sortOrder
        })

        const checks = useMemo(() => data?.data || [], [data])
        const theme = useTheme()
        const [selectedChecks, setSelectedChecks] = useState([])
        const [isCheckedAll, setIsCheckedAll] = useState(false)
        const [openDialog, setOpenDialog] = useState(false)
        const [openBatchDetailDialog, setOpenBatchDetailDialog] = useState(false)
        const [batchInfo, setBatchInfo] = useState(null)
        const [selectedBatch, setSelectedBatch] = useState(null)
        const { data: batchData, isLoading: isLoadingBatchDetails } =
                useBatchDetails(selectedBatch)

        useEffect(() => {
                if (batchData) {
                        setBatchInfo(getMappedBatch(batchData))
                }
        }, [batchData])

        const handleCloseDialog = (type) => {
                if (type === 'cancel') {
                        setSelectedChecks([])
                        setIsCheckedAll(false)
                }
                setOpenDialog(false)
        }

        const handleConfirmPrint = ({ batchInfo, confirmedChecks }) => {
                setIsCheckedAll(false)
                setSelectedChecks(
                        confirmedChecks.map((i) => ({ ...i, status: 'Processing' }))
                )
                setOpenBatchDetailDialog(true)
                setBatchInfo(batchInfo)
        }

        const handleBatchDetailCloseDialog = () => {
                setIsCheckedAll(false)
                setOpenBatchDetailDialog(false)
                setSelectedChecks([])
        }

        const handleSelectAll = (event) => {
                const checked = event.target.checked

                if (checked) {
                        setSelectedChecks(checks)
                } else {
                        setSelectedChecks([])
                }
        }

        const handleBatchPrintClick = () => {
                setOpenDialog(true)
        }

        const handleBatchPrintAllClick = () => {
                setIsCheckedAll(true)

                setOpenDialog(true)
        }

        const renderHeaderCell = (column) => {
                switch (column.id) {
                        case 'selected':
                                return (
                                        <Checkbox
                                                checked={selectedChecks.length === checks.length && !!checks.length}
                                                onChange={handleSelectAll}
                                                sx={styles.checkbox}
                                        />
                                )
                        default:
                                return (
                                        <SortableHeaderLabel
                                                column={column}
                                                label={column.label}
                                                sort={sort}
                                                sortableColumnIds={SORTABLE_COLUMN_IDS}
                                                onSortClick={handleSortClick}
                                        />
                                )
                }
        }

        const renderCell = (row, column) => {
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
                                        <CustomButton
                                                size="small"
                                                sx={{
                                                        width: '200px',
                                                        color: getStatusColor(row.status, theme),
                                                        backgroundColor: `${getStatusColor(row.status, theme)}0D`,
                                                        border: `1px solid ${getStatusColor(row.status, theme)}`,
                                                        '&:hover': {
                                                                backgroundColor: `${getStatusColor(row.status, theme)}1A`,
                                                                border: `1px solid ${getStatusColor(row.status, theme)}`
                                                        }
                                                }}
                                        >
                                                {row.status}
                                        </CustomButton>
                                )
                        case 'no':
                                return row.check.checkNumber
                        case 'payeeName':
                                return row.payee.name
                        case 'issuedDate':
                                return new Date(row.requestedAt).toDateString()
                        case 'mailedDate':
                                return new Date(row.mailedAt).toDateString()
                        case 'account':
                                return `${row.user?.firstName} ${row.user?.lastName}`
                        case 'org':
                                return row.organization.organizationName
                        case 'batchNumber':
                                return (
                                        <Typography
                                                sx={styles.tableCellStyle}
                                                onClick={() => {
                                                        if (row?.batch?._id) {
                                                                setSelectedBatch(row?.batch?._id)
                                                        }

                                                        setSelectedChecks([row])
                                                }}
                                        >
                                                {row?.batch?.batchNumber}
                                                {isLoadingBatchDetails &&
                                                        selectedBatch === row?.batch?._id &&
                                                        selectedChecks[0]?._id === row?._id && (
                                                                <>
                                                                        &nbsp; <CircularProgress size={'14px'} />
                                                                </>
                                                        )}
                                        </Typography>
                                )
                        default:
                                return row[column.id]
                }
        }

        const handleSelectCheck = (checkId) => {
                setSelectedChecks((prev) => {
                        // Find the check object
                        const check = checks.find((c) => c._id === checkId)
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

        const shouldDisableBatchPrint = shouldDisable(selectedChecks)

        const checksSource = isCheckedAll ? checks : [...selectedChecks]

        const shouldHideActions = ['Mailed', 'Processing', 'Canceled'].some(
                (i) => search && search.includes(i)
        )

        return (
                <>
                        {isLoading ? (
                                <Box display={'flex'} justifyContent={'center'} my={20}>
                                        <CircularProgress size={'60px'} />
                                </Box>
                        ) : (
                                <>
                                        <Box sx={styles.actionContainer}>
                                                <Box sx={styles.actionButtons}>
                                                        <Tooltip title={''}>
                                                                <span>
                                                                        <CustomButton
                                                                                variant="outlined"
                                                                                startIcon={<LocalPrintshopOutlinedIcon />}
                                                                                sx={{
                                                                                        ...styles.actionButton,
                                                                                        display: shouldHideActions ? 'none' : 'flex'
                                                                                }}
                                                                                onClick={handleBatchPrintAllClick}
                                                                                endIcon={isLoading && <CircularProgress size={'14px'} />}
                                                                        >
                                                                                <Box>Batch & Print All</Box>
                                                                        </CustomButton>
                                                                </span>
                                                        </Tooltip>
                                                        <Tooltip title={''}>
                                                                <span>
                                                                        <CustomButton
                                                                                disabled={shouldDisableBatchPrint}
                                                                                variant="outlined"
                                                                                startIcon={<LocalPrintshopOutlinedIcon />}
                                                                                sx={{
                                                                                        ...styles.actionButton,
                                                                                        display: shouldHideActions ? 'none' : 'flex'
                                                                                }}
                                                                                onClick={handleBatchPrintClick}
                                                                        >
                                                                                <Box>Batch & Print</Box>
                                                                        </CustomButton>
                                                                </span>
                                                        </Tooltip>
                                                        <CustomButton
                                                                variant="outlined"
                                                                endIcon={<FilterIcon />}
                                                                // onClick={handleFilterClick}
                                                                color="primary"
                                                                sx={styles.filterContainer}
                                                        >
                                                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Filters</Box>
                                                        </CustomButton>
                                                </Box>
                                        </Box>
                                        <CustomTable
                                                columns={getColumns(search)}
                                                data={checks}
                                                renderCell={renderCell}
                                                renderHeaderCell={renderHeaderCell}
                                                isCenteredCells={true}
                                        />
                                </>
                        )}

                        <Box
                                sx={{
                                        ...styles.paginationContainer,
                                        pointerEvents: isLoading ? 'none' : 'all'
                                }}
                        >
                                <Pagination
                                        count={Math.ceil((data?.totalCount || 1) / pageSize)}
                                        page={page + 1}
                                        rowsPerPage={pageSize}
                                        onChange={(event, value) => setPage(value - 1)}
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
                        {openDialog && checks && (
                                <BatchPrintModal
                                        open={openDialog}
                                        onClose={handleCloseDialog}
                                        checks={checksSource}
                                        onConfirm={handleConfirmPrint}
                                        batchAllPending={isCheckedAll}
                                />
                        )}

                        {openBatchDetailDialog && (
                                <BatchDetailDialog
                                        onMarkAsMailed={({ ids }) => {
                                                setSelectedChecks((prev) =>
                                                        prev.map((c) =>
                                                                ids.includes(c._id) ? { ...c, status: 'Mailed' } : c
                                                        )
                                                )
                                        }}
                                        open={openBatchDetailDialog}
                                        onClose={handleBatchDetailCloseDialog}
                                        batch={{
                                                ...batchInfo,
                                                createdBy: `${userData.firstName} ${userData.lastName}`
                                        }}
                                        checks={checksSource}
                                />
                        )}

                        {!!selectedBatch && batchData && (
                                <BatchDetailDialog
                                        open={true}
                                        onClose={() => {
                                                setSelectedBatch(null)
                                                setSelectedChecks([])
                                        }}
                                        checks={batchData?.mailed_checks || []}
                                        batch={batchInfo}
                                        onMarkAsMailed={({ ids }) => {
                                                setSelectedChecks((prev) =>
                                                        prev.map((c) =>
                                                                ids.includes(c._id) ? { ...c, status: 'Mailed' } : c
                                                        )
                                                )
                                        }}
                                />
                        )}
                </>
        )
}

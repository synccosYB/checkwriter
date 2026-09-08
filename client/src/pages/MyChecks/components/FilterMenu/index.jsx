import { useState, useEffect, useMemo } from 'react'
import {
        Box,
        Menu,
        MenuItem,
        ListItemText,
        Popper,
        Paper,
        ClickAwayListener,
        TextField,
        InputAdornment,
        Checkbox,
        Typography,
        Divider,
        useTheme,
        useMediaQuery
} from '@mui/material'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { styles } from './styles'
import { SearchIcon } from '../../../../components/Icons'
import { CustomButton } from '../../../../components/buttons/CustomButton'
import useBanks from '../../../../API/banks/useBanks'
import usePayees from '../../../../API/payees/usePayees'
import dayjs from 'dayjs'
import { CHECK_STATUS } from '../../../../types/check.types'
import { getStatusText } from '../../utils/getStatusColor'

const FilterMenu = ({
        anchorEl,
        setAnchorEl,
        setFilterList,
        filterList,
        setPage
}) => {
        const { data: banksData } = useBanks()
        const { data: payeesData } = usePayees({status: 'active'})
        const [subAnchorEl, setSubAnchorEl] = useState(null)
        const [hoveredItem, setHoveredItem] = useState(null)
        const [startDate, setStartDate] = useState(new Date())
        const [endDate, setEndDate] = useState(new Date())
        const [subMenuSearch, setSubMenuSearch] = useState('')
        const theme = useTheme()
        const isMobile = useMediaQuery(theme.breakpoints.down('md'))

        const accountNicknames = useMemo(
                () =>
                        banksData?.data?.map((bank) => ({
                                value: bank._id,
                                key: 'bankIds',
                                label: 'Account Nickname',
                                labelValue: bank.accountNickName
                        })) || [],
                [banksData]
        )

        const bankAccounts = useMemo(
                () =>
                        banksData?.data?.map((bank) => ({
                                value: bank._id,
                                key: 'bankIds',
                                label: 'Bank account',
                                labelValue: bank.bankName
                        })) || [],
                [banksData]
        )

        const payees = useMemo(
                () =>
                        payeesData?.data?.map((payee) => ({
                                value: payee._id,
                                key: 'payeeIds',
                                label: 'Payee Name',
                                labelValue: payee.name
                        })) || [],
                [payeesData]
        )

        const statuses = useMemo(
                () => [
                        {
                                value: CHECK_STATUS.CLEARED,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.CLEARED)
                        },
                        {
                                value: CHECK_STATUS.UNCLEARED,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.UNCLEARED)
                        },
                        {
                                value: CHECK_STATUS.DRAFT,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.DRAFT)
                        },
                        {
                                value: CHECK_STATUS.SUBMITTED,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.SUBMITTED)
                        },
                        {
                                value: CHECK_STATUS.BLANK,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.BLANK)
                        },
                        {
                                value: CHECK_STATUS.PRINTED,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.PRINTED)
                        },
                        {
                                value: CHECK_STATUS.EMAILED,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.EMAILED)
                        },
                        {
                                value: CHECK_STATUS.MAILED,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.MAILED)
                        },
                        {
                                value: CHECK_STATUS.VOID,
                                key: 'status',
                                label: 'Status',
                                labelValue: getStatusText(CHECK_STATUS.VOID)
                        }
                ],
                []
        )

        const createdAsOptions = useMemo(
                () => [
                        {
                                value: 'filled',
                                key: 'createdAs',
                                label: 'Created As',
                                labelValue: 'Filled'
                        },
                        {
                                value: 'blank',
                                key: 'createdAs',
                                label: 'Created As',
                                labelValue: 'Blank'
                        }
                ]
                ,[])

        const [dateRanges, setDateRanges] = useState({
                thisWeek: { start: '', end: '' },
                thisMonth: { start: '', end: '' },
                thisQuarter: { start: '', end: '' },
                thisYear: { start: '', end: '' },
                lastWeek: { start: '', end: '' },
                lastMonth: { start: '', end: '' },
                lastQuarter: { start: '', end: '' },
                lastYear: { start: '', end: '' }
        })

        useEffect(() => {
                const today = new Date()

                // This Week
                const thisWeekStart = new Date(today)
                thisWeekStart.setDate(today.getDate() - today.getDay())
                const thisWeekEnd = new Date(thisWeekStart)
                thisWeekEnd.setDate(thisWeekStart.getDate() + 6)

                // This Month
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

                // This Quarter
                const currentQuarter = Math.floor(today.getMonth() / 3)
                const thisQuarterStart = new Date(
                        today.getFullYear(),
                        currentQuarter * 3,
                        1
                )
                const thisQuarterEnd = new Date(
                        today.getFullYear(),
                        (currentQuarter + 1) * 3,
                        0
                )

                // This Year
                const thisYearStart = new Date(today.getFullYear(), 0, 1)
                const thisYearEnd = new Date(today.getFullYear(), 11, 31)

                // Last Week
                const lastWeekStart = new Date(thisWeekStart)
                lastWeekStart.setDate(thisWeekStart.getDate() - 7)
                const lastWeekEnd = new Date(lastWeekStart)
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6)

                // Last Month
                const lastMonthStart = new Date(
                        today.getFullYear(),
                        today.getMonth() - 1,
                        1
                )
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

                // Last Quarter
                const lastQuarterStart = new Date(
                        today.getFullYear(),
                        (currentQuarter - 1) * 3,
                        1
                )
                const lastQuarterEnd = new Date(today.getFullYear(), currentQuarter * 3, 0)

                // Last Year
                const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
                const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

                setDateRanges({
                        thisWeek: {
                                start: thisWeekStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: thisWeekEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        thisMonth: {
                                start: thisMonthStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: thisMonthEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        thisQuarter: {
                                start: thisQuarterStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: thisQuarterEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        thisYear: {
                                start: thisYearStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: thisYearEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        lastWeek: {
                                start: lastWeekStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: lastWeekEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        lastMonth: {
                                start: lastMonthStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: lastMonthEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        lastQuarter: {
                                start: lastQuarterStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: lastQuarterEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        },
                        lastYear: {
                                start: lastYearStart.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                }),
                                end: lastYearEnd.toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric'
                                })
                        }
                })
        }, [])

        const handleClose = () => {
                setAnchorEl(null)
                setHoveredItem(null)
        }

        const handleHover = (item, e) => {
                setHoveredItem(item)
                setSubAnchorEl(e.currentTarget)
                setSubMenuSearch('')
        }
        const handleLeave = () => {
                setHoveredItem(null)
                setSubAnchorEl(null)
        }
        const handleMenuClick = (item) => {
                if (!item.subMenu) {
                        setFilterList((prevFilter) => {
                                return {
                                        ...prevFilter,
                                        singleFilter: prevFilter.singleFilter.includes(item.label)
                                                ? prevFilter.singleFilter
                                                : [...prevFilter.singleFilter, item.label]
                                }
                        })
                        setAnchorEl(null)
                        setHoveredItem(null)
                        setPage(1)
                }
        }

        const handleSubMenu = (key, item) => {
                setFilterList((prevFilter) => {
                        const currentItems = prevFilter.multiFilter[key] || []

                        const exists = currentItems.some(
                                (i) => JSON.stringify(i) === JSON.stringify(item)
                        )

                        const updatedItems = exists
                                ? currentItems.filter((i) => JSON.stringify(i) !== JSON.stringify(item))
                                : [...currentItems, item]

                        return {
                                ...prevFilter,
                                multiFilter: {
                                        ...prevFilter.multiFilter,
                                        [key]: updatedItems
                                }
                        }
                })
                setPage(1)
        }
        const handleDateRange = (val) => {
                setFilterList((prevFilter) => {
                        return {
                                ...prevFilter,
                                dateRange:
                                        val === 'Custom'
                                                ? `${dayjs(startDate).format('MM/DD/YYYY')} to ${dayjs(
                                                                endDate
                                                  ).format('MM/DD/YYYY')}`
                                                : val
                        }
                })
                setHoveredItem(null)
                setAnchorEl(null)
                setPage(1)
        }

        const menuItems = [
                { label: 'All Checks', subMenu: false },
                { label: 'Cleared Checks', subMenu: false },
                { label: 'Uncleared Checks', subMenu: false },
                { label: 'Draft Checks', subMenu: false },
                { label: 'Bank account', subMenu: true },
                { label: 'Payee Name', subMenu: true },
                { label: 'Created As', subMenu: true },
                { label: 'Account Nickname', subMenu: true },
                { label: 'Status', subMenu: true },
                { label: 'Issued Date', subMenu: true }
        ]
        const renderSubMenu = (item) => {
                return (
                        <Paper
                                elevation={3}
                                sx={{
                                        ...(item.label === 'Issued Date' && styles.issueddatepaper),
                                        p: 1,
                                        minWidth: { xs: '149px', md: '200px' },
                                        width: { xs: '149px', md: 'auto' },
                                        marginLeft: { xs: '4px', md: '0' }
                                }}
                        >
                                {item !== 'Issued Date' && item !== 'Created As' && (
                                        <TextField
                                                placeholder="Search"
                                                sx={styles.searchField}
                                                value={subMenuSearch}
                                                onChange={(e) => setSubMenuSearch(e.target.value)}
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
                                )}
                                {item === 'Bank account' &&
                                        bankAccounts
                                                .filter((p) =>
                                                        p.labelValue.toLowerCase().includes(subMenuSearch.toLowerCase())
                                                )
                                                .map((account) => (
                                                        <MenuItem
                                                                key={`bank-${account.value}`}
                                                                sx={styles.subMenuItem}
                                                                onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSubMenu(item, account)
                                                                }}
                                                        >
                                                                <Checkbox
                                                                        checked={(
                                                                                filterList.multiFilter['Bank account'] || []
                                                                        ).some(i => i.value === account.value)}
                                                                        sx={styles.checkbox}
                                                                />
                                                                <ListItemText
                                                                        sx={styles.subMenuItemText}
                                                                        primary={account.labelValue}
                                                                />
                                                        </MenuItem>
                                                ))}
                                {item === 'Payee Name' &&
                                        payees
                                                .filter((p) =>
                                                        p.labelValue.toLowerCase().includes(subMenuSearch.toLowerCase())
                                                )
                                                .map((payee) => (
                                                        <MenuItem
                                                                key={`payee-${payee.value}`}
                                                                sx={styles.subMenuItem}
                                                                onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSubMenu(item, payee)
                                                                }}
                                                        >
                                                                <Checkbox
                                                                        checked={(
                                                                                filterList.multiFilter['Payee Name'] || []
                                                                        ).some(i => i.value === payee.value)}
                                                                        sx={styles.checkbox}
                                                                />
                                                                <ListItemText
                                                                        sx={styles.subMenuItemText}
                                                                        primary={payee.labelValue}
                                                                />
                                                        </MenuItem>
                                                ))}
                                {/* {item === 'Tags' && tags.filter((p) => p.labelValue.toLowerCase().includes(subMenuSearch.toLowerCase())).map((tag) => (
          <MenuItem key={tag} sx={styles.subMenuItem} onClick={() => handleSubMenu(item, tag)}>
            <Checkbox checked={(filterList.multiFilter['Tags'] || []).includes(tag)} sx={styles.checkbox} />
            <ListItemText primary={tag.labelValue} />
          </MenuItem>
        ))} */}
                                {item === 'Created As' &&
                                        createdAsOptions
                                                .map((status) => (
                                                        <MenuItem
                                                                key={`status-${status.value}`}
                                                                sx={styles.subMenuItem}
                                                                onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSubMenu(item, status)
                                                                }}
                                                        >
                                                                <Checkbox
                                                                        checked={(filterList.multiFilter['Created As'] || []).some(i => i.value === status.value)}
                                                                        sx={styles.checkbox}
                                                                />
                                                                <ListItemText
                                                                        sx={styles.subMenuItemText}
                                                                        primary={status.labelValue}
                                                                />
                                                        </MenuItem>
                                                ))}

                                {item === 'Account Nickname' &&
                                        accountNicknames
                                                .filter((p) =>
                                                        p.labelValue.toLowerCase().includes(subMenuSearch.toLowerCase())
                                                )
                                                .map((accountNickname) => (
                                                        <MenuItem
                                                                key={`nickname-${accountNickname.value}`}
                                                                sx={styles.subMenuItem}
                                                                onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSubMenu(item, accountNickname)
                                                                }}
                                                        >
                                                                <Checkbox
                                                                        checked={(
                                                                                filterList.multiFilter['Account Nickname'] || []
                                                                        ).some(i => i.value === accountNickname.value)}
                                                                        sx={styles.checkbox}
                                                                />
                                                                <ListItemText
                                                                        sx={styles.subMenuItemText}
                                                                        primary={accountNickname.labelValue}
                                                                />
                                                        </MenuItem>
                                                ))}

                                {item === 'Status' &&
                                        statuses
                                                .filter((p) =>
                                                        p.labelValue.toLowerCase().includes(subMenuSearch.toLowerCase())
                                                )
                                                .map((status) => (
                                                        <MenuItem
                                                                key={`status-${status.value}`}
                                                                sx={styles.subMenuItem}
                                                                onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSubMenu(item, status)
                                                                }}
                                                        >
                                                                <Checkbox
                                                                        checked={(filterList.multiFilter['Status'] || []).some(i => i.value === status.value)}
                                                                        sx={styles.checkbox}
                                                                />
                                                                <ListItemText
                                                                        sx={styles.subMenuItemText}
                                                                        primary={status.labelValue}
                                                                />
                                                        </MenuItem>
                                                ))}

                                {item === 'Issued Date' && (
                                        <Box
                                                sx={{
                                                        minWidth: { xs: '280px', md: '360px' },
                                                        padding: { xs: '4px', md: '16px' }
                                                }}
                                        >
                                                <Typography sx={styles.dateRangeTitle}>Date Range</Typography>
                                                <Divider sx={styles.divider} />
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('This Week')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>This Week</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.thisWeek.start} - {dateRanges.thisWeek.end}
                                                        </Typography>
                                                </MenuItem>
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('This Month')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>This Month</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.thisMonth.start} - {dateRanges.thisMonth.end}
                                                        </Typography>
                                                </MenuItem>
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('This Quarter')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>This Quarter</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.thisQuarter.start} - {dateRanges.thisQuarter.end}
                                                        </Typography>
                                                </MenuItem>
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('This Year')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>This Year</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.thisYear.start} - {dateRanges.thisYear.end}
                                                        </Typography>
                                                </MenuItem>
                                                <Divider sx={styles.divider} />
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('Last Week')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>Last Week</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.lastWeek.start} - {dateRanges.lastWeek.end}
                                                        </Typography>
                                                </MenuItem>
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('Last Month')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>Last Month</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.lastMonth.start} - {dateRanges.lastMonth.end}
                                                        </Typography>
                                                </MenuItem>
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('Last Quarter')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>Last Quarter</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.lastQuarter.start} - {dateRanges.lastQuarter.end}
                                                        </Typography>
                                                </MenuItem>
                                                <MenuItem
                                                        sx={styles.dateSubMenuItem}
                                                        onClick={() => handleDateRange('Last Year')}
                                                >
                                                        <Typography sx={styles.dateRangeText}>Last Year</Typography>
                                                        <Typography sx={styles.dateRange}>
                                                                {dateRanges.lastYear.start} - {dateRanges.lastYear.end}
                                                        </Typography>
                                                </MenuItem>
                                                <Divider sx={styles.divider} />
                                                <Typography sx={styles.dateRangeTitle}>Custom Range</Typography>

                                                <Box sx={styles.customDateContainer}>
                                                        <Box sx={{ width: '50%' }}>
                                                                <Typography sx={{ ...styles.dateRangeText, mb: 1 }}>
                                                                        From
                                                                </Typography>
                                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                                        <DatePicker
                                                                                value={startDate}
                                                                                onChange={(newValue) => setStartDate(newValue)}
                                                                                renderInput={(params) => (
                                                                                        <TextField
                                                                                                {...params}
                                                                                                size="small"
                                                                                                fullWidth
                                                                                                sx={styles.datePicker}
                                                                                        />
                                                                                )}
                                                                                slotProps={{ textField: { sx: styles.datePicker } }}
                                                                        />
                                                                </LocalizationProvider>
                                                        </Box>
                                                        <Box sx={{ width: '50%' }}>
                                                                <Typography sx={{ ...styles.dateRangeText, mb: 1 }}>
                                                                        To
                                                                </Typography>
                                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                                        <DatePicker
                                                                                value={endDate}
                                                                                onChange={(newValue) => setEndDate(newValue)}
                                                                                renderInput={(params) => (
                                                                                        <TextField
                                                                                                {...params}
                                                                                                size="small"
                                                                                                fullWidth
                                                                                                sx={styles.datePicker}
                                                                                        />
                                                                                )}
                                                                                slotProps={{ textField: { sx: styles.datePicker } }}
                                                                        />
                                                                </LocalizationProvider>
                                                        </Box>
                                                </Box>

                                                <CustomButton
                                                        variant="outlined"
                                                        color="primary"
                                                        sx={{ height: '32px', ml: 'auto' }}
                                                        onClick={() => handleDateRange('Custom')}
                                                >
                                                        Apply
                                                </CustomButton>
                                        </Box>
                                )}
                        </Paper>
                )
        }

        return (
                <Box sx={{ position: 'relative' }}>
                        <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left'
                                }}
                                transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left'
                                }}
                        >
                                {menuItems.map((item) => (
                                        <Box
                                                key={item.label}
                                                sx={{ position: 'relative' }}
                                                onMouseEnter={(e) => handleHover(item.label, e)}
                                                onClick={(e) => handleHover(item.label, e)}
                                                onMouseLeave={handleLeave}
                                        >
                                                <MenuItem
                                                        sx={styles.menuItem}
                                                        onClick={() => handleMenuClick(item)}
                                                >
                                                        {item.label}
                                                        {item.subMenu && <KeyboardArrowRightIcon />}
                                                </MenuItem>
                                                {(item.label === 'Bank account' ||
                                                        item.label === 'Payee Name' ||
                                                        item.label === 'Tags' ||
                                                        item.label === 'Account Nickname' ||
                                                        item.label === 'Status' ||
                                                        item.label === 'Issued Date' || item.label === 'Created As') && (
                                                        <Popper
                                                                key={`popper-${item.label}`}
                                                                open={hoveredItem === item.label}
                                                                anchorEl={subAnchorEl}
                                                                placement={
                                                                        item.label === 'Issued Date' && isMobile
                                                                                ? 'top'
                                                                                : 'right-start'
                                                                }
                                                                style={{ zIndex: 1300 }}
                                                                sx={{
                                                                        ...(item.label === 'Issued Date' && styles.issueddatepaper)
                                                                }}
                                                        >
                                                                <ClickAwayListener
                                                                        onClickAway={() => {
                                                                                setHoveredItem(null)
                                                                        }}
                                                                >
                                                                        {renderSubMenu(item.label)}
                                                                </ClickAwayListener>
                                                        </Popper>
                                                )}
                                        </Box>
                                ))}
                        </Menu>
                </Box>
        )
}

export default FilterMenu

// UserManagement/components/FilterMenu.tsx
import { useState, useMemo, useEffect } from 'react'
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'  
import { styles } from './styles'
import { SearchIcon } from '../../../../components/Icons'
import { CustomButton } from '../../../../components/buttons/CustomButton'


const FilterMenu = ({
  anchorEl,
  setAnchorEl,
  setFilterList,
  filterList,
  setPage
}) => {
  dayjs.extend(quarterOfYear)
  const [subAnchorEl, setSubAnchorEl] = useState(null)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [subMenuSearch, setSubMenuSearch] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Date state for custom range
  const [startDate, setStartDate] = useState(dayjs())
  const [endDate, setEndDate] = useState(dayjs())

	const statuses = useMemo(
		() => [
			{
				value: 'none',
				key: 'status',
				label: 'Status',
				labelValue: 'None'
			},
			{
				value: 'trialing',
				key: 'status',
				label: 'Status',
				labelValue: 'Trialing'
			},
			{
				value: 'active',
				key: 'status',
				label: 'Status',
				labelValue: 'Active'
			},
			{
				value: 'unpaid',
				key: 'status',
				label: 'Status',
				labelValue: 'Unpaid'
			},
			{
				value: 'cancelled',
				key: 'status',
				label: 'Status',
				labelValue: 'Cancelled'
			},
			{
				value: 'expired',
				key: 'status',
				label: 'Status',
				labelValue: 'Expired'
			},
			{
				value: 'past_due',
				key: 'status',
				label: 'Status',
				labelValue: 'Past due'
			}
		],
		[]
	)



  const handleClose = () => {
    setAnchorEl(null)
    setHoveredItem(null)
  }

  const handleHover = (label, e) => {
    setHoveredItem(label)
    setSubAnchorEl(e.currentTarget)
    setSubMenuSearch('')
  }

  const handleLeave = () => {
    setHoveredItem(null)
    setSubAnchorEl(null)
  }

  const handleMenuClick = (item) => {
    if (!item.subMenu) {
      setFilterList((prev) => ({
        ...prev,
        singleFilter: prev.singleFilter?.includes(item.label)
          ? prev.singleFilter
          : [...(prev.singleFilter || []), item.label]
      }))
      setAnchorEl(null)
      setHoveredItem(null)
      setPage(1)
    }
  }

  const handleSubMenu = (key, item) => {
    setFilterList((prev) => {
      const currentItems = prev.multiFilter[key] || []
      const exists = currentItems.some((i) => JSON.stringify(i) === JSON.stringify(item))
      const updatedItems = exists
        ? currentItems.filter((i) => JSON.stringify(i) !== JSON.stringify(item))
        : [...currentItems, item]

      return {
        ...prev,
        multiFilter: {
          ...prev.multiFilter,
          [key]: updatedItems
        }
      }
    })
    setPage(1)
  }

  // Quick ranges (based on today)
  const [ranges, setRanges] = useState({})
  useEffect(() => {
    const today = dayjs()

    const thisWeekStart = today.startOf('week')
    const thisWeekEnd = today.endOf('week')

    const thisMonthStart = today.startOf('month')
    const thisMonthEnd = today.endOf('month')

    const qStart = today.startOf('quarter')
    const qEnd = today.endOf('quarter')

    const thisYearStart = today.startOf('year')
    const thisYearEnd = today.endOf('year')

    const lastWeekStart = thisWeekStart.subtract(1, 'week')
    const lastWeekEnd = thisWeekEnd.subtract(1, 'week')

    const lastMonthStart = thisMonthStart.subtract(1, 'month')
    const lastMonthEnd = lastMonthStart.endOf('month')

    const lastQuarterStart = qStart.subtract(1, 'quarter')
    const lastQuarterEnd = lastQuarterStart.endOf('quarter')

    const lastYearStart = thisYearStart.subtract(1, 'year')
    const lastYearEnd = lastYearStart.endOf('year')

    const fmt = (d) => d.format('MM/DD/YYYY')

    setRanges({
      'This Week':    { start: fmt(thisWeekStart),  end: fmt(thisWeekEnd) },
      'This Month':   { start: fmt(thisMonthStart), end: fmt(thisMonthEnd) },
      'This Quarter': { start: fmt(qStart),         end: fmt(qEnd) },
      'This Year':    { start: fmt(thisYearStart),  end: fmt(thisYearEnd) },
      'Last Week':    { start: fmt(lastWeekStart),  end: fmt(lastWeekEnd) },
      'Last Month':   { start: fmt(lastMonthStart), end: fmt(lastMonthEnd) },
      'Last Quarter': { start: fmt(lastQuarterStart), end: fmt(lastQuarterEnd) },
      'Last Year':    { start: fmt(lastYearStart),  end: fmt(lastYearEnd) }
    })
  }, [])

  const handleDateRange = (label) => {
    if (label === 'Custom') {
      const start = startDate ? startDate.format('MM/DD/YYYY') : ''
      const end = endDate ? endDate.format('MM/DD/YYYY') : ''
      setFilterList((prev) => ({
        ...prev,
        dateRange: { label: 'Custom', start, end }
      }))
    } else {
      const picked = ranges[label]
      setFilterList((prev) => ({
        ...prev,
        dateRange: { label, ...picked }
      }))
    }
    setHoveredItem(null)
    setAnchorEl(null)
    setPage(1)
  }

  const menuItems = [
    { label: 'Status', subMenu: true },
    { label: 'Registered Date', subMenu: true } // new
  ]

  const renderSubMenu = (label) => {
    const isDate = label === 'Registered Date'

    return (
      <Paper
        elevation={3}
        sx={{
          p: 1,
          minWidth: { xs: isDate ? 280 : 180, md: isDate ? 360 : 220 },
          marginLeft: { xs: '4px', md: 0 }
        }}
      >
        {!isDate && (
          <TextField
            placeholder="Search"
            sx={styles.searchField}
            value={subMenuSearch}
            onChange={(e) => setSubMenuSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={styles.searchIconContainer}>
                  <SearchIcon sx={styles.searchIcon} />
                </InputAdornment>
              )
            }}
          />
        )}

        {/* Status submenu */}
        {label === 'Status' &&
          statuses
            .filter((p) => p.labelValue.toLowerCase().includes(subMenuSearch.toLowerCase()))
            .map((status) => (
              <MenuItem
                key={`status-${status.value}`}
                sx={styles.subMenuItem}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubMenu('Status', status)
                }}
              >
                <Checkbox
                  checked={(filterList.multiFilter['Status'] || []).some((i) => i.value === status.value)}
                  sx={styles.checkbox}
                />
                <ListItemText sx={styles.subMenuItemText} primary={status.labelValue} />
              </MenuItem>
            ))}

        {/* Registered Date submenu */}
        {isDate && (
          <Box>
            <Typography sx={styles.dateRangeTitle}>Date Range</Typography>
            <Divider sx={styles.divider} />

            {[
              'This Week',
              'This Month',
              'This Quarter',
              'This Year',
              'Last Week',
              'Last Month',
              'Last Quarter',
              'Last Year'
            ].map((key) => (
              <MenuItem key={key} sx={styles.dateSubMenuItem} onClick={() => handleDateRange(key)}>
                <Typography sx={styles.dateRangeText}>{key}</Typography>
                <Typography sx={styles.dateRange}>
                  {ranges[key]?.start} - {ranges[key]?.end}
                </Typography>
              </MenuItem>
            ))}

            <Divider sx={styles.divider} />

            <Typography sx={styles.dateRangeTitle}>Custom Range</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  slotProps={{ textField: { size: 'small', sx: styles.datePicker } }}
                />
                <DatePicker
                  label="To"
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                  slotProps={{ textField: { size: 'small', sx: styles.datePicker } }}
                />
              </Box>
            </LocalizationProvider>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <CustomButton
                variant="outlined"
                color="primary"
                sx={{ height: 32 }}
                onClick={() => handleDateRange('Custom')}
              >
                Apply
              </CustomButton>
            </Box>
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {menuItems.map((item) => (
          <Box
            key={item.label}
            sx={{ position: 'relative' }}
            onMouseEnter={(e) => handleHover(item.label, e)}
            onClick={(e) => handleHover(item.label, e)}
            onMouseLeave={handleLeave}
          >
            <MenuItem sx={styles.menuItem} onClick={() => handleMenuClick(item)}>
              {item.label}
              {item.subMenu && <KeyboardArrowRightIcon />}
            </MenuItem>

            {item.subMenu && (
              <Popper
                key={`popper-${item.label}`}
                open={hoveredItem === item.label}
                anchorEl={subAnchorEl}
                placement={item.label === 'Registered Date' && isMobile ? 'top' : 'right-start'}
                style={{ zIndex: 1300 }}
              >
                <ClickAwayListener onClickAway={() => setHoveredItem(null)}>
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

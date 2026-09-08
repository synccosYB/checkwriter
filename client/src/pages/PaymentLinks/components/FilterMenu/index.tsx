import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styles } from './styles';
import { SearchIcon } from '../../../../components/Icons';
import { CustomButton } from '../../../../components/buttons/CustomButton';
import usePayees from '../../../../API/payees/usePayees';
import { date } from 'yup';
import { useDebouncedCallback } from '../../../../utils/hooks/useDebouncedCallback';

interface RecipientInfo {
  name: string;
  email: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface DateRanges {
  thisWeek: DateRange;
  thisMonth: DateRange;
  thisQuarter: DateRange;
  thisYear: DateRange;
  lastWeek: DateRange;
  lastMonth: DateRange;
  lastQuarter: DateRange;
  lastYear: DateRange;
}

interface FilterListType {
  multiFilter: {
    [key: string]: string[];
  };
}

interface FilterMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setFilterList: any;
  filterList: FilterListType;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ anchorEl, setAnchorEl, setFilterList, filterList }) => {
  const [subAnchorEl, setSubAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const { data: payeesData } = usePayees()
  const recipientName = payeesData?.data?.map((payee) => ({
    value: payee._id,
    name: payee.name,
    email: payee.email
  })) || [];


  const status = [{
    value:'Paid',
    label: 'paid',
  },{
    value: 'Pending',
    label: 'pending',
  }, {
    value: 'Canceled',
    label: 'canceled',
  }, {
    value: 'Expired',
    label: 'expired',
  }]

  const [dateRanges, setDateRanges] = useState<DateRanges>({
    thisWeek: { start: '', end: '' },
    thisMonth: { start: '', end: '' },
    thisQuarter: { start: '', end: '' },
    thisYear: { start: '', end: '' },
    lastWeek: { start: '', end: '' },
    lastMonth: { start: '', end: '' },
    lastQuarter: { start: '', end: '' },
    lastYear: { start: '', end: '' },
  });

  useEffect(() => {
    const today = new Date();

    // This Week
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    // This Month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // This Quarter
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const thisQuarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
    const thisQuarterEnd = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);

    // This Year
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    const thisYearEnd = new Date(today.getFullYear(), 11, 31);

    // Last Week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

    // Last Month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Last Quarter
    const lastQuarterStart = new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1);
    const lastQuarterEnd = new Date(today.getFullYear(), currentQuarter * 3, 0);

    // Last Year
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    setDateRanges({
      thisWeek: {
        start: thisWeekStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: thisWeekEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      thisMonth: {
        start: thisMonthStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: thisMonthEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      thisQuarter: {
        start: thisQuarterStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: thisQuarterEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      thisYear: {
        start: thisYearStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: thisYearEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      lastWeek: {
        start: lastWeekStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: lastWeekEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      lastMonth: {
        start: lastMonthStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: lastMonthEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      lastQuarter: {
        start: lastQuarterStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: lastQuarterEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
      lastYear: {
        start: lastYearStart.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        end: lastYearEnd.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      },
    });
  }, []);

  const handleClose = (): void => {
    setAnchorEl(null);
    setHoveredItem(null);
  };

  const handleHover = (item: string, e: React.MouseEvent<HTMLLIElement>): void => {
    setHoveredItem(item);
    setSubAnchorEl(e.currentTarget);
  };

  const handleLeave = (): void => {
    setHoveredItem(null);
    setSubAnchorEl(null);
  };

  interface MenuItem {
    label: string;
    subMenu: boolean;
  }


  const handleSubMenu = (key: string, val: string, id: string): void => {
    setFilterList((prevFilter: FilterListType) => {
      if(key === 'Recipient Name'){
        return {
        ...prevFilter,
        multiFilter: {
          ...prevFilter.multiFilter,
          [key]: (prevFilter.multiFilter[key] || []).includes(val) 
            ? (prevFilter.multiFilter[key] || []).filter((item:any) => item !== val) 
            : [...(prevFilter.multiFilter[key] || []), val],
          "email": (prevFilter.multiFilter["email"] || []).includes(id) 
            ? (prevFilter.multiFilter["email"] || []).filter((item:any) => item !== id) 
            : [...(prevFilter.multiFilter["email"] || []), id]
        }
        };
      }
      else if (key === 'Custom Search'){
        return {
          ...prevFilter,
          multiFilter: {
            ...prevFilter.multiFilter,
            'Custom Search': val
          }
        }
      }
      else{
        return {
        ...prevFilter,
        multiFilter: {
          ...prevFilter.multiFilter,
          [key]: (prevFilter.multiFilter[key] || []).includes(val) 
            ? (prevFilter.multiFilter[key] || []).filter((item:any) => item !== val) 
            : [...(prevFilter.multiFilter[key] || []), val]
        }
        };
      }
      
    });
  };


  const handleDateRange = (val: string, startDate: string, endDate: string): void => {
    setFilterList((prevFilter: FilterListType) => {
      return {
        ...prevFilter,
        multiFilter: {
          ...prevFilter.multiFilter,
          "Date Ranges": [val],
          "startDate": startDate,
          "endDate": endDate  
        }
      };
    });
    setHoveredItem(null);
    setAnchorEl(null);
  };

  const menuItems: MenuItem[] = [
    { label: 'Recipient Name', subMenu: true },
    { label: 'Status', subMenu: true },
    { label: 'Date Ranges', subMenu: true },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    handleSubMenu('Custom Search', value, value);
  }

  const renderSubMenu = (item: string) => {
    return (
      <Paper elevation={3} sx={{ p: 1, minWidth: 200 }}>
        {(item !== 'Date Ranges' && item !== 'Status') && (
          <TextField
            placeholder="Search"
            sx={styles.searchField}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={styles.searchIconContainer}>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        {item === 'Recipient Name' && recipientName.map((info) => (
          <MenuItem 
            key={`${info.name}_filter_recipient`} 
            sx={{...styles.subMenuItem, mb: 1}} 
            onClick={() => handleSubMenu(item, info.name, info.email)}
          >
            <Checkbox 
              checked={(filterList.multiFilter['Recipient Name'] || []).includes(info.name)} 
              sx={styles.checkbox} 
            />
            <Box>
              <ListItemText primary={info.name} />
              <Typography sx={{color: '#1e3a5f', textDecoration: 'underline', fontSize: '12px'}}>
                {info.email}
              </Typography>
            </Box>
          </MenuItem>
        ))}

        {item === 'Status' && status.map((statusItem) => (
          <MenuItem 
            key={statusItem.value} 
            sx={styles.subMenuItem} 
            onClick={() => handleSubMenu(item, statusItem.value, '')}
          >
            <Checkbox 
              checked={(filterList.multiFilter['Status'] || []).includes(statusItem.value)} 
              sx={styles.checkbox} 
            />
            <ListItemText primary={statusItem.value} />
          </MenuItem>
        ))}

        {item === 'Date Ranges' && (
          <Box sx={{ minWidth: '360px', p: 1 }}>
            <Typography sx={styles.dateRangeTitle}>Date Range</Typography>
            <Divider sx={styles.divider} />
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("This Week",dateRanges.thisWeek.start, dateRanges.thisWeek.end) }>
              <Typography sx={styles.dateRangeText}>This Week</Typography>
              <Typography>{dateRanges.thisWeek.start} - {dateRanges.thisWeek.end}</Typography>
            </MenuItem>
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("This Month",dateRanges.thisMonth.start, dateRanges.thisMonth.end)} >
              <Typography sx={styles.dateRangeText}>This Month</Typography>
              <Typography>{dateRanges.thisMonth.start} - {dateRanges.thisMonth.end}</Typography>
            </MenuItem>
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("This Quarter", dateRanges.thisQuarter.start, dateRanges.thisQuarter.end)}>
              <Typography sx={styles.dateRangeText}>This Quarter</Typography>
              <Typography>{dateRanges.thisQuarter.start} - {dateRanges.thisQuarter.end}</Typography>
            </MenuItem>
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("This Year", dateRanges.thisYear.start, dateRanges.thisYear.end)}>
              <Typography sx={styles.dateRangeText}>This Year</Typography>
              <Typography>{dateRanges.thisYear.start} - {dateRanges.thisYear.end}</Typography>
            </MenuItem>
            <Divider sx={styles.divider} />
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("Last Week", dateRanges.lastWeek.start, dateRanges.lastWeek.end)}>
              <Typography sx={styles.dateRangeText}>Last Week</Typography>
              <Typography>{dateRanges.lastWeek.start} - {dateRanges.lastWeek.end}</Typography>
            </MenuItem>
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("Last Month", dateRanges.lastMonth.start, dateRanges.lastMonth.end)}>
              <Typography sx={styles.dateRangeText}>Last Month</Typography>
              <Typography>{dateRanges.lastMonth.start} - {dateRanges.lastMonth.end}</Typography>
            </MenuItem>
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("Last Quarter", dateRanges.lastQuarter.start, dateRanges.lastQuarter.end)}>
              <Typography sx={styles.dateRangeText}>Last Quarter</Typography>
              <Typography>{dateRanges.lastQuarter.start} - {dateRanges.lastQuarter.end}</Typography>
            </MenuItem>
            <MenuItem sx={styles.dateSubMenuItem} onClick={() => handleDateRange("Last Year", dateRanges.lastYear.start, dateRanges.lastYear.end)}>
              <Typography sx={styles.dateRangeText}>Last Year</Typography>
              <Typography>{dateRanges.lastYear.start} - {dateRanges.lastYear.end}</Typography>
            </MenuItem>
            <Divider sx={styles.divider} />
            <Typography sx={styles.dateRangeTitle}>Custom Range</Typography>

            <Box sx={styles.customDateContainer}>
              <Box sx={{ width: '50%' }}>
                <Typography sx={{ ...styles.dateRangeText, mb: 1 }}>From</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={startDate}
                    onChange={(newValue: Date | null) => {
                      if (newValue) setStartDate(newValue);
                    }}
                    slotProps={{ textField: { sx: styles.datePicker, size: "small", fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ width: '50%' }}>
                <Typography sx={{ ...styles.dateRangeText, mb: 1 }}>To</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={endDate}
                    onChange={(newValue: Date | null) => {
                      if (newValue) setEndDate(newValue);
                    }}
                    slotProps={{ textField: { sx: styles.datePicker, size: "small", fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <CustomButton
                variant="contained"
                onClick={() => {
                  const formattedStartDate = startDate.toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  });
                  const formattedEndDate = endDate.toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  });
                  
                  handleDateRange(`${formattedStartDate} - ${formattedEndDate}`, formattedStartDate, formattedEndDate);
                }}
              >
                Apply
              </CustomButton>
            </Box>
          </Box>
        )}
      </Paper>
    );
  };

  return (
      <Box sx={{ position: 'relative' }}>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {menuItems.map((item) => (
            <Box
              key={item.label}
              sx={{ position: 'relative' }}
              onMouseEnter={(e:any) => handleHover(item.label, e)}
              onClick={(e:any) => handleHover(item.label, e)}
              onMouseLeave={handleLeave}
            >
              <MenuItem sx={styles.menuItem}>
                {item.label}
                {item.subMenu && <KeyboardArrowRightIcon />}
              </MenuItem>
              {(item.label === 'Recipient Name' || item.label === 'Status' || item.label === 'Date Ranges') && (
                <Popper
                  open={hoveredItem === item.label}
                  anchorEl={subAnchorEl}
                  placement="right-start"
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
    );
};

export default FilterMenu;
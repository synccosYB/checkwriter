export const styles = {
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '200px',
    '&:hover': {
      backgroundColor: '#1e3a5f1A',
      color: '#1e3a5f'
    },
  },
  subMenu: {
    position: 'absolute',
    left: '100%',
    top: 0,
    minWidth: '200px',
    backgroundColor: 'white',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    zIndex: 1300,
  },
  subMenuItem: {
    p: 0,
    '&:hover': {
      backgroundColor: '#1e3a5f1A',
      color: '#1e3a5f'
    },
  },
  dateSubMenuItem: {
    py:1, 
    px:2,
    display: "flex",
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: '#1e3a5f1A',
      color: '#1e3a5f'
    },
  },
  searchField: {
    minWidth: {
      xs: 'calc(100% - 109px)',
      sm: '190px'
    },

    '& .MuiOutlinedInput-root': {
      height: { xs: '32px', sm: '40px' },
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      mb: "8px",
      '& fieldset': {
        borderColor: '#e2e8f0',
      },
      '&:hover fieldset': {
        borderColor: '#e2e8f0',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#e2e8f0',
        borderWidth: '1px',
      },
      '&.Mui-focused': {
        backgroundColor: '#F9FAFB',
      }
    },
    '& .MuiOutlinedInput-input': {
      padding: { xs: '6px 12px', sm: '8px 12px' },
      fontSize: { xs: '12px', sm: '14px' },
      lineHeight: { xs: '16px', sm: '20px' },
      '&::placeholder': {
        color: '#6B7280',
        opacity: 1,
      },
    }
  },
  searchIcon: {
    color: '#6B7280',
    fontSize: { xs: '18px', sm: '24px' }
  },
  searchIconContainer: {
    ml: { xs: 0.5, sm: 1 }
  },
  checkbox: {
    borderRadius: '4px',
  },
  dateRangeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000000DE'
  },
  divider: {
    backgroundColor: '#e2e8f0',
    margin: '8px 0',
  },
  dateRangeText: {
    fontSize: '14px',
    fontWeight: '600'
  },
  customDateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    mt: 1,
    mb: 2
  },
  datePicker: {
    '& .MuiOutlinedInput-root': {
      height: '40px !important',
      width: '160px',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#e2e8f0',
      },
      '&:hover fieldset': {
        borderColor: '#e2e8f0',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#e2e8f0',
        borderWidth: '1px',
      },
      '&.Mui-focused': {
        backgroundColor: '#F9FAFB',
      }
    },
    '& .MuiOutlinedInput-input': {
      padding: { xs: '6px 12px', sm: '8px 12px' },
      fontSize: { xs: '12px', sm: '14px' },
      lineHeight: { xs: '16px', sm: '20px' },
      height: '40px !important',
    }
  }
}; 


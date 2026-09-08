export const styles = {
  wrapper: {
    px: { sm: 3, xs: 1 },
    py: 3,
    width: '100%'
  },
  title: {
    fontSize: {
      xl: '24px',
      sm: '22px',
      xs: '20px',
    },
    lineHeight: {
      xl: '30px',
      sm: '28px',
      xs: '24px',
    },
    fontWeight: 600,
    mb: '8px',
    color: '#1a1a2e',
  },
  description: {
    fontSize: {
      xl: '15px',
      sm: '14px',
      xs: '13px',
    },
    lineHeight: {
      xl: '22px',
      sm: '20px',
      xs: '18px',
    },
    maxWidth: '710px',
    color: '#64748b',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: { sm: '24px', xs: '16px' },
    position: 'relative',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
    mb: '24px',
    backgroundColor: '#ffffff',
  },
  cardContent: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { sm: 'center', xs: 'flex-end' },
    justifyContent: 'space-between',
    gap: '16px',
  },
  logoAndCheckmark: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: '16px',
  },
  logo: {
    height: { sm: '48px', xs: '32px' },
  },
  cardContentText: {
    fontSize: { sm: '16px', xs: '14px' },
  },
  tabs: {
    mb: '24px',
    borderBottom: '1px solid #e2e8f0',
    '& .MuiTabs-indicator': {
      // backgroundColor: '#058205',
    },
  },
  tab: {
    fontSize: { sm: '16px', xs: '14px' },
    textTransform: 'none',
  },
  mappingContainer: {
    display: 'flex',
    flexDirection: { xs: 'column',sm: 'column', lg: 'row' },
    gap: '24px',
  },
  mapContainer: {
    flex: 1,
  },
  mapTitle: {
    fontSize: { sm: '24px', xs: '20px' },
    fontWeight: 600,
    mb: '16px',
  },
  searchField: {
    mb: '24px',
    minWidth: {
      xs: 'calc(100% - 109px)',
      sm: '190px'
    },

    '& .MuiOutlinedInput-root': {
      height: { xs: '32px', sm: '40px' },
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#E5E7EB',
      },
      '&:hover fieldset': {
        borderColor: '#E5E7EB',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#E5E7EB',
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
  tableText: {
    fontSize: {lg: '14px', sm: '12px', xs: '10px' },
  },
  tableLabelText: {
    fontSize: { lg: '12px', sm: '10px', xs: '8px' },
  },
  paginationContainer: {
    mt: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    maxWidth: '1040px',
    '& .MuiPagination-ul': {
      gap: 0
    }
  },
  paginationItem: {
    margin: 0,
    borderRadius: 0,
    border: '1px solid #E5E7EB',
    borderRight: 'none',
    px: {xl: '24px',md: '14px', sm: '12px', xs: '8px'},
    height: {lg: '47px', sm: '40px', xs: '32px'},
    display: 'flex',
    alignItems: 'center',
    background: '#FFFFFF',
    '&.MuiPaginationItem-root': {
      borderRadius: 0,
      margin: 0
    },
    '&.Mui-selected': {
      background: 'rgba(30, 58, 95, 0.1)',
      border: '1px solid #1e3a5f',
      borderRight: 'none',
      color: '#000',
      '&:hover': {
        background: 'rgba(30, 58, 95, 0.1)',
      }
    },
    '&:hover': {
      background: 'rgba(30, 58, 95, 0.05)',
    },
    '&:last-child': {
      borderRight: '1px solid #E5E7EB',
      '&.Mui-selected': {
        borderRight: '1px solid #1e3a5f',
      }
    }
  },
  pagination: {
    '& .MuiPagination-ul': {
      gap: 0
    }
  },


  dialog: {
    width: {
      xs: "100%",
      sm: "607px",
    },
    maxWidth: "685px",
    minHeight: "252px",
    borderRadius: "12px",
    m: { xs: 2, sm: 0 },
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    px: { xs: 2, sm: 3 },
    pt: { xs: 2, sm: 3 },
    mb: "24px",
  },
  dialogTitle: {
    fontSize: {
      xs: "24px",
      sm: "32px",
    },
    lineHeight: {
      xs: "28px",
      sm: "36px",
    },
    p: 0,
    m: 0,
    fontWeight: 600,
  },
  dialogCloseButton: {
    p: 0,
    color: "#1e3a5f",
    "& .MuiSvgIcon-root": {
      width: {
        xs: "20px",
        sm: "24px",
      },
      height: {
        xs: "20px",
        sm: "24px",
      },
    },
  },
  dialogContent: {
    px: { xs: 2, sm: 3 },

    fontSize: {
      xs: "14px",
      sm: "18px",
    },
    lineHeight: {
      xs: "20px",
      sm: "24px",
    },
  },
  dialogActions: {
    p: { xs: 2, sm: 3 },
    gap: "12px",
  },
  deleteDialogActions: {
    pb: { xs: 3, sm: 4 },
    pt: { xs: 2, sm: 3 },
    gap: "12px",
    justifyContent: "center",
  },
  alertIconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "120px",
    mb: "16px",
  },
  alertIconBorder: {
    width: "120px",
    height: "120px",
    backgroundColor: "#F03D3E1D",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  alertIconMain: {
    width: "100px",
    height: "100px",
    backgroundColor: "#F03D3E",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "& .MuiSvgIcon-root": {
      color: "#fff",
      width: "50px",
      height: "50px",
    },
  },
  cancelButton: {
    fontSize: '14px',
    lineHeight: '20px',
    height: '40px',
    minWidth: '100px',
    color: '#000000DE',
    border: 'none',
    textTransform: 'none',
    '&:hover': {
      border: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  confirmButton: {
    fontSize: '14px',
    lineHeight: '20px',
    height: '40px',
    width: '100px',
    textTransform: 'none',
    borderRadius: '6px',
    backgroundColor: '#1e3a5f',
    '&:hover': {
      backgroundColor: '#152d4a'
    }
  },
  select: {
    width: '100%',
    height: "40px",
    backgroundColor: "#fff",
    "& .MuiSelect-select": {
      padding: "12px 16px",
      fontSize: "14px",
      lineHeight: "20px",
      color: "#000000DE",
    },
    "& .MuiSvgIcon-root": {
      color: "#000000DE",
    },
  },
  subMenuItem: {
    p: 0,
    px: 1,
    fontSize: {sm: '16px', xs: '14px'},
    '&:hover': {
      backgroundColor: '#1e3a5f1A',
      color: '#1e3a5f'
    },
  },
  input: {
    width: '100%',

    "& .MuiOutlinedInput-root": {
      height: "40px",
      backgroundColor: "#fff",

      "& fieldset": {
        borderColor: "#e2e8f0",
      },
      "&:hover fieldset": {
        borderColor: "#e2e8f0",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1e3a5f",
      },
    },
  },
};

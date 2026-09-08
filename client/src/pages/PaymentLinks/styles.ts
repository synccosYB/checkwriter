export const styles = {
  wrapper: {
    p: 3,
    width: '100%'
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: '48px'
  },
  title: {
    fontSize: {
      xs: '20px',
      sm: '24px'
    },
    lineHeight: {
      xs: '24px',
      sm: '30px'
    },
    fontWeight: 600,
    mb: '8px',
    color: '#1a1a2e',
  },
  description: {
    fontSize: {
      xs: '14px',
      sm: '15px'
    },
    lineHeight: {
      xs: '20px',
      sm: '22px'
    },
    maxWidth: '710px',
    color: '#64748b',
  },
  helpIcon : {
    fontSize: '20px',
    color: "#00000099"
  },
  actionContainer: {
    display: 'flex',
    flexDirection: {
      sm: 'column',
      md: 'row'
    },
    justifyContent: 'space-between',
    alignItems: {
      md: 'center'
    },
    maxWidth: '1040px',
    mb: '20px',
    gap: '12px'
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
  searchIcon: {
    color: '#6B7280',
    fontSize: { xs: '18px', sm: '24px' }
  },
  searchIconContainer: {
    ml: { xs: 0.5, sm: 1 }
  },
  actionButtons: {
    display: 'flex',
    gap: '12px'
  },
  searchContainer: {
    display: 'flex',
    gap: '12px'
  },
  actionDeleteButton: {
    color: '#B31F0D',
    border: '1px solid #B31F0D',
    backgroundColor: '#B31F0D0D',
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: '#B31F0D'
    },
    '&:disabled': {
      svg: {
        color: '#0000001A'
      }
    }
  },
  actionButton: {
    color: '#000',
    border: '1px solid #e2e8f0',
    backgroundColor: 'transparent',
    textTransform: "none",
    fontSize: "14px",
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: '#1e3a5f'
    },
    '&:disabled': {
      cursor: "pointer",
      svg: {
        color: '#0000001A',
        stroke: '#0000001A'
      }
    }
  },
  paginationContainer: {
    mt: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    maxWidth: '1040px',
    '& .MuiPagination-ul': {
      gap: 0
    }
  },
  popoverPaper: {
    width: '343px',
    borderRadius: '12px',
    boxShadow: '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
    mt: '12px'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: '16px',
  },
  filterTitle: {
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 500
  },
  closeButton: {
    p: 0,
    color: '#6B7280'
  },
  filterContent: {
    p: '16px'
  },
  filterOption: {
    height: '40px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#E5E7EB',
    }
  },
  filterOptionText: {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#6B7280'
  },
  filterArrow: {
    width: '20px',
    height: '20px',
    color: '#6B7280',
    transition: 'transform 0.2s'
  },
  filterOptionsContainer: {
    mt: '4px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
    zIndex: 1
  },
  filterOptionItem: {
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: '#F9FAFB'
    }
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
  paginationItem: {
    margin: 0,
    borderRadius: 0,
    border: '1px solid #E5E7EB',
    borderRight: 'none',
    padding: '14px 24px',
    height: '47px',
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


  menuPaper: {
    width: "183px",
    boxShadow:
      "0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)",
    mt: "4px",
    borderRadius: "8px",
  },
  menuItem: {
    fontSize: "14px",
    lineHeight: "20px",
    padding: "10px 16px",
    height: "41px",
    display: "flex",
    alignItems: "center",
    color: "#1e3a5f",
    gap: "8px",
    "&:hover": {
      backgroundColor: "#F9FAFB",
    },
  },
  moreButton: {
    color: "#e2e8f0",
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },
  tagTablePaper: {
    minWidth: '170px',
    boxShadow: '0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03)',
    borderRadius: '8px',
    overflow: 'hidden',
    transform: 'translateX(-50%)',
    marginLeft: '50%',
    p: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '12px',
    border: '1px solid #F5F5F5'
  },
   attachmentMenuItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    px: '8px',
    py: '4px'
  },
  attachmentIconContainer: {
    width: '30px',
    height: '30px',
    p: '5px',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  attachmentDragDrop: {
    borderRadius: '8px',
    padding: '24px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
    cursor: 'pointer'
  },
  addAttachmentButton: {
    border: '1px dashed #00000099',
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '40px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '4px',
    flex: 1,
    justifyContent: 'space-between'
  },
  fileNameTable: {
    fontSize: '16px',
    color: '#000000DE',
    wordBreak: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  checkBottomItemlabel: {
    fontSize: '18px',
    color: '#000000DE',
    fontWeight: '600',
  },
   input: {
    width: '190px',

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
  formContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: '24px',
    gap: '24px'
  },
  formItemContainer : {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formItemLabel: {
    fontSize: '18px',
    color: '#000000DE',
    fontWeight: '600',
  },
  select: {
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
   errorText: {
    fontSize: "12px",
    lineHeight: "16px",
    color: "#DC2626",
    marginTop: "4px",
  },

}; 

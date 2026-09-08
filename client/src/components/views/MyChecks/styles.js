export const styles = {
    wrapper: {
      p: '10px',
      width: '100%'
    },
    title: {
      fontSize: {
        xs: '24px',
        sm: '32px'
      },
      lineHeight: {
        xs: '28px',
        sm: '36px'
      },
      fontWeight: 600,
      mb: '12px'
    },
    description: {
      fontSize: {
        xs: '16px',
        sm: '20px'
      },
      lineHeight: {
        xs: '20px',
        sm: '22px'
      },
      maxWidth: '710px',
      mb: '48px'
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
        sm: '400px'
      },
      '& .MuiOutlinedInput-root': {
        height: { xs: '36px', sm: '40px' },
        backgroundColor: '#F9FAFB',
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
    actionDeleteButton: {
      color: '#B31F0D',
      border: '1px solid #B31F0D',
      backgroundColor: '#B31F0D0D',
      '&:hover' : {
        backgroundColor: 'transparent',
        borderColor: '#B31F0D'
      },
      '&:disabled' : {
        svg: {
          color: '#0000001A'
        }
      }
    },
    actionButton: {
      color: '#000',
      border: '1px solid #777777',
      backgroundColor: 'transparent',
      '&:hover' : {
        backgroundColor: 'transparent',
        borderColor: '#1e3a5f'
      },
      '&:disabled' : {
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
    dialog: {
      width: {
        xs: '100%',
        sm: '685px'
      },
      maxWidth: '685px',
      minHeight: '252px',
      borderRadius: '12px',
      p: { xs: 2, sm: 3 },
      m: { xs: 2, sm: 0 }
    },
    dialogHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      mb: '24px'
    },
    dialogTitle: {
      fontSize: {
        xs: '24px',
        sm: '32px'
      },
      lineHeight: {
        xs: '28px',
        sm: '36px'
      },
      p: 0,
      m: 0
    },
    dialogCloseButton: {
      p: 0,
      color: '#1e3a5f',
      '& .MuiSvgIcon-root': {
        width: {
          xs: '20px',
          sm: '24px'
        },
        height: {
          xs: '20px',
          sm: '24px'
        }
      }
    },
    dialogContent: {
      fontSize: {
        xs: '14px',
        sm: '18px'
      },
      lineHeight: {
        xs: '20px',
        sm: '24px'
      }
    },
    dialogActions: {
      p: 0,
      mt: '32px',
      gap: '12px'
    },
    cancelButton: {
      fontSize: '14px',
      lineHeight: '20px',
      height: '40px',
      width: '100px',
      color: '#1e3a5f',
      border: 'none',
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
      backgroundColor: '#1e3a5f',
      '&:hover': {
        backgroundColor: '#1a3850'
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
    }
  }; 
export const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 24px 51px 24px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
  },

  sectionTitle: {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 600,
    marginBottom: '18px',
    color: '#111827'
  },
  appListContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  emailListContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '24px'
  },
  phoneListContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '24px',
    marginBottom: '24px'
  },


  appInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  appTextContainer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    border: '1px solid #1e3a5f',
    borderRadius: '4px',
    padding: '7px 8px'
  },

  appName: {
    fontSize: '10px',
    lineHeight: '10px',
    color: '#1e3a5f',
    fontWeight: 500
  },
  setionDescription: {
    marginTop: 0,
    marginBottom: '16px',
    fontSize: '18px',
    lineHeight: '22px',
    color: '#6B7280'
  },
  description: {
    fontSize: '18px',
    lineHeight: '22px',
    color: '#6B7280',
    marginTop: '32px',
    textAlign: 'left'
  },
  methodLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: {
      xs: '100%',
    }
  },
  divider: {
    borderColor: '#E5E7EB',
    margin: '24px 0'
  },
  deliveryGroup: {
    gap: '32px',
    display: 'flex',
  },

  radio: {
    color: '#D1D5DB',
    '&.Mui-checked': {
      color: '#1e3a5f'
    }
  },
  phoneFlag: {
    width: '24px',
    height: '24px',
    '& .special-label': {
      display: 'none'
    },
    '& .selected-flag': {
      width: '24px',
      height: '24px',
      padding: 0,
      backgroundColor: 'transparent !important'
    },
    '& .flag': {
      transform: 'scale(0.75)'
    },
    '& input': {
      fontSize: '20px',
      lineHeight: '24px',
      color: '#6B7280'
    }
  },
  phoneInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  flagContainer: {
    width: '24px',
    height: '24px'
  },

  flagInput: {
    width: '24px',
    height: '24px',
    display: 'none',
    border: 'none',
    pointerEvents: 'none',
    background: 'transparent',
    padding: '0',
    paddingLeft: '30px',
    margin: '0',
    fontSize: '20px',
    lineHeight: '24px',
    color: '#6B7280'
  },
  flagButton: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '0',
    margin: '0',
    width: '24px',
    height: '24px',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  phoneNumber: {
    fontSize: '16px',
    lineHeight: '20px',
    color: '#6B7280',
  },

  defaultTextStyle: {
    fontSize: '12px',
    lineHeight: '16px',
    color: '#058205',
    backgroundColor: 'rgba(5, 130, 5, 0.1)',
    padding: '10px 16px',
    borderRadius: '4px'
  },
  verificationSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: '24px',
    width: '100%'
  },
  codeInputContainer: {
    display: 'flex',
    gap: '16px',
  },
  codeInput: {
    width: '40px',
    height: '40px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '16px',
    '&:focus': {
      outline: 'none',
      borderColor: '#1e3a5f'
    }
  },
  resendSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '40px'
  },
  timer: {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#6B7280'
  },
  resendText: {
    fontSize: '18px',
    lineHeight: '22px',
    color: '#6B7280'
  },
  resendActiveText: {
    fontSize: '18px',
    lineHeight: '22px',
    color: '#1e3a5f',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  cancelButton: {
    height: '40px',
    padding: '0 16px',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#6B7280',
    textTransform: 'none'
  },
  continueButton: {
    height: '40px',
    padding: '0 16px',
    fontSize: '14px',
    lineHeight: '20px',
    backgroundColor: '#1e3a5f',
    color: '#fff',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#1a3850'
    }
  },
  verifyButton: {
    height: '40px',
    padding: '0 16px',
    fontSize: '14px',
    lineHeight: '20px',
    backgroundColor: '#1e3a5f',
    color: '#fff',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#1a3850'
    }
  },
  error: {
    color: '#B42318',
    fontSize: '14px',
    lineHeight: '20px',
    marginTop: '8px',
    marginBottom: '32px'
  }
}; 
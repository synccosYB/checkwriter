export const styles = {
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      paddingBottom: '16px'
    },
    description: {
      fontSize: '18px',
      lineHeight: '24px',
      color: '#6B7280'
    },
    radioGroup: {
      flexDirection: 'column',
      marginLeft: '2px',
      marginTop: '4px',
      width: 'calc(100% - 20px)',
      gap: '12px'
    },
    controlContainer: {
      display: 'flex',
      flexGrow: '1',
      marginLeft: '0',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
    },
    radio: {
      color: '#D1D5DB',
      marginLeft: 'auto',
      '&.Mui-checked': {
        color: '#1e3a5f'
      }
    },
    radioLabelContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '10px'
    },
    radioLabelLeftSection:{
      display: 'flex',
      height: '100%',
      width: 'auto',
      padding: '4px',
    },
    radioLabelRightSection:{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    radioLabelTitle:{
      fontSize: '18px',
      lineHeight: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    radioLabelDescription:{
      fontSize: '12px',
      lineHeight: '16px',
      color: '#6B7280'
    },
    cancelButton: {
      height: '40px',
      fontSize: '14px',
      lineHeight: '17px',
      textTransform: 'none'
    },
    nextButton: {
      height: '40px',
      fontSize: '14px',
      lineHeight: '17px',
      backgroundColor: '#1e3a5f',
      textTransform: 'none',
      color: '#fff',
      borderRadius: '6px !important',
      '&:hover': {
        backgroundColor: '#1a3850'
      }
  
    },
    blueText: {
      color: '#1e3a5f',
      display: 'inline'
    }
  }; 
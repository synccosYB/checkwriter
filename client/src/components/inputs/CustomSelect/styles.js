export const styles = {
  select: {
    height: { xs: '32px', sm: '36px' },
    backgroundColor: '#F9FAFB',
    '& .MuiSelect-select': {
      padding: { xs: '6px 12px', sm: '8px 12px' },
      fontSize: { xs: '12px', sm: '14px' },
      lineHeight: { xs: '16px', sm: '20px' },
      display: 'flex',
      alignItems: 'center',
    },
    // '& .MuiSelect-icon': {
    //   width: { xs: '16px', sm: '20px' },
    //   height: { xs: '16px', sm: '20px' },
    //   right: { xs: '6px', sm: '8px' },
    //   color: props => props.disabled ? '#9CA3AF' : '#6B7280'
    // },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5E7EB',
    }
  },
  primaryVariant: {
    color: '#1e3a5f',
    backgroundColor: 'rgba(30, 58, 95, 0.05)',
    '& .MuiSelect-icon': {
      color: props => props.disabled ? '#9CA3AF' : '#1e3a5f'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #1e3a5f',
    }
  },
  smallSize: {
    height: '31px',
    '& .MuiSelect-select': {
      fontSize: '12px',
      lineHeight: '14.5px',
      padding: '4px 8px',
    }
  },
  menuItem: {
    fontSize: props => props.size === 'small' ? '12px' : '14px',
    lineHeight: props => props.size === 'small' ? '14.5px' : '20px',
    color: props => props.color === 'primary' ? '#1e3a5f' : '#6B7280',
    padding: props => props.size === 'small' ? '8px' : '8px 12px',
  }
}; 
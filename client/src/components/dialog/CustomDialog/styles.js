export const styles = {
  paper: {
    minWidth: '400px',
    borderRadius: '12px',
    p: { xs: 2, sm: 3 },
    m: { xs: 2 }
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: '12px'
  },
  title: {
    fontSize: {xs: '20px', sm: '30px'},
    lineHeight: {xs: '28px', sm: '36px'},
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#000000DE',
    p: 0,
    m: 0
  },
  closeButton: {
    p: 0,
    color: '#1e3a5f',
    '& .MuiSvgIcon-root': {
      width: { xs: '20px', sm: '24px' },
      height: { xs: '20px', sm: '24px' }
    }
  },
  content: {
    p: 1, //some small dialogs has scroll if 0
  },
  actions: {
    p: 0,
    mt: '24px',
    gap: '12px'
  }
}; 
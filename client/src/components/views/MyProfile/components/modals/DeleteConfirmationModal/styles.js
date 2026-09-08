export const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    marginTop: '40px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 600,
    color: '#111827'
  },
  description: {
    fontSize: '18px',
    lineHeight: '22px',
    color: '#6B7280'
  },
  cancelButton: {
    height: '40px',
    fontSize: '14px',
    lineHeight: '17px',
    textTransform: 'none'
  },
  deleteButton: {
    height: '40px',
    fontSize: '14px',
    lineHeight: '17px',
    backgroundColor: 'rgba(32, 68, 100, 1)',
    color: '#fff',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgb(21, 43, 63)'
    }
  }
}; 
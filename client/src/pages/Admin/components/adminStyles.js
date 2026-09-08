export const adminStyles = {
  wrapper: {
    px: { sm: 3, xs: 1 },
    py: 3,
    width: '100%'
  },
  title: {
    fontSize: { xl: '30px', sm: '24px', xs: '20px' },
    lineHeight: { xl: '30px', sm: '24px', xs: '20px' },
    fontWeight: 600,
    mb: '12px'
  },
  description: {
    fontSize: { xl: '18px', sm: '16px', xs: '14px' },
    lineHeight: { xl: '18px', sm: '16px', xs: '14px' },
    maxWidth: '710px',
    mb: { xs: '24px', sm: '32px' }
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: '20px',
    gap: '12px',
    flexWrap: 'wrap'
  },
  searchField: {
    minWidth: '200px',
    maxWidth: '400px',
    '& .MuiOutlinedInput-root': {
      height: { xs: '36px', sm: '40px' },
      backgroundColor: '#F9FAFB',
      '& fieldset': { borderColor: '#E5E7EB' },
      '&:hover fieldset': { borderColor: '#E5E7EB' },
      '&.Mui-focused fieldset': { borderColor: '#E5E7EB', borderWidth: '1px' }
    },
    '& .MuiOutlinedInput-input': {
      padding: { xs: '6px 12px', sm: '8px 12px' },
      fontSize: { xs: '12px', sm: '14px' },
      '&::placeholder': { color: '#6B7280', opacity: 1 }
    }
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  tableContainer: {
    width: '100%',
    overflow: 'hidden'
  },
  paginationContainer: {
    mt: '24px',
    mb: { xs: '70px', sm: '0px' },
    display: 'flex',
    justifyContent: 'flex-end',
    '& .MuiPagination-ul': { gap: 0 }
  },
  paginationItem: {
    margin: 0,
    borderRadius: 0,
    border: '1px solid #E5E7EB',
    borderRight: 'none',
    padding: '14px 16px',
    height: { xs: '32px', sm: '40px' },
    display: 'flex',
    alignItems: 'center',
    background: '#FFFFFF',
    '&.MuiPaginationItem-root': { borderRadius: 0, margin: 0 },
    '&.Mui-selected': {
      background: 'rgba(32, 68, 100, 0.1)',
      border: '1px solid #204464',
      borderRight: 'none',
      color: '#000',
      '&:hover': { background: 'rgba(32, 68, 100, 0.1)' }
    },
    '&:hover': { background: 'rgba(32, 68, 100, 0.05)' },
    '&:last-child': {
      borderRight: '1px solid #E5E7EB',
      '&.Mui-selected': { borderRight: '1px solid #204464' }
    }
  },
  emptyState: {
    textAlign: 'center',
    py: 8,
    color: '#6B7280'
  },
  chip: {
    fontWeight: 600,
    fontSize: '12px',
    height: '24px'
  },
  readOnlyBanner: {
    backgroundColor: '#F0F4F8',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    px: 2,
    py: 1,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }
}

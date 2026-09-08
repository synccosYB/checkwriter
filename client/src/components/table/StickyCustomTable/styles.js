export const styles = {
        container: {
                width: '100%',
                border: `1px solid rgb(229, 231, 235)`,
                borderRadius: '12px'
        },
        headerRow: {
                height: '48px',
                backgroundColor: '#F9FAFB',
                '& .MuiTableCell-head': {
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        padding: '0',
                        backgroundColor: '#F9FAFB'
                }
        },
        headerCell: {
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 12px',
                boxSizing: 'border-box',
                backgroundColor: '#F9FAFB'
        },
        bodyRow: {
                height: '63px',
                cursor: 'pointer',

                '&:hover': {
                        div: {
                                backgroundColor: '#F9FAFB'
                        }
                }
        },
        bodyCell: {
                padding: '0 12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '12px',
                lineHeight: '14.5px',
                height: '100%',
                width: '100%',
                borderBottom: '1px solid #E5E7EB'
        }
}

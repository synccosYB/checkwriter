export const styles = {
        searchField: {
                minWidth: {
                        xs: '120px',
                        sm: '189px'
                },
                height: '40px',

                '& .MuiOutlinedInput-root': {
                        height: '40px',
                        backgroundColor: '#f5f7fa',
                        borderRadius: { xs: '6px', sm: '8px' },
                        padding: '10px 12px',
                        gap: '8px',
                        boxShadow: '0px 1px 2px 0px #1018280D',

                        '& fieldset': {
                                borderColor: '#e2e8f0',
                                borderWidth: '1px'
                        },
                        '&:hover fieldset': {
                                borderColor: '#e2e8f0'
                        },
                        '&.Mui-focused fieldset': {
                                borderColor: '#e2e8f0'
                        }
                }
        },
        header: {
                marginTop: '4.5rem'
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
                mb: {
                        xs: '16px',
                        sm: '20px',
                        md: '32px'
                }
        },
        menuItem: {
                padding: '10px 16px',
                backgroundColor: 'transparent',
                '&:hover': {
                        backgroundColor: '#1e3a5f1A',
                        '& .MuiSvgIcon-root': {
                                color: '#1e3a5f'
                        },
                        color: '#1e3a5f'
                },
                '&:focus': {
                        backgroundColor: 'transparent',
                        '&:hover': {
                                backgroundColor: '#1e3a5f1A'
                        }
                },
                '&.Mui-focusVisible': {
                        backgroundColor: 'transparent'
                },
                '&.Mui-selected': {
                        backgroundColor: 'transparent',
                        '&:hover': {
                                backgroundColor: '#1e3a5f1A'
                        }
                },
                '& .MuiSvgIcon-root': {
                        color: '#000000',
                        marginRight: '12px',
                        fontSize: '20px'
                },
                color: '#000000',
                fontSize: '14px',
                fontWeight: 500
        },
        filterButton: {
                width: '94px',
                height: '40px',
                gap: '8px',
                border: '1px solid #1e3a5f',
                padding: '10px 16px',
                color: '#1e3a5f',
                fontSize: '14px'
        },
        moreButton: {
                color: '#1e3a5f',
                padding: '0px 6px',
                '&:hover': {
                        backgroundColor: 'rgba(30, 58, 95, 0.04)'
                }
        },
        menuPaper: {
                width: '153px',
                boxShadow:
                        '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
                mt: '4px',
                borderRadius: '8px'
        }
}

const STATUS_BASE_STYLES = {
        borderRadius: '5px',
        padding: '8px 16px',
        fontWeight: 500,
        textTransform: 'capitalize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '110px',
        minWidth: '110px',
        maxWidth: '110px',
        textAlign: 'center',
        height: 31,
        opacity: 1,
        gap: '6px',
        boxSizing: 'border-box',
        margin: '0 auto'
}

const getStatusStyles = (color) => ({
        ...STATUS_BASE_STYLES,
        background: `${color}0D`,
        border: `1px solid ${color}`,
        color: color,
        '& span, & .MuiTypography-root': {
                color: color
        }
})

export const STATUS_TYPES = Object.freeze({
        ACTIVE: {
                value: 'active',
                styles: getStatusStyles('#058205')
        },
        INACTIVE: {
                value: 'inactive',
                styles: getStatusStyles('#F44336')
        }
})

export const styles = {
        wrapper: {
                p: 3,
                width: '100%'
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
                maxWidth: '886px',
                color: '#64748b',
                mb: '32px'
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
                                borderColor: '#E5E7EB'
                        },
                        '&:hover fieldset': {
                                borderColor: '#E5E7EB'
                        },
                        '&.Mui-focused fieldset': {
                                borderColor: '#E5E7EB',
                                borderWidth: '1px'
                        },
                        '&.Mui-focused': {
                                backgroundColor: '#F9FAFB'
                        }
                },
                '& .MuiOutlinedInput-input': {
                        padding: { xs: '6px 12px', sm: '8px 12px' },
                        fontSize: { xs: '12px', sm: '14px' },
                        lineHeight: { xs: '16px', sm: '20px' },
                        '&::placeholder': {
                                color: '#6B7280',
                                opacity: 1
                        }
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
                gap: '12px',
                marginLeft: 'auto'
        },
        // actionButton: {
        //   color: '#000000CE',
        //   border: '1px solid #0000005A',
        //   backgroundColor: '#0000000D',
        //   svg: {
        //     stroke: '#000000',
        //   },
        //   '&:hover': {
        //     backgroundColor: '#0000001A',
        //     borderColor: '#000000',
        //   },
        //   '&:disabled': {
        //     color: '#0000001A',
        //     svg: {
        //       color: '#0000001A',
        //       stroke: '#0000001A',
        //     }
        //   }
        // },
        paginationContainer: {
                mt: '32px',
                display: 'flex',
                justifyContent: 'flex-end',

                '& .MuiPagination-ul': {
                        gap: 0
                }
        },
        filterContainer: {
                minWidth: { xs: '40px', sm: '97px' },
                padding: { xs: 0, sm: '8px 12px' },
                '& .MuiButton-endIcon': {
                        margin: { xs: 0, sm: '-4px -4px -4px 8px' },
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                }
        },
        popoverPaper: {
                width: '343px',
                borderRadius: '12px',
                boxShadow:
                        '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
                mt: '12px'
        },
        filterHeader: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: '16px'
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
                        borderColor: '#E5E7EB'
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
                boxShadow:
                        '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
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
        dialogAlert: {
                width: {
                        xs: '100%',
                        sm: '607px'
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
        dialogHeaderAlert: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
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
                m: 0,
                fontWeight: 600,
                color: '#000000DE'
        },
        dialogDescription: {
                fontSize: '18px',
                lineHeight: '28px',
                color: '#00000099',
                mb: '24px'
        },
        dialogCloseButton: {
                p: 0,
                color: '#000000DE',
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
                },
                color: '#00000099'
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
                                background: 'rgba(30, 58, 95, 0.1)'
                        }
                },
                '&:hover': {
                        background: 'rgba(30, 58, 95, 0.05)'
                },
                '&:last-child': {
                        borderRight: '1px solid #E5E7EB',
                        '&.Mui-selected': {
                                borderRight: '1px solid #1e3a5f'
                        }
                }
        },
        pagination: {
                '& .MuiPagination-ul': {
                        gap: 0
                }
        },
        tabContainer: {
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',

                borderBottom: '1px solid #e2e8f0',
                mb: 5
        },
        tabs: {
                width: 'auto', // Changed from 100% to auto to not force full width
                minHeight: 'unset',
                '& .MuiTabs-indicator': {
                        backgroundColor: 'transparent'
                },
                '& .MuiTabs-flexContainer': {
                        justifyContent: 'flex-start' // Align tabs to the left
                },
                '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: { sm: '16px', xs: '12px' },
                        lineHeight: { sm: '20px', xs: '16px' },
                        padding: { sm: '20px 18px', xs: '4px 8px' }, // 20px padding on sides
                        minWidth: 'unset',
                        minHeight: 'unset',
                        borderBottom: '2px solid transparent',
                        '&.tab-all': {
                                color: '#000000DE',
                                '&.Mui-selected': {
                                        borderBottom: '2px solid #000000DE'
                                }
                        },
                        '&.tab-submitted': {
                                color: '#058205',
                                '&.Mui-selected': {
                                        borderBottom: '2px solid #058205'
                                }
                        },
                        '&.tab-processing': {
                                color: '#EF6C00',
                                '&.Mui-selected': {
                                        borderBottom: '2px solid #EF6C00'
                                }
                        },
                        '&.tab-error': {
                                color: '#FF0004',
                                '&.Mui-selected': {
                                        borderBottom: '2px solid #FF0004'
                                }
                        },
                        '&.tab-mailed': {
                                color: '#D2BA00',
                                '&.Mui-selected': {
                                        borderBottom: '2px solid #D2BA00'
                                }
                        },
                        '&.tab-canceled': {
                                color: '#F03D3E',
                                '&.Mui-selected': {
                                        borderBottom: '2px solid #F03D3E'
                                }
                        }
                }
        },
        buttonContainer: {
                width: '100%',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'end',

                mb: '24px'
        },
        actionButton: {
                color: '#000000DE',
                border: '1px solid #e2e8f0',
                backgroundColor: 'transparent',
                textTransform: 'none',
                fontSize: '14px',
                '&:hover': {
                        backgroundColor: 'transparent',
                        borderColor: '#1e3a5f'
                },
                '&:disabled': {
                        cursor: 'pointer',
                        svg: {
                                color: '#0000001A',
                                stroke: '#0000001A'
                        }
                }
        },
        filterButton: {
                color: '#000000DE',
                border: '1px solid #e2e8f0',
                backgroundColor: '#1018280D',
                '&:hover': {
                        backgroundColor: '#1018280D',
                        borderColor: '#1e3a5f'
                }
        },
        generatingCheckIconContainer: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '140px',
                mb: '16px',
                position: 'relative'
        },
        pdfIconContainer: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
        },
        alertActionsContainer: {
                pb: { xs: 2, sm: 3 },
                pt: { xs: 2, sm: 3 },
                gap: '12px',
                justifyContent: 'center'
        },
        alertIconContainer: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '120px',
                mb: '30px'
        },
        alertSuccessIconBorder: {
                width: '120px',
                height: '120px',
                backgroundColor: '#00CF721D',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
        },
        alertSuccessIconMain: {
                width: '100px',
                height: '100px',
                backgroundColor: '#00CF72',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& .MuiSvgIcon-root': {
                        color: '#fff',
                        width: '50px',
                        height: '50px'
                }
        },

        alertFailedIconBorder: {
                width: '120px',
                height: '120px',
                backgroundColor: '#F03D3E1D',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
        },
        alertFailedIconMain: {
                width: '100px',
                height: '100px',
                backgroundColor: '#F03D3E',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& .MuiSvgIcon-root': {
                        color: '#fff',
                        width: '50px',
                        height: '50px'
                }
        },
        statusContainer: {
                display: 'flex',
                py: '12px',
                borderTop: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0'
        },
        statusData: {
                display: 'flex',
                alignItems: 'center',
                width: '50%',
                color: '#00000099',
                fontSize: '18px',
                justifyContent: 'center',
                gap: '5px'
        },
        /////////////Batch Print Modal/////////////
        content: {
                display: 'flex',
                flexDirection: 'column'
        },
        section: {
                display: 'flex',
                flexDirection: 'column'
                // gap: '12px'
        },
        sectionTitle: {
                fontSize: '20px',
                lineHeight: '24px',
                fontWeight: 600,
                color: '#111827'
        },
        checksCount: {
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '600',
                mb: 1
        },
        input: {
                '& .MuiOutlinedInput-root': {
                        height: '40px',
                        '& fieldset': {
                                borderColor: '#E5E7EB'
                        },
                        '&:hover fieldset': {
                                borderColor: '#E5E7EB'
                        },
                        '&.Mui-focused fieldset': {
                                borderColor: '#1e3a5f'
                        }
                }
        },
        actionCancel: {
                textDecoration: 'underline',
                color: '#F03D3E',
                fontSize: '12px'
        },
        actionRetry: {
                textDecoration: 'underline',
                color: '#000000DE',
                fontSize: '12px'
        }
}

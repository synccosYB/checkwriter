export const styles = {
        wrapper: {
                height:'100%',
                p: {
                        xs: '10px',
                        sm: '20px',
                },
                paddingLeft: {
                        xs: '16px',
                        md: '0'
                },
                paddingRight: {
                        xs: '16px',
                        sm: '0'
                },
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
                maxWidth: '710px',
                color: '#64748b',
                mb: {
                        xs: '16px',
                        sm: '20px',
                        md: '32px'
                }
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
                mb: {
                        xs: '10px',
                        sm: '20px'
                },
                gap: '12px'
        },
        searchField: {
                minWidth: {
                        xs: 'calc(100% - 109px)',
                        sm: '190px'
                },

                '& .MuiOutlinedInput-root': {
                        height: { xs: '32px', sm: '40px' },
                        width: '150px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '6px',
                        paddingLeft: '16px',
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
                        // padding: { xs: '6px 12px', sm: '8px 12px' },
                        fontSize: { xs: '12px', sm: '14px' },
                        lineHeight: { xs: '16px', sm: '20px' },
                        '&::placeholder': {
                                color: '#6B7280',
                                opacity: 1
                        }
                }
        },
        searchIcon: {
                color: '#6B7280'
                // fontSize: { xs: '18px', sm: '24px' }
        },
        searchIconContainer: {
                // ml: { xs: 0.5, sm: 1 }
                width: '20px',
                height: '20px'
        },
        actionButtons: {
                display: 'flex',
                gap: '12px'
        },
        searchContainer: {
                display: 'flex',
                gap: '12px'
        },
        actionButton: {
                color: 'rgba(30, 58, 95, 1)',
                border: '1px solid rgba(30, 58, 95, 1)',
                backgroundColor: 'transparent',
                textTransform: 'none',
                fontSize: '14px',
                borderRadius: '8px !important',
                height: '40px',
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
        primaryVariant: {
                backgroundColor: '#1e3a5f !important',
                border: '1px solid #1e3a5f',
                color: '#FFFFFF',
                '&:hover': {
                        backgroundColor: '#152d4a',
                        border: '1px solid #152d4a'
                },
                '&:disabled': {
                        backgroundColor: 'lightgray',
                        border: '1px solid lightgray',
                        color: '#FFFFFF',
                        cursor: 'not-allowed'
                }
        },
        hiddenActionButton: {
                display: {
                        xs: 'none',
                        md: 'flex'
                }
        },
        actionDeleteButton: {
                color: '#FF4D4F !important',
                border: '1px solid #FF4D4F',
                backgroundColor: '#FF4D4F0D !important',
                borderRadius: '8px !important',
                height: '40px',
                '&:hover': {
                        backgroundColor: 'transparent',
                        borderColor: '#FF4D4F'
                },
                '&:disabled': {
                        svg: {
                                color: '##FF4D4F1A',
                                stroke: '##FF4D4F1A'
                        }
                }
        },
        actionVoidButton: {
                color: 'rgb(240, 61, 62)',
                border: '1px solid #FF4D4F',
                backgroundColor: 'rgba(240, 61, 62, 0.05)',
                '&:hover': {
                        backgroundColor: 'transparent',
                        borderColor: '#FF4D4F'
                },
                '&:disabled': {
                        svg: {
                                color: '##FF4D4F1A',
                                stroke: '##FF4D4F1A'
                        }
                }
        },
        paginationContainer: {
                mt: '32px',
                display: 'flex',
                justifyContent: 'flex-end',
                '& .MuiPagination-ul': {
                        gap: 0
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
                textTransform: 'none',
                borderRadius: '6px !important',
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

        menuPaper: {
                width: '153px',
                boxShadow:
                        '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
                mt: '4px',
                borderRadius: '8px'
        },
        mailMenuConent: {
                display: 'flex',
                gap: { sm: '6px', md: '8px', lg: '10px' },
                alignItems: 'center'
        },
        menuItem: {
                fontSize: '14px',
                lineHeight: '20px',
                padding: '10px 16px',
                height: '41px',
                display: 'flex',
                alignItems: 'center',
                color: '#1e3a5f',
                gap: '8px',
                '&:hover': {
                        backgroundColor: '#1e3a5f1A'
                }
        },
        moreButtonContainer: {
                display: { xs: 'block', sm: 'none' },
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: 0
        },
        moreButton: {
                color: '#1e3a5f',
                padding: '0px 6px',
                '&:hover': {
                        backgroundColor: 'rgba(30, 58, 95, 0.04)'
                }
        },
        moreMenuPopOver: {
                marginTop: '4px'
        },

        //////////////// detail modal //////////////////
        detailContainer: {
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: { xs: '12px', sm: '16px' },
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
        },
        detailModal: {
                '& .MuiDialog-paper': {
                        width: '100%',
                        minWidth: { xs: '90%', sm: '80%', md: '620px' },
                        maxWidth: { xs: '90%', sm: '80%', md: '620px' }
                },
                '& .MuiDialogContent-root': {
                        padding: '0px !important'
                }
        },
        detailItem: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
        },
        detailTitle: {
                fontSize: { xs: '14px', sm: '16px' },
                color: '#000000DE',
                fontWeight: '600'
        },
        detailValue: {
                fontSize: { xs: '12px', sm: '14px' },
                color: '#000000CC',
                fontWeight: '400'
        },
        actionsContainer: {
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginTop: { xs: '-10px', md: '0px' }
        },

        /////////////Alert Modal////////////
        dialog: {
                width: {
                        xs: '100%',
                        sm: '607px'
                },
                maxWidth: '685px',
                minHeight: '252px',
                borderRadius: '12px',
                m: { xs: 2, sm: 0 }
        },
        dialogHeader: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                px: { xs: 2, sm: 3 },
                pt: { xs: 2, sm: 3 }
        },
        dialogTitle: {
                fontSize: {
                        xs: '24px',
                        sm: '30px'
                },
                lineHeight: '1.1',
                p: 0,
                m: 0,
                fontWeight: '600',
                marginBottom: { xs: '16px', md: '24px' }
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
                px: { xs: 2, sm: 3 },
                fontWeight: '500',
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
                p: { xs: 2, sm: 3 },
                gap: '12px'
        },
        deleteDialogActions: {
                pb: { xs: '24px', sm: '40px' },
                pt: { xs: '16px', sm: '24px' },
                gap: '12px',
                justifyContent: 'center'
        },

        downloadCheckIconBorder: {
                width: '120px',
                height: '120px',
                backgroundColor: '#00CF721D',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
        },
        downloadCheckIconMain: {
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
        dialogTabs: {
                pb: 2,
                '& .MuiTabs-indicator': {
                        backgroundColor: '#1e3a5f'
                },
                '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#6B7280',
                        width: '50%',
                        '&.Mui-selected': {
                                color: '#1e3a5f'
                        }
                }
        },
        confirmButton1: {
                fontSize: '14px',
                lineHeight: '20px',
                height: '40px',
                minWidth: '100px',
                textTransform: 'none',
                backgroundColor: '#1e3a5f',
                '&:hover': {
                        backgroundColor: '#152d4a'
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
        alertIconContainer: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '120px',
                mb: { xs: '16px', md: '24px' }
        },
        alertIconBorder: {
                width: '120px',
                height: '120px',
                backgroundColor: 'rgba(240, 61, 62, 0.3)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
        },
        alertIconMain: {
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

        clearedIconBorder: {
                width: '120px',
                height: '120px',
                backgroundColor: '#1e3a5f1D',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
        },
        clearedIconMain: {
                width: '100px',
                height: '100px',
                backgroundColor: '#1e3a5f',
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

        ////////////////////////Add Edit Modal////////////////////////
        addFormContainer: {
                backgroundColor: '#F4F5F7',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: { xs: '16px', md: '32px' },
                display: 'flex',
                flexDirection: 'column'
        },

        addAccordionContainer: {
                mt: '-15px',
                boxShadow: 'none',
                borderRadius: '12px !important',

                '&:before': {
                        display: 'none'
                },
                '&:after': {
                        display: 'none'
                }
        },

        addCheckButton: {
                width: '100%',
                height: '40px',
                backgroundColor: '#1e3a5f1A',
                border: '1px solid #e2e8f0',
                borderStyle: 'dashed',
                color: '#1e3a5f',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                        backgroundColor: '#1e3a5f1A',
                        borderColor: '#1e3a5f'
                }
        },

        addFormHeader: {
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'stretch' },
                mb: { xs: '16px', md: '24px' },
                gap: { xs: '16px', md: '24px', lg: '40px' }
        },

        addFormHeaderLeft: {
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column-reverse', md: 'column' },
                gap: { xs: '20px', md: '8px' }
        },

        accordionEditHeader: {
                display: 'flex',
                justifyContent: 'space-between'
        },

        titleContainer: {
                display: 'flex',
                flexDirection: { xs: 'column-reverse', md: 'row' },
                gap: { xs: '16px', md: '30px' },
                mb: { xs: '16px', md: '24px' },
                justifyContent: { xs: 'flex-start', md: 'space-between' }
        },

        accordionTitleContainer: {
                display: 'flex',
                gap: '30px'
        },

        checkTitle: {
                fontSize: { xs: '16px', md: '20px' },
                color: '#000000DE',
                fontWeight: '600'
        },

        checkSubTitle: {
                fontSize: { xs: '14px', md: '16px' },
                color: '#00000099',
                fontWeight: '500'
        },

        itemContainer: {
                position: 'relative',
                display: 'flex',
                justifyContent: { xs: 'flex-start', sm: 'flex-start', md: 'space-between' },
                gap: { xs: '8px', md: '12px' }
                // flexWrap: {xs: 'wrap', md: 'nowrap'}
        },

        itemLabel: {
                fontSize: '14px',
                color: '#000000DE',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flex: {
                        xs: '1 1 30%',
                        sm: 'auto'
                }
        },

        select: {
                // width: { xs: '100%', md: '300px' },
                height: '40px',
                backgroundColor: '#fff',
                '& .MuiSelect-select': {
                        padding: '12px 16px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#000000DE'
                },
                '& .MuiSvgIcon-root': {
                        color: '#000000DE'
                }
        },

        payeeSelect: {
                width: { xs: '100%', md: '100%' },
                height: '40px',
                backgroundColor: '#fff',
                '& .MuiSelect-select': {
                        padding: '10px 16px',
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#000000DE',
                        borderBottom: '1px solid #e2e8f0'
                },
                '& .MuiSvgIcon-root': {
                        color: '#000000DE'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                }
        },

        input: {
                width: { xs: '100%', sm: '100%', md: '190px' },

                '& .MuiOutlinedInput-root': {
                        height: '40px',
                        backgroundColor: '#fff',

                        '& fieldset': {
                                borderColor: '#e2e8f0'
                        },
                        '&:hover fieldset': {
                                borderColor: '#e2e8f0'
                        },
                        '&.Mui-focused fieldset': {
                                borderColor: '#1e3a5f'
                        }
                }
        },
        payeeNameContainer: {
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: '6px' },
                justifyContent: { xs: 'flex-start', md: 'space-between' }
        },

        payeeNameLabel: {
                fontSize: '16px',
                color: '#000000DE',
                fontWeight: '600'
        },

        addEditHeaderRight: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                width: { xs: '100%', md: 'auto' }
        },

        accordionEditHeaderRight: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
        },

        dollarsContainer: {
                display: 'flex',
                alignItems: 'center',
                mb: '24px',
                gap: '24px'
        },

        dollarText: {
                fontSize: '18px',
                color: '#00000099',
                fontWeight: '600',
                alignSelf: 'center'
        },

        dollarInput: {
                width: { xs: '100%', md: '805px' },
                height: { xs: 'auto', sm: '30px', md: '40px' },
                backgroundColor: 'transparent',
                borderBottom: '1px solid #00000099',
                '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                },
                '& .MuiInputBase-multiline': {
                        padding: '0px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                },
                '& .MuiOutlinedInput-input': {
                        padding: { xs: '0px 0px', md: '10px 16px' },
                        fontSize: { xs: '12px', md: '16px' },
                        color: '#000000DE',
                        fontWeight: '600',
                        height: 'auto !important'
                },
                '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#000000',
                        color: '#000000'
                }
        },

        memoContainer: {
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: { xs: 'flex-start', md: 'space-between' },
                mb: '24px',
                alignItems: { xs: 'flex-start', md: 'flex-start' },
                gap: { xs: '16px', md: '20px', lg: '30px' }
        },
        signatureContainer: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
        },
        memoLabel: {
                fontSize: '16px',
                color: '#000000DE',
                fontWeight: '600'
        },

        memoInput: {
                width: { xs: '100%', sm: '553px', lg: '739px' },
                height: '40px',
                backgroundColor: '#FFF',
                borderBottom: '1px solid #e2e8f0',
                '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                },
                '& .MuiOutlinedInput-input': {
                        padding: '10px 16px',
                        fontSize: '16px',
                        color: '#000000DE',
                        fontWeight: '600'
                }
        },

        createFormContainer: {
                backgroundColor: '#F4F5F7',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: { xs: '16px', md: '22px' },
                display: 'flex',
                flexDirection: 'column'
        },

        createFormHeader: {
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'stretch' },
                mb: { xs: '12px', md: '16px' },
                gap: { xs: '16px', md: '20px', lg: '28px' }
        },

        createTitleContainer: {
                display: 'flex',
                flexDirection: { xs: 'column-reverse', md: 'row' },
                gap: { xs: '12px', md: '24px' },
                mb: { xs: '10px', md: '14px' },
                justifyContent: { xs: 'flex-start', md: 'space-between' }
        },

        createDollarsContainer: {
                display: 'flex',
                alignItems: 'center',
                mb: '16px',
                gap: '24px'
        },

        createMemoContainer: {
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: { xs: 'flex-start', md: 'space-between' },
                mb: '16px',
                alignItems: { xs: 'flex-start', md: 'flex-start' },
                gap: { xs: '16px', md: '20px', lg: '30px' }
        },

        footerNumber: {
                fontSize: '20px',
                color: '#00000099',
                fontWeight: '600',
                textAlign: 'center',
                fontFamily: 'GnuMICR, monospace'
        },

        radioGroup: {
                display: 'flex',
                gap: { xs: '8px', md: '12px' },
                alignItems: { xs: 'flex-start', md: 'center' }
        },
        radio: {
                color: '#D1D5DB',
                padding: '0',
                '&.Mui-checked': {
                        color: '#1e3a5f'
                }
        },
        radioItem: {
                display: 'flex',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: { xs: '4px', md: '8px' }
        },

        radioLabel: {
                fontSize: { xs: '14px', md: '16px' },
                color: '#00000099',
                fontWeight: '600'
        },

        errorText: {
                fontSize: '12px',
                lineHeight: '16px',
                color: '#DC2626',
                marginTop: '4px'
        },

        checkNumberAutomatic: {
                position: 'absolute',
                top: '12px',
                right: '16px',
                fontSize: '12px',
                fontWeight: '500'
        },
        tooltip: {
                width: '226px',
                bgcolor: '#181D27',
                fontSize: '12px',
                lineHeight: '16px',
                px: '12px',
                py: '8px',
                borderRadius: '8px',
                '& .MuiTooltip-arrow': {
                        color: '#181D27'
                }
        },
        checkEmailInputContainer: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                mb: '24px'
        },
        checkEmailInput: {
                width: '100%',

                '& .MuiOutlinedInput-root': {
                        height: '40px',
                        backgroundColor: '#fff',

                        '& fieldset': {
                                borderColor: '#e2e8f0'
                        },
                        '&:hover fieldset': {
                                borderColor: '#e2e8f0'
                        },
                        '&.Mui-focused fieldset': {
                                borderColor: '#1e3a5f'
                        }
                }
        },
        selectedChecksContainer: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: '24px'
        },
        selectedChecksTitle: {
                fontSize: '18px',
                color: '#000000DE',
                fontWeight: '600'
        },
        totalCost: {
                fontSize: '16px',
                color: '#1e3a5f'
        },

        addEditBlankContainer: {
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column'
        },
        balankItemLabel: {
                fontSize: '18px',
                color: '#000000DE',
                fontWeight: '600',
                mb: '12px'
        },
        filterContainer: {
                py: { xs: '8px', sm: '16px', md: '24px' },
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
        },
        filterItemContainer: {
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                px: '8px',
                py: '4px'
        },
        filterlableTitle: {
                color: '#000000DE',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center'
        },
        filterCloseIcon: {
                color: '#e2e8f0',
                width: '12px',
                height: '12px',
                cursor: 'pointer'
        },
        resetButton: {
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '20px',
                height: '32px',
                color: '#1e3a5f',
                border: 'none',
                textTransform: 'none',
                '&:hover': {
                        border: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
        },

        accordion: {
                p: '16px',
                boxShadow: 'none',
                border: '1px solid #E0E0E0',
                borderRadius: '12px !important',
                '&:before': {
                        display: 'none'
                },
                '&:after': {
                        display: 'none'
                }
        },
        closeIconButton: {
                position: 'absolute',
                top: 1,
                right: 1,
                zIndex: 1,
                backgroundColor: 'transparent',
                '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
        },
        accordionContainer: {
                position: 'relative',
                mt: '-15px'
        },
        checkBottomContainer: {
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'flex-start' },
                mb: { xs: '16px', md: '24px' },
                padding: { xs: '16px', md: '32px' },
                backgroundColor: '#fff',
                gap: { xs: '16px', md: '24px' },
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
        },
        checkBottomItemContainer: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
        },
        checkBottomItemlabel: {
                fontSize: '18px',
                color: '#000000DE',
                fontWeight: '600'
        },
        tagItem: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
        },
        tag: {
                width: '8px',
                height: '8px',
                borderRadius: '50%'
        },
        tagTitle: {
                fontSize: '14px',
                color: '#00000099',
                fontWeight: '500',
                lineHeight: '100%'
        },
        selectTagItem: {
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                px: '12px',
                py: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
        },
        tagTablePaper: {
                minWidth: '170px',
                boxShadow:
                        '0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03)',
                borderRadius: '8px',
                overflow: 'hidden',
                transform: 'translateX(-50%)',
                marginLeft: '50%',
                p: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '12px',
                border: '1px solid #F5F5F5'
        },
        tagTableItem: {
                py: '5px',
                fontSize: '14px',
                lineHeight: '20px',
                color: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                gap: '8px',
                '&:hover': {
                        backgroundColor: '#F9FAFB'
                }
        },
        tagButton: {
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                gap: '8px',
                px: '12px',
                py: '4px',
                fontSize: '14px',
                lineHeight: '20px',
                color: '#1e3a5f',
                backgroundColor: '#fff',
                minWidth: '110px',
                '&:hover': {
                        backgroundColor: '#F9FAFB'
                },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textTransform: 'none'
        },
        autoCompleteOptions: {
                paddingTop: '14px',
                paddingBottom: '14px',
                fontSize: '16px',
                fontWeight: 500,
                color: '#00000099'
        },
        autoCompleteOptionsAddNew: {
                paddingTop: '16px',
                paddingBottom: '14px',
                borderTop: '1px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1e3a5f'
        },
        formContainer: {
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                mb: '24px'
        },
        attachmentMenuItem: {
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                px: '8px',
                py: '4px'
        },
        attachmentIconContainer: {
                width: '30px',
                height: '30px',
                p: '5px',
                backgroundColor: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
        },
        attachmentDragDrop: {
                borderRadius: '8px',
                padding: '24px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                marginBottom: '10px',
                cursor: 'pointer'
        },
        addAttachmentButton: {
                border: '1px dashed #00000099',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '42px',
                width: '100%',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px'
        },
        fileNameTable: {
                fontSize: '16px',
                color: '#000000DE',
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
        },
        recurringContainer: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: { xs: '16px', md: '24px 32px' },
                backgroundColor: '#fff',
                borderTop: '1px solid #e2e8f0',
                mb: { xs: '16px', md: '24px' },
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
        },
        recurringHeader: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
        },
        recurringSubtitle: {
                fontSize: '14px',
                color: '#00000099',
                fontWeight: '500',
                mt: '2px'
        },
        recurringFields: {
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '24px',
                flexWrap: 'wrap'
        },
        recurringField: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
        },
        recurringPreview: {
                fontSize: '14px',
                color: '#1e3a5f',
                fontWeight: '600',
                backgroundColor: '#F4F5F7',
                borderRadius: '8px',
                padding: '10px 14px'
        }
}

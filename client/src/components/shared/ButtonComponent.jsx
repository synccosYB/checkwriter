import { Button } from '@mui/material'
import React from 'react'

const ButtonComponent = (props) => {
        const { variant, icon, text, click, style, iconPosition, isSmallScreen, extraClass, ...rest } = props

        return (
                <Button
                        className={`common-btn d-flex align-items-center ${isSmallScreen ? 'rounded-1' : 'rounded-3'} justify-content-center text-capitalize ${variant} ${
                                extraClass || ''
                        }`}
                        onClick={click}
                        {...rest}
                        sx={{
                                ...style,
                                '&.MuiButton-root': {
                                        '&.common-btn': {
                                                '&.light': {
                                                        '&.Mui-disabled': {
                                                                color: '#BDBDBD',
                                                                borderColor: '#BDBDBD'
                                                        }
                                                }
                                        },
                                        '& svg': {
                                                width: '16px',
                                                height: '16px'
                                        }
                                },
                        
                        }}
                >
                        {iconPosition === "left" ? (
                                <>
                                        {icon ? <span className="me-2 d-flex align-items-center">{icon}</span> : null}
                                        {text}
                                </>
                        ) : (
                                <>
                                        {text}
                                        {icon ? <span className="ms-2 d-flex align-items-center">{icon}</span> : null}
                                </>
                        )}
                </Button>
        )
}

export default ButtonComponent

import React, { useState } from 'react'
import { Field, ErrorMessage } from 'formik'
import { TextField } from '@mui/material'
import { RemoveRedEye, VisibilityOff } from '@mui/icons-material'
import styled from '@emotion/styled'

import TextError from '../../../hoc/TextError'

const MyTextField = styled(TextField)(
        ({ prefix = false, isSufix = false }) => ({
                '& .MuiOutlinedInput-root': {
                        fontSize: '12px',
                        '.MuiInputBase-input': {
                                padding: '12px 15px',
                                fontSize: '12px'
                        },

                        '& fieldset': {
                                borderColor: '#C8CBCB',
                                borderRadius: isSufix ? '4px 0 0 4px' : prefix ? '0 4px 4px 0' : '4px',
                                '& legend': {
                                        fontSize: '0.65em'
                                }
                        },
                        '&:hover fieldset': {
                                borderColor: '#C8CBCB'
                        },
                        '&.Mui-focused fieldset': {
                                borderColor: 'green'
                        },
                        '&.Mui-focused': {
                                //color: '#1e3a5f' // set your custom color here
                        }
                },
                '& .MuiInputLabel-root': {
                        color: '#969696',
                        fontSize: '12px',
                        fontWeight: '500',
                        transform: 'translate(14px, 13px) scale(1)',

                        '&.MuiFormLabel-filled': {
                                transform: 'translate(13px, -7px) scale(0.75)'
                        },

                        '&.Mui-focused': {
                                color: '#1e3a5f',
                                transform: 'translate(13px, -7px) scale(0.75)'
                        }
                }
        })
)

const Input = (props) => {
        const { label, name, type, formfieldClass = '', ...rest } = props

        const [hidePassword, setHidepassword] = useState(true)

        const changeIcons = (id) => {
                let type = document.getElementById(id).getAttribute('type')
                if (type === 'password') {
                        type = 'text'
                        setHidepassword(false)
                } else {
                        setHidepassword(true)
                        type = 'password'
                }
                document.getElementById(id).setAttribute('type', type)
        }

        if (type === 'password') {
                return (
                        <div className="formField">
                                <div className="passwordDiv">
                                        <Field
                                                id={name}
                                                name={name}
                                                {...rest}
                                                as={MyTextField}
                                                label={label}
                                                variant="outlined"
                                                className="password-input"
                                                type={type}
                                                autocomplete="off"
                                        />
                                        {hidePassword ? (
                                                <RemoveRedEye
                                                        className="loginEyeIcon"
                                                        onClick={() => changeIcons(name)}
                                                />
                                        ) : (
                                                <VisibilityOff
                                                        className="loginEyeIcon"
                                                        onClick={() => changeIcons(name)}
                                                />
                                        )}
                                </div>
                                <ErrorMessage name={name} component={TextError} />
                        </div>
                )
        }
        return (
                <div className={`formField ${formfieldClass}`}>
                        <Field
                                id={name}
                                name={name}
                                {...rest}
                                as={MyTextField}
                                label={label}
                                variant="outlined"
                                className="generic-input"
                                type={type}
                        />
                        <ErrorMessage name={name} component={TextError} />
                </div>
        )
}

export default Input

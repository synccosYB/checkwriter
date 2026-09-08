import React from 'react'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../redux/snackbarState'
import { TextField, Typography, Button, Box } from '@mui/material'
import useForgetPassword from '../API/auth/useForgetPassword'
import useVerifyIfUserExists from '../API/auth/useVerifyIfUserExists'
import {
        authInputSx,
        authLabelSx,
        authRequiredStar,
        authErrorSx,
        authPrimaryButtonSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authColors,
} from '../styles/authStyles'

const ForgetPassword = () => {
        const dispatch = useDispatch()

        const { mutate: sendForgetPasswordEmail } = useForgetPassword()
        const { mutate: verifyIfUserExists } = useVerifyIfUserExists()

        const validationSchema = Yup.object({
                email: Yup.string().email('Incorrect Email').required('Required')
        })

        const initialValues = {
                email: ''
        }

        const onSubmit = async (values) => {
                verifyIfUserExists(
                        { email: values.email.toLowerCase() },
                        {
                                onSuccess: () => {
                                        sendForgetPasswordEmail({ email: values.email })
                                },
                                onError: () => {
                                        dispatch(
                                                updateSnackbar({
                                                        open: true,
                                                        severity: 'error',
                                                        message: 'User Not found.'
                                                })
                                        )
                                }
                        }
                )
        }

        return (
                <Box sx={authCardSx}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography sx={authPageTitleSx}>
                                        Forgot Password
                                </Typography>
                                <Typography sx={authPageSubtitleSx}>
                                        Enter your email address and we'll send you a link to reset your password.
                                </Typography>
                        </Box>

                        <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                        >
                                {({
                                        handleSubmit,
                                        handleChange,
                                        values,
                                        errors,
                                        touched
                                }) => (
                                        <Form onSubmit={handleSubmit}>
                                                <Box sx={{ mb: 3 }}>
                                                        <Typography sx={authLabelSx}>
                                                                Email <span style={authRequiredStar}>*</span>
                                                        </Typography>
                                                                <TextField
                                                                        variant="outlined"
                                                                        name="email"
                                                                        type="text"
                                                                        fullWidth
                                                                        placeholder="Enter your email"
                                                                        value={values.email}
                                                                        onChange={handleChange}
                                                                        error={touched.email && Boolean(errors.email)}
                                                                        sx={authInputSx}
                                                                />
                                                                <ErrorMessage name="email">
                                                                        {(msg) => <Typography sx={authErrorSx}>{msg}</Typography>}
                                                        </ErrorMessage>
                                                </Box>

                                                <Button
                                                        type="submit"
                                                        onClick={handleSubmit}
                                                        sx={{ ...authPrimaryButtonSx, mt: 1 }}
                                                >
                                                        Send Reset Link
                                                </Button>
                                        </Form>
                                )}
                        </Formik>

                        <Typography
                                sx={{
                                        textAlign: 'center',
                                        mt: 4,
                                        fontSize: '14px',
                                        color: authColors.textSecondary,
                                }}
                        >
                                Back to{' '}
                                <Link
                                        to="/auth/login"
                                        style={{
                                                color: authColors.navyLight,
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                        }}
                                >
                                        Sign In
                                </Link>
                        </Typography>
                </Box>
        )
}

export default ForgetPassword

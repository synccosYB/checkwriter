import React, { useState } from 'react'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FormControlLabel, Checkbox, CircularProgress, Divider, Box, TextField, Typography, Button } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { VisibilityOff } from '@mui/icons-material'
import SocialLogin from '../components/shared/SocialLogin'
import { Link } from 'react-router-dom'
import withPublicPageContainer from '../routes/withPublicPageContainer'
import useSignin from '../API/auth/useSignin'
import useDemoLogin from '../API/auth/useDemoLogin'
import {
        authInputSx,
        authLabelSx,
        authRequiredStar,
        authErrorSx,
        authPrimaryButtonSx,
        authSecondaryButtonSx,
        authCheckboxSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authDividerTextSx,
        authColors,
} from '../styles/authStyles'

const Login = () => {
        const { mutate: login, isPending } = useSignin()
        const { mutate: demoLogin, isPending: isDemoPending } = useDemoLogin()
        const [showPassword, setShowPassword] = useState(false)

        const validationSchema = Yup.object({
                email: Yup.string().email('Incorrect Email').required('Required'),
                password: Yup.string().required('Password is required')
        })

        const initialValues = {
                email: '',
                password: '',
                isRememberd: false
        }

        const onSubmit = async (values) => {
                let body = { ...values, email: values.email.toLowerCase() }
                delete body.isRememberd
                login(body)
        }

        return (
                <Box sx={authCardSx}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography sx={authPageTitleSx}>
                                        Welcome Back
                                </Typography>
                                <Typography sx={authPageSubtitleSx}>
                                        Sign in to your account to continue
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
                                        setFieldValue,
                                        values,
                                        errors,
                                        touched
                                }) => (
                                        <Form onSubmit={handleSubmit}>
                                                <Box sx={{ mb: 2.5 }}>
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

                                                <Box sx={{ mb: 1 }}>
                                                        <Typography sx={authLabelSx}>
                                                                Password <span style={authRequiredStar}>*</span>
                                                        </Typography>
                                                        <TextField
                                                                variant="outlined"
                                                                name="password"
                                                                type={showPassword ? 'text' : 'password'}
                                                                fullWidth
                                                                placeholder="Enter your password"
                                                                value={values.password}
                                                                onChange={handleChange}
                                                                error={touched.password && Boolean(errors.password)}
                                                                sx={authInputSx}
                                                                InputProps={{
                                                                        endAdornment: (
                                                                                <IconButton
                                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                                        sx={{ color: authColors.textMuted }}
                                                                                >
                                                                                        {showPassword ? <VisibilityOff /> : <VisibilityIcon />}
                                                                                </IconButton>
                                                                        )
                                                                }}
                                                        />
                                                        <ErrorMessage name="password">
                                                                {(msg) => <Typography sx={authErrorSx}>{msg}</Typography>}
                                                        </ErrorMessage>
                                                </Box>

                                                <Box
                                                        sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                mb: 3,
                                                        }}
                                                >
                                                        <FormControlLabel
                                                                control={<Checkbox sx={authCheckboxSx} />}
                                                                label="Remember Me"
                                                                sx={{
                                                                        '& .MuiFormControlLabel-label': {
                                                                                fontSize: '14px',
                                                                                color: authColors.textSecondary,
                                                                        },
                                                                }}
                                                        />
                                                        <Link
                                                                to="/auth/forget-password"
                                                                style={{
                                                                        color: authColors.navyLight,
                                                                        textDecoration: 'none',
                                                                        fontSize: '14px',
                                                                        fontWeight: 500,
                                                                }}
                                                        >
                                                                Forgot Password?
                                                        </Link>
                                                </Box>

                                                <Button
                                                        disabled={isPending}
                                                        type="submit"
                                                        onClick={handleSubmit}
                                                        endIcon={isPending && <CircularProgress size={'14px'} sx={{ color: '#fff' }} />}
                                                        sx={authPrimaryButtonSx}
                                                >
                                                        Sign In
                                                </Button>
                                        </Form>
                                )}
                        </Formik>

                        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                                <Divider sx={{ flex: 1, borderColor: authColors.border }} />
                                <Typography sx={authDividerTextSx}>
                                        or continue with
                                </Typography>
                                <Divider sx={{ flex: 1, borderColor: authColors.border }} />
                        </Box>

                        <SocialLogin />

                        <Typography
                                sx={{
                                        textAlign: 'center',
                                        mt: 4,
                                        fontSize: '14px',
                                        color: authColors.textSecondary,
                                }}
                        >
                                Don't have an account?{' '}
                                <Link
                                        to="/auth/sign-up"
                                        style={{
                                                color: authColors.navyLight,
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                        }}
                                >
                                        Sign Up
                                </Link>
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                                <Divider sx={{ flex: 1, borderColor: authColors.border }} />
                                <Typography sx={authDividerTextSx}>
                                        or
                                </Typography>
                                <Divider sx={{ flex: 1, borderColor: authColors.border }} />
                        </Box>

                        <Button
                                disabled={isDemoPending}
                                onClick={() => demoLogin()}
                                endIcon={isDemoPending && <CircularProgress size="14px" />}
                                fullWidth
                                variant="outlined"
                                sx={authSecondaryButtonSx}
                        >
                                {isDemoPending ? 'Setting up demo...' : 'Try Demo Account'}
                        </Button>
                </Box>
        )
}

export default withPublicPageContainer(Login)

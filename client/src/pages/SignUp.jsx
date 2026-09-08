import React, { useState } from 'react'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useHistory } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { VisibilityOff } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import { TextField, Typography, Button, CircularProgress, Box } from '@mui/material'
import SocialLogin from '../components/shared/SocialLogin'
import { FormControl, Checkbox, Divider } from '@mui/material'
import useSendAuthOtp from '../API/verify/useSendAuthOtp'
import withPublicPageContainer from '../routes/withPublicPageContainer'
import {
        authInputSx,
        authLabelSx,
        authRequiredStar,
        authErrorSx,
        authPrimaryButtonSx,
        authCheckboxSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authDividerTextSx,
        authColors,
} from '../styles/authStyles'

const validationSchema = Yup.object({
        email: Yup.string().email('Incorrect Email').required('Required!'),
        password: Yup.string()
                .required('Required!')
                .min(8, 'Password must be at least 8 characters')
                .max(16, 'Password must be less than or equal to 16 characters')
                .matches(
                        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/,
                        'Password must contain at least one letter, one number and one special character'
                ),
        confirmPassword: Yup.string()
                .required('Required')
                .oneOf([Yup.ref('password'), null], 'Passwords does not matched ')
                .min(8, 'Password must be at least 8 characters')
                .max(16, 'Password must be less than or equal to 16 characters')
                .matches(
                        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/,
                        'Password must contain at least one letter, one number and one special character'
                ),
        firstName: Yup.string().required('Required!'),
        lastName: Yup.string().required('Required!')
})

const initialValues = {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        middleName: '',
        lastName: '',
        isAggreed: false
}

const SignUp = () => {
        const { mutate: sendOtp, isPending } = useSendAuthOtp()
        const history = useHistory()

        const [showPassword, setShowPassword] = useState(false)
        const [showConfirmPassword, setShowConfirmPassword] = useState(false)

        const onSubmit = async (values) => {
                sendOtp(
                        { email: values.email.toLowerCase() },
                        {
                                onSuccess: () => {
                                        history.push({
                                                pathname: '/auth/verify-otp',
                                                state: {
                                                        values: { ...values },
                                                        mode: 'standard'
                                                }
                                        })
                                }
                        }
                )
        }

        return (
                <Box sx={{ ...authCardSx, maxWidth: '520px' }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography sx={authPageTitleSx}>
                                        Create Your Account
                                </Typography>
                                <Typography sx={authPageSubtitleSx}>
                                        Get started with Synccos Check Writer
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
                                                <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                                                        <Box sx={{ flex: 1 }}>
                                                                <Typography sx={authLabelSx}>
                                                                        First Name <span style={authRequiredStar}>*</span>
                                                                </Typography>
                                                                <TextField
                                                                        variant="outlined"
                                                                        name="firstName"
                                                                        type="text"
                                                                        fullWidth
                                                                        placeholder="First name"
                                                                        value={values.firstName}
                                                                        onChange={handleChange}
                                                                        error={touched.firstName && Boolean(errors.firstName)}
                                                                        sx={authInputSx}
                                                                />
                                                                <ErrorMessage name="firstName">
                                                                        {(msg) => <Typography sx={authErrorSx}>{msg}</Typography>}
                                                                </ErrorMessage>
                                                        </Box>

                                                        <Box sx={{ flex: 1 }}>
                                                                <Typography sx={authLabelSx}>
                                                                        Last Name <span style={authRequiredStar}>*</span>
                                                                </Typography>
                                                                <TextField
                                                                        variant="outlined"
                                                                        name="lastName"
                                                                        type="text"
                                                                        fullWidth
                                                                        placeholder="Last name"
                                                                        value={values.lastName}
                                                                        onChange={handleChange}
                                                                        error={touched.lastName && Boolean(errors.lastName)}
                                                                        sx={authInputSx}
                                                                />
                                                                <ErrorMessage name="lastName">
                                                                        {(msg) => <Typography sx={authErrorSx}>{msg}</Typography>}
                                                                </ErrorMessage>
                                                        </Box>
                                                </Box>

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

                                                <Box sx={{ mb: 2.5 }}>
                                                        <Typography sx={authLabelSx}>
                                                                Password <span style={authRequiredStar}>*</span>
                                                        </Typography>
                                                        <TextField
                                                                variant="outlined"
                                                                name="password"
                                                                type={showPassword ? 'text' : 'password'}
                                                                fullWidth
                                                                placeholder="Create a password"
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

                                                <Box sx={{ mb: 2.5 }}>
                                                        <Typography sx={authLabelSx}>
                                                                Confirm Password <span style={authRequiredStar}>*</span>
                                                        </Typography>
                                                        <TextField
                                                                variant="outlined"
                                                                name="confirmPassword"
                                                                type={showConfirmPassword ? 'text' : 'password'}
                                                                fullWidth
                                                                placeholder="Confirm your password"
                                                                value={values.confirmPassword}
                                                                onChange={handleChange}
                                                                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                                                sx={authInputSx}
                                                                InputProps={{
                                                                        endAdornment: (
                                                                                <IconButton
                                                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                                        sx={{ color: authColors.textMuted }}
                                                                                >
                                                                                        {showConfirmPassword ? <VisibilityOff /> : <VisibilityIcon />}
                                                                                </IconButton>
                                                                        )
                                                                }}
                                                        />
                                                        <ErrorMessage name="confirmPassword">
                                                                {(msg) => <Typography sx={authErrorSx}>{msg}</Typography>}
                                                        </ErrorMessage>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                                        <FormControl sx={{ p: 0 }}>
                                                                <Checkbox
                                                                        checked={values.isAggreed}
                                                                        sx={authCheckboxSx}
                                                                        required
                                                                        size="medium"
                                                                        name="isAggreed"
                                                                        onChange={(e) => {
                                                                                setFieldValue('isAggreed', e.target.checked)
                                                                        }}
                                                                />
                                                        </FormControl>
                                                        <Typography
                                                                sx={{
                                                                        color: authColors.textSecondary,
                                                                        ml: 1,
                                                                        fontSize: '14px',
                                                                        lineHeight: '22px',
                                                                        mt: '9px',
                                                                }}
                                                        >
                                                                I have read and agree to the
                                                                <Link
                                                                        to="/terms"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{
                                                                                color: authColors.navyLight,
                                                                                textDecoration: 'none',
                                                                                marginLeft: '4px',
                                                                                fontWeight: 500,
                                                                        }}
                                                                >
                                                                        Terms & Conditions
                                                                </Link>
                                                        </Typography>
                                                </Box>

                                                <Button
                                                        type="submit"
                                                        onClick={handleSubmit}
                                                        disabled={!values?.isAggreed || isPending}
                                                        sx={authPrimaryButtonSx}
                                                        endIcon={isPending && <CircularProgress size={'14px'} sx={{ color: '#fff' }} />}
                                                >
                                                        Create Account
                                                </Button>
                                        </Form>
                                )}
                        </Formik>

                        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                                <Divider sx={{ flex: 1, borderColor: authColors.border }} />
                                <Typography sx={authDividerTextSx}>
                                        or sign up with
                                </Typography>
                                <Divider sx={{ flex: 1, borderColor: authColors.border }} />
                        </Box>

                        <SocialLogin />

                        <Typography
                                sx={{
                                        textAlign: 'center',
                                        mt: 3,
                                        fontSize: '14px',
                                        color: authColors.textSecondary,
                                }}
                        >
                                Already have an account?{' '}
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

export default withPublicPageContainer(SignUp)

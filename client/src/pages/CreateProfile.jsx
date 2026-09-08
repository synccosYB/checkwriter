import React, { useEffect } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Link, useHistory } from 'react-router-dom'

import FormComponents from '../components/shared/forms/index'

import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../redux/snackbarState'
import { FormControl, Checkbox, Button, CircularProgress, Box, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'

import useSendAuthOtp from '../API/verify/useSendAuthOtp'
import {
        authPrimaryButtonSx,
        authCheckboxSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authColors,
} from '../styles/authStyles'

const validationSchema = Yup.object({
        email: Yup.string().email('Incorrect Email').required('Required!'),
        firstName: Yup.string().required('Required!'),
        lastName: Yup.string().required('Required!'),
        middleName: Yup.string(),
        phone: Yup.string(),
        dateOfBirth: Yup.date()
})


const CreateProfile = () => {
        const { mutate: sendOtp, isPending } = useSendAuthOtp()
        const dispatch = useDispatch()
        const history = useHistory()
        const location = useLocation()

        const authData = location?.state?.authData
        const loginType = location?.state?.loginType
        const data = location?.state?.userData

        const formValues = {
                email: data?.email || '',
                firstName: data?.firstName || '',
                middleName: data?.middleName || '',
                lastName: data?.lastName || '',
                isAggreed: false,
                phone: data?.phone || '',
                dateOfBirth: data?.dateOfBirth || new Date()
        }

        const initialValues = { email: data?.email || '' }

        useEffect(() => {
                if (!location?.state) {
                        history.push('/auth/sign-up')
                }
        }, [location, history])

        const onSubmit = async (values) => {
                if (initialValues?.email !== values?.email) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'error',
                                        message: 'User email not verified.'
                                })
                        )
                        return false
                }

                const body = { ...values, ...authData }
                delete body.isAggreed

                try {
                        let data
                        sendOtp(
                                {
                                        email: values.email.toLowerCase()
                                },
                                {
                                        onSuccess: () => {
                                                history.push({
                                                        pathname: '/auth/verify-otp',
                                                        state: {
                                                                values: { ...values },
                                                                authData: { ...authData },
                                                                mode: 'google'
                                                        }
                                                })
                                        }
                                }
                        )
                } catch (error) {
                        console.error(error)
                }
        }

        return (
                <Box sx={{ ...authCardSx, maxWidth: '520px' }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography sx={authPageTitleSx}>
                                        Create Profile
                                </Typography>
                                <Typography sx={authPageSubtitleSx}>
                                        Complete your profile using your Google account details.
                                </Typography>
                        </Box>

                        {formValues ? (
                                <Formik
                                        initialValues={formValues}
                                        validationSchema={validationSchema}
                                        onSubmit={onSubmit}
                                >
                                        {({ handleSubmit, setFieldValue, values }) => {
                                                return (
                                                        <Form>
                                                                <Box sx={{ display: 'flex', gap: 2, mb: 0 }}>
                                                                        <Box sx={{ flex: 1 }}>
                                                                                <FormComponents
                                                                                        name="firstName"
                                                                                        type="text"
                                                                                        label="First Name"
                                                                                        control="input"
                                                                                        required
                                                                                />
                                                                        </Box>
                                                                        <Box sx={{ flex: 1 }}>
                                                                                <FormComponents
                                                                                        name="middleName"
                                                                                        type="text"
                                                                                        label="Middle Name"
                                                                                        control="input"
                                                                                />
                                                                        </Box>
                                                                </Box>

                                                                <FormComponents
                                                                        name="lastName"
                                                                        type="text"
                                                                        label="Last Name"
                                                                        control="input"
                                                                        required
                                                                />
                                                                <FormComponents
                                                                        name="email"
                                                                        type="email"
                                                                        label="Email"
                                                                        control="input"
                                                                        disabled
                                                                />

                                                                <FormComponents
                                                                        name="phone"
                                                                        label="Phone Number"
                                                                        control="phone-input"
                                                                        type="text"
                                                                        country="us"
                                                                        onChange={(phoneNumber) =>
                                                                                setFieldValue('phone', phoneNumber)
                                                                        }
                                                                />
                                                                <FormComponents
                                                                        name="dateOfBirth"
                                                                        label="Date of Birth"
                                                                        control="date"
                                                                />

                                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                                                        <FormControl sx={{ p: 0 }}>
                                                                                <Checkbox
                                                                                        checked={values.isAggreed}
                                                                                        defaultChecked={true}
                                                                                        sx={authCheckboxSx}
                                                                                        required
                                                                                        size="small"
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
                                                                        sx={authPrimaryButtonSx}
                                                                        fullWidth
                                                                        type="submit"
                                                                        onClick={handleSubmit}
                                                                        disabled={!values?.isAggreed || isPending}
                                                                        endIcon={isPending && <CircularProgress size={'14px'} sx={{ color: '#fff' }} />}
                                                                >
                                                                        Sign Up
                                                                </Button>
                                                        </Form>
                                                )
                                        }}
                                </Formik>
                        ) : null}
                </Box>
        )
}

export default CreateProfile

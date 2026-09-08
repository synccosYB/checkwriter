import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'

import sliderImg1 from '../assets/images/slider-img-1.png'
import sliderImg2 from '../assets/images/slider-img-2.png'
import sliderImg3 from '../assets/images/slider-img-3.png'
import sliderImg4 from '../assets/images/slider-img-4.png'
import FormComponents from '../components/shared/forms'
import { authColors, authPrimaryButtonSx, authSecondaryButtonSx } from '../styles/authStyles'

const CompleteProfile = () => {
        const validationSchema = Yup.object({
                email: Yup.string().email('Incorrect Email').required('Required'),
                password: Yup.string()
                        .required('Password is required')
                        .min(8, 'Password must be at least 8 characters')
                        .max(16, 'Password must be less than or equal to 16 characters')
                        .matches(
                                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/,
                                'Password must contain at least one letter, one number and one special character'
                        ),
                confirmPassword: Yup.string()
                        .required('Password is required')
                        .min(8, 'Password must be at least 8 characters')
                        .max(16, 'Password must be less than or equal to 16 characters')
                        .matches(
                                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/,
                                'Password must contain at least one letter, one number and one special character'
                        ),
                phoneNumber: Yup.string().required('Phone number is required')
        })

        const initialValues = {
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                middleName: '',
                lastName: '',
                phoneNumber: '',
                name: ''
        }

        const onSubmit = async (values) => {
        }

        const industryOptions = [
                { key: 'Owner or partner', value: 'ownerOrPartner' },
                { key: 'Employee', value: 'employee' },
                { key: 'Bookkeeper or Accountant ', value: 'bookkeeperOrAccountant ' },
                { key: 'Other', value: 'other' }
        ]

        return (
                <Box
                        sx={{
                                minHeight: '100vh',
                                backgroundColor: authColors.background,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                        }}
                >
                        <Box
                                sx={{
                                        width: '100%',
                                        maxWidth: '800px',
                                        padding: { xs: '24px 16px', sm: '40px 24px', md: '48px 32px' },
                                }}
                        >
                                <div
                                        id="completeProfileCarousel"
                                        className="profile-carousel carousel slide"
                                >
                                        <Box
                                                sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        mb: 4,
                                                }}
                                        >
                                                {[0, 1, 2, 3, 4].map((idx) => (
                                                        <Box
                                                                key={idx}
                                                                data-bs-slide-to={idx}
                                                                className={idx === 0 ? 'active profile-carouse-indicator' : 'profile-carouse-indicator'}
                                                                aria-current={idx === 0 ? 'true' : undefined}
                                                                aria-label={`Slide ${idx + 1}`}
                                                                sx={{
                                                                        width: '32px',
                                                                        height: '4px',
                                                                        borderRadius: '2px',
                                                                        backgroundColor: idx === 0 ? authColors.navyLight : authColors.border,
                                                                        cursor: 'pointer',
                                                                        transition: 'background-color 0.3s ease',
                                                                }}
                                                        />
                                                ))}
                                        </Box>

                                        <div className="carousel-inner">
                                                <Formik
                                                        initialValues={initialValues}
                                                        validationSchema={validationSchema}
                                                        onSubmit={onSubmit}
                                                >
                                                        <div className="carousel-item active">
                                                                <Box
                                                                        sx={{
                                                                                backgroundColor: '#fff',
                                                                                borderRadius: '16px',
                                                                                padding: { xs: '32px 24px', sm: '48px 40px' },
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                                                textAlign: 'center',
                                                                        }}
                                                                >
                                                                        <Typography
                                                                                sx={{
                                                                                        fontSize: { xs: '22px', sm: '28px' },
                                                                                        fontWeight: 700,
                                                                                        color: authColors.textPrimary,
                                                                                        mb: 3,
                                                                                        lineHeight: 1.3,
                                                                                }}
                                                                        >
                                                                                Hi, are you using Synccheck to
                                                                                <br />
                                                                                manage a business?
                                                                        </Typography>
                                                                        <Box sx={{ mb: 4 }}>
                                                                                <img
                                                                                        className="slider-img"
                                                                                        src={sliderImg1}
                                                                                        alt="slider-img"
                                                                                        style={{ maxWidth: '280px', width: '100%' }}
                                                                                />
                                                                        </Box>
                                                                        <Box
                                                                                sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'center',
                                                                                        gap: 2,
                                                                                        flexWrap: 'wrap',
                                                                                }}
                                                                        >
                                                                                <button
                                                                                        className="carousel-control-next"
                                                                                        type="button"
                                                                                        data-bs-target="#completeProfileCarousel"
                                                                                        data-bs-slide="next"
                                                                                        style={{
                                                                                                position: 'relative',
                                                                                                padding: '12px 32px',
                                                                                                borderRadius: '8px',
                                                                                                border: `1.5px solid ${authColors.border}`,
                                                                                                backgroundColor: '#fff',
                                                                                                color: authColors.textPrimary,
                                                                                                fontSize: '15px',
                                                                                                fontWeight: 600,
                                                                                                cursor: 'pointer',
                                                                                                width: 'auto',
                                                                                        }}
                                                                                >
                                                                                        No, Personal Use
                                                                                </button>
                                                                                <button
                                                                                        className="carousel-control-next"
                                                                                        type="button"
                                                                                        data-bs-target="#completeProfileCarousel"
                                                                                        data-bs-slide="next"
                                                                                        style={{
                                                                                                position: 'relative',
                                                                                                padding: '12px 32px',
                                                                                                borderRadius: '8px',
                                                                                                border: 'none',
                                                                                                background: `linear-gradient(135deg, ${authColors.navy} 0%, ${authColors.navyLight} 100%)`,
                                                                                                color: '#fff',
                                                                                                fontSize: '15px',
                                                                                                fontWeight: 600,
                                                                                                cursor: 'pointer',
                                                                                                width: 'auto',
                                                                                        }}
                                                                                >
                                                                                        Yes, for Business
                                                                                </button>
                                                                        </Box>
                                                                </Box>
                                                        </div>

                                                        <div className="carousel-item">
                                                                <Box
                                                                        sx={{
                                                                                backgroundColor: '#fff',
                                                                                borderRadius: '16px',
                                                                                padding: { xs: '32px 24px', sm: '48px 40px' },
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                                                textAlign: 'center',
                                                                        }}
                                                                >
                                                                        <Typography
                                                                                sx={{
                                                                                        fontSize: { xs: '22px', sm: '28px' },
                                                                                        fontWeight: 700,
                                                                                        color: authColors.textPrimary,
                                                                                        mb: 3,
                                                                                }}
                                                                        >
                                                                                What's Your Business Name?
                                                                        </Typography>
                                                                        <Box sx={{ mb: 3 }}>
                                                                                <img
                                                                                        className="slider-img"
                                                                                        src={sliderImg2}
                                                                                        alt="slider-img"
                                                                                        style={{ maxWidth: '280px', width: '100%' }}
                                                                                />
                                                                        </Box>
                                                                        <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        placeholder="Enter Your business Name"
                                                                                        name="BusinessName"
                                                                                        label="Business Name"
                                                                                />
                                                                        </Box>
                                                                        <button
                                                                                className="carousel-control-next"
                                                                                type="button"
                                                                                data-bs-target="#completeProfileCarousel"
                                                                                data-bs-slide="next"
                                                                                style={{
                                                                                        position: 'relative',
                                                                                        padding: '12px 48px',
                                                                                        borderRadius: '8px',
                                                                                        border: 'none',
                                                                                        background: `linear-gradient(135deg, ${authColors.navy} 0%, ${authColors.navyLight} 100%)`,
                                                                                        color: '#fff',
                                                                                        fontSize: '15px',
                                                                                        fontWeight: 600,
                                                                                        cursor: 'pointer',
                                                                                        width: 'auto',
                                                                                }}
                                                                        >
                                                                                Next
                                                                        </button>
                                                                </Box>
                                                        </div>

                                                        <div className="carousel-item">
                                                                <Box
                                                                        sx={{
                                                                                backgroundColor: '#fff',
                                                                                borderRadius: '16px',
                                                                                padding: { xs: '32px 24px', sm: '48px 40px' },
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                                                textAlign: 'center',
                                                                        }}
                                                                >
                                                                        <Typography
                                                                                sx={{
                                                                                        fontSize: { xs: '22px', sm: '28px' },
                                                                                        fontWeight: 700,
                                                                                        color: authColors.textPrimary,
                                                                                        mb: 3,
                                                                                }}
                                                                        >
                                                                                What's Your Industry?
                                                                        </Typography>
                                                                        <Box sx={{ mb: 3 }}>
                                                                                <img
                                                                                        className="slider-img"
                                                                                        src={sliderImg2}
                                                                                        alt="slider-img"
                                                                                        style={{ maxWidth: '280px', width: '100%' }}
                                                                                />
                                                                        </Box>
                                                                        <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
                                                                                <FormComponents
                                                                                        name="industry"
                                                                                        label="Select One"
                                                                                        control="select"
                                                                                        options={industryOptions}
                                                                                />
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                                                                <button
                                                                                        className="carousel-control-next"
                                                                                        type="button"
                                                                                        data-bs-target="#completeProfileCarousel"
                                                                                        data-bs-slide="next"
                                                                                        style={{
                                                                                                position: 'relative',
                                                                                                padding: '12px 32px',
                                                                                                borderRadius: '8px',
                                                                                                border: `1.5px solid ${authColors.border}`,
                                                                                                backgroundColor: '#fff',
                                                                                                color: authColors.textSecondary,
                                                                                                fontSize: '15px',
                                                                                                fontWeight: 600,
                                                                                                cursor: 'pointer',
                                                                                                width: 'auto',
                                                                                        }}
                                                                                >
                                                                                        Skip
                                                                                </button>
                                                                                <button
                                                                                        className="carousel-control-next"
                                                                                        type="button"
                                                                                        data-bs-target="#completeProfileCarousel"
                                                                                        data-bs-slide="next"
                                                                                        style={{
                                                                                                position: 'relative',
                                                                                                padding: '12px 48px',
                                                                                                borderRadius: '8px',
                                                                                                border: 'none',
                                                                                                background: `linear-gradient(135deg, ${authColors.navy} 0%, ${authColors.navyLight} 100%)`,
                                                                                                color: '#fff',
                                                                                                fontSize: '15px',
                                                                                                fontWeight: 600,
                                                                                                cursor: 'pointer',
                                                                                                width: 'auto',
                                                                                        }}
                                                                                >
                                                                                        Next
                                                                                </button>
                                                                        </Box>
                                                                </Box>
                                                        </div>

                                                        <div className="carousel-item">
                                                                <Box
                                                                        sx={{
                                                                                backgroundColor: '#fff',
                                                                                borderRadius: '16px',
                                                                                padding: { xs: '32px 24px', sm: '48px 40px' },
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                                                textAlign: 'center',
                                                                        }}
                                                                >
                                                                        <Typography
                                                                                sx={{
                                                                                        fontSize: { xs: '22px', sm: '28px' },
                                                                                        fontWeight: 700,
                                                                                        color: authColors.textPrimary,
                                                                                        mb: 3,
                                                                                }}
                                                                        >
                                                                                What's Your Role In The Company?
                                                                        </Typography>
                                                                        <img
                                                                                className="slider-img"
                                                                                src={sliderImg3}
                                                                                alt="slider-img"
                                                                                style={{ maxWidth: '280px', width: '100%' }}
                                                                        />
                                                                </Box>
                                                        </div>

                                                        <div className="carousel-item">
                                                                <Box
                                                                        sx={{
                                                                                backgroundColor: '#fff',
                                                                                borderRadius: '16px',
                                                                                padding: { xs: '32px 24px', sm: '48px 40px' },
                                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                                                textAlign: 'center',
                                                                        }}
                                                                >
                                                                        <Typography
                                                                                sx={{
                                                                                        fontSize: { xs: '22px', sm: '28px' },
                                                                                        fontWeight: 700,
                                                                                        color: authColors.textPrimary,
                                                                                        mb: 3,
                                                                                }}
                                                                        >
                                                                                What's Your Monthly Transactional
                                                                                <br />
                                                                                Volume?
                                                                        </Typography>
                                                                        <img
                                                                                className="slider-img"
                                                                                src={sliderImg4}
                                                                                alt="slider-img"
                                                                                style={{ maxWidth: '280px', width: '100%' }}
                                                                        />
                                                                </Box>
                                                        </div>
                                                </Formik>
                                        </div>
                                </div>
                        </Box>
                </Box>
        )
}

export default CompleteProfile

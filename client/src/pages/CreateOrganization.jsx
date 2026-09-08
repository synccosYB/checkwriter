import { Formik } from 'formik'
import office from '../assets/svg/office.svg'
import * as Yup from 'yup'
import FormComponents from '../components/shared/forms'
import industries from '../utils/industries.json'
import countryData from '../utils/countryStateCity.json'
import { useState } from 'react'
import { AddPhotoAlternateOutlined } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../redux/snackbarState'
import { useHistory } from 'react-router-dom/cjs/react-router-dom'
import useAddOrganization from '../API/users/organizations/useAddOrganization'
import { Box, Typography, Button } from '@mui/material'
import {
        authPrimaryButtonSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authColors,
} from '../styles/authStyles'

const CreateOrganization = () => {
        const { mutate: addOrganization } = useAddOrganization()
        const dispatch = useDispatch()
        const history = useHistory()
        const [hovered, setHovered] = useState(false)

        const initialValues = {
                name: '',
                location: '',
                industry: ''
        }

        const validationSchema = Yup.object().shape({
                name: Yup.string().required('Required'),
                location: Yup.string().required('Required!'),
                industry: Yup.string().required('Required!')
        })

        const onSubmit = async (values) => {
                try {
                        if (!img) {
                                dispatch(
                                        updateSnackbar({
                                                open: true,
                                                severity: 'error',
                                                message: 'Logo Image is required for creating organization.'
                                        })
                                )
                        } else {
                                let body = {
                                        organizationName: values.name,
                                        organizationLogo: img,
                                        location: values.location,
                                        industryType: values.industry
                                }

                                addOrganization(body, {
                                        onSuccess: (res) => {
                                                localStorage.setItem('organization', res.data._id)
                                        }
                                })

                                dispatch(
                                        updateSnackbar({
                                                open: true,
                                                severity: 'success',
                                                message: 'Organization updated successfully.'
                                        })
                                )
                                history.push('/dashboard/main')
                        }
                } catch (err) {
                        console.error(err)
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'error',
                                        message: 'Unable to add organization.'
                                })
                        )
                }
        }

        const [file, setFile] = useState()
        const [img, setImg] = useState('')

        const handleChange = async (e) => {
                if (e.target.files.length > 0) {
                        let reader = new FileReader()

                        reader.onload = function () {
                                setImg(reader.result)
                        }
                        reader.readAsDataURL(e.target.files[0])
                        setFile(URL.createObjectURL(e.target.files[0]))
                }
        }

        const handleHover = (hover) => {
                setHovered(hover)
        }

        return (
                <Box
                        sx={{
                                minHeight: '100vh',
                                backgroundColor: authColors.background,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: { xs: '24px 16px', sm: '40px 24px' },
                        }}
                >
                        <Box
                                sx={{
                                        ...authCardSx,
                                        maxWidth: '600px',
                                        padding: { xs: '32px 24px', sm: '48px 40px' },
                                }}
                        >
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                        <Typography sx={authPageTitleSx}>
                                                Tell Us About Your Organization
                                        </Typography>
                                        <Typography sx={authPageSubtitleSx}>
                                                Set up your organization to get started with Synccos.
                                        </Typography>
                                </Box>

                                <Box
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mb: 4,
                                        }}
                                >
                                        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                                                <Box
                                                        sx={{
                                                                width: '140px',
                                                                height: '140px',
                                                                borderRadius: '50%',
                                                                backgroundColor: authColors.borderLight,
                                                                border: `2px dashed ${authColors.border}`,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                overflow: 'hidden',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                        borderColor: authColors.navyLight,
                                                                        backgroundColor: 'rgba(30, 58, 95, 0.04)',
                                                                },
                                                        }}
                                                        onMouseEnter={() => handleHover(true)}
                                                        onMouseLeave={() => handleHover(false)}
                                                >
                                                        {hovered ? (
                                                                <>
                                                                        <AddPhotoAlternateOutlined
                                                                                sx={{
                                                                                        fontSize: 36,
                                                                                        color: authColors.navyLight,
                                                                                        mb: 0.5,
                                                                                }}
                                                                        />
                                                                        <Typography
                                                                                sx={{
                                                                                        fontSize: '12px',
                                                                                        color: authColors.navyLight,
                                                                                        fontWeight: 500,
                                                                                }}
                                                                        >
                                                                                {file ? 'Change' : 'Upload'}
                                                                        </Typography>
                                                                </>
                                                        ) : file ? (
                                                                <img
                                                                        src={file}
                                                                        alt=""
                                                                        style={{
                                                                                width: '140px',
                                                                                height: '140px',
                                                                                borderRadius: '50%',
                                                                                objectFit: 'cover',
                                                                        }}
                                                                />
                                                        ) : (
                                                                <img
                                                                        alt=""
                                                                        src={office}
                                                                        style={{
                                                                                width: '60px',
                                                                                height: '60px',
                                                                                opacity: 0.5,
                                                                        }}
                                                                />
                                                        )}
                                                </Box>
                                        </label>
                                        <input
                                                type="file"
                                                id="file-input"
                                                onChange={handleChange}
                                                style={{ display: 'none' }}
                                        />
                                </Box>

                                <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={onSubmit}
                                        enableReinitialize={true}
                                >
                                        {({ handleSubmit }) => {
                                                return (
                                                        <Box>
                                                                <Box sx={{ mb: 2 }}>
                                                                        <FormComponents
                                                                                name="name"
                                                                                type="text"
                                                                                label="Organization Name"
                                                                                control="input"
                                                                        />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                                        <Box sx={{ flex: 1 }}>
                                                                                <FormComponents
                                                                                        name="location"
                                                                                        type="text"
                                                                                        label="Location"
                                                                                        control="select"
                                                                                        options={[
                                                                                                ...new Set(
                                                                                                        countryData?.flatMap((obj) => {
                                                                                                                return {
                                                                                                                        key: obj?.name,
                                                                                                                        value: obj?.name
                                                                                                                }
                                                                                                        })
                                                                                                )
                                                                                        ]}
                                                                                />
                                                                        </Box>
                                                                        <Box sx={{ flex: 1 }}>
                                                                                <FormComponents
                                                                                        name="industry"
                                                                                        type="text"
                                                                                        label="Industry"
                                                                                        control="select"
                                                                                        options={[
                                                                                                ...new Set(
                                                                                                        industries['industries']?.flatMap((obj) => {
                                                                                                                return {
                                                                                                                        key: obj?.name,
                                                                                                                        value: obj?.value
                                                                                                                }
                                                                                                        })
                                                                                                )
                                                                                        ]}
                                                                                />
                                                                        </Box>
                                                                </Box>

                                                                <Button
                                                                        type="submit"
                                                                        onClick={handleSubmit}
                                                                        sx={{ ...authPrimaryButtonSx, mt: 2 }}
                                                                >
                                                                        Create Organization
                                                                </Button>
                                                        </Box>
                                                )
                                        }}
                                </Formik>
                        </Box>
                </Box>
        )
}

export default CreateOrganization

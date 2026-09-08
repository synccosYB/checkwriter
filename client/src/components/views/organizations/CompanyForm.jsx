import { CloseOutlined, CorporateFare, EditOutlined } from '@mui/icons-material'
import { Icon, IconButton } from '@mui/material'
import { Form, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../../redux/snackbarState'
import { useHistory } from 'react-router-dom/cjs/react-router-dom'
import useUpdateOrganization from '../../../API/users/organizations/useUpdateOrganization'
import useAddOrganization from '../../../API/users/organizations/useAddOrganization'

import AddressAutocomplete from '../../addressAutocomplete'

const entityTypes = [
        { key: 'Sole Proprietor', value: 'Sole Proprietor' },
        { key: 'Single Member LLC', value: 'Single Member LLC' },
        { key: 'Limited Liability Company', value: 'Limited Liability Company' },
        { key: 'General Partnership', value: 'General Partnership' },
        { key: 'Unlisted Corporation', value: 'Unlisted Corporation' },
        {
                key: 'Publicly Traded Corporation',
                value: 'Publicly Traded Corporation'
        },
        { key: 'Association', value: 'Association' },
        { key: 'Non Profit', value: 'Non Profit' },
        { key: 'Government Organization', value: 'Government Organization' },
        { key: 'Revocable Trust', value: 'Revocable Trust' },
        { key: 'Irrevocable Trust', value: 'Irrevocable Trust' },
        { key: 'Estate', value: 'estate' },
        { key: 'Other', value: 'other' }
]

const industryTypes = [
        { key: 'Retail', value: 'Retail' },
        { key: 'Wholesale', value: 'Wholesale' },
        { key: 'Restaurants', value: 'Restaurants' },
        { key: 'Hospitals', value: 'Hospitals' },
        { key: 'Construction', value: 'Construction' },
        { key: 'Insurance', value: 'Insurance' },
        { key: 'Unions', value: 'Unions' },
        { key: 'Real Estate', value: 'Real Estate' },
        { key: 'Freelance Professional', value: 'Freelance Professional' },
        {
                key: 'Other Professional Services',
                value: 'Other Professional Services'
        },
        { key: 'Online Retailer', value: 'Online Retailer' },
        { key: 'Other Education Services', value: 'Other Education Services' },
        { key: 'Other', value: 'Other' }
]

const CompanyForm = ({ data, isUpdate }) => {
        const dispatch = useDispatch()
        const history = useHistory()
        const [image, setImage] = useState(data?.organizationLogo)
        const { mutate: updateOrganization, isPending: isUpdating } =
                useUpdateOrganization()
        const { mutate: addOrganization, isPending: isAdding } = useAddOrganization()
        const [logoRemoved, setLogoRemoved] = useState(false)

        useEffect(() => {
                if (data?.organizationLogo) setImage(data?.organizationLogo)
        }, [data?.organizationLogo])

        const myInitialValues = {
                organizationName: data?.organizationName || '',
                addressLine1: data?.addressLine1 || '',
                addressLine2: data?.addressLine2 || '',
                city: data?.city || '',
                state: data?.state || '',
                country: data?.country || '',
                entityType: data?.entityType || '',
                zip: data?.zip || '',
                dba: data?.dba || '',
                formationDate: data?.formationDate || new Date(),
                industryType: data?.industryType || '',
                ein: data?.ein || '',
                logoChanged: false
        }
        const formikRef = useRef(null)
        const fileInputRef = useRef(null)

        const handleAddressChange = (e, setFieldValue, validateForm) => {
                if (e && e.target) {
                        const { name, value } = e.target // For regular input elements
                        setFieldValue(name, value) // Update the field value
                } else {
                        // This branch handles cases where 'e' is a custom event (like from a dropdown)
                        // setFieldValue('city', e);  // Set the 'city' value directly
                }
                validateForm()
        }

        const validationSchema = Yup.object({
                organizationName: Yup.string().required('Required'),

                addressLine1: Yup.string().required('required'),
                addressLine2: Yup.string(),
                city: Yup.string().required('required'),
                state: Yup.string().required('required'),
                country: Yup.string().required('required'),
                zip: Yup.string().required('required'),
                dba: Yup.string(),
                formationDate: Yup.date(),
                industryType: Yup.string(),
                ein: Yup.string()
        })

        const handleChange = async (event) => {
                if (event?.target?.files.length === 0) {
                        return false
                }

                const file = event?.target?.files[0]

                setImage(file)
                setLogoRemoved(false)
                if (file?.size > 5000000) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'info',
                                        message: 'Image more that 5MB is not allowed.'
                                })
                        )
                        return false
                }

                const reader = new FileReader()

                reader.onload = function (e) {
                        document.getElementById('organization-logo').src = e.target.result
                }

                reader.readAsDataURL(file)

                if (formikRef.current) {
                        formikRef.current.setFieldValue('logoChanged', true)
                }
        }

        const handleRemoveImage = () => {
                setImage('')
                setLogoRemoved(true)

                const imgEl = document.getElementById('organization-logo')
                if (imgEl) imgEl.src = ''

                if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                }

                if (formikRef.current) {
                        formikRef.current.setFieldValue('logoChanged', true, false)
                }
        }

        const handleButtonClick = () => {
                fileInputRef.current.click()
        }

        const onSubmit = async (values) => {
                const {
                        addressLine1,
                        addressLine2,
                        city,
                        country,
                        state,
                        zip,
                        logoChanged,
                        ...rest
                } = values

                const keys = Object.keys(rest)

                let body = new FormData()

                keys.forEach((key) => {
                        body.append(key, values[key])
                })

                body.append(
                        'address',
                        JSON.stringify({
                                addressLine1,
                                addressLine2,
                                city,
                                country,
                                state,
                                zip
                        })
                )
                let formDataObject = {}
                for (let [key, value] of body.entries()) {
                        formDataObject[key] = value
                }

                if (logoRemoved) {
                        body.append('removeLogo', 'true')
                }

                if (image && typeof image !== 'string') {
                        body.append('organizationLogo', image)
                }

                try {
                        if (isUpdate) {
                                updateOrganization({ id: data?._id, data: body })
                        } else {
                                addOrganization(body)
                        }
                } catch (err) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'error',
                                        message: isUpdate
                                                ? 'Unable to update organization.'
                                                : 'Unable to create organization.'
                                })
                        )
                }
        }

        return (
                <>
                        <div className="company-form-row mb-3">
                                <div className="row m-0">
                                        <p className="fs-6 mb-4 fw-semibold">Business Logo</p>

                                        <div className="image-upload-div position-relative d-flex align-items-center justify-content-center">
                                                <Icon
                                                        sx={{
                                                                width: 'auto',
                                                                height: 'auto'
                                                        }}
                                                >
                                                        {image && image !== '' ? (
                                                                <img
                                                                        src={image}
                                                                        style={{
                                                                                width: '110px',
                                                                                height: '110px',
                                                                                borderRadius: '55px',
                                                                                color: '#fff'
                                                                        }}
                                                                        alt="organization-logo"
                                                                        id="organization-logo"
                                                                />
                                                        ) : (
                                                                <CorporateFare
                                                                        sx={{
                                                                                width: '3rem',
                                                                                height: '3rem',
                                                                                color: '#fff'
                                                                        }}
                                                                />
                                                        )}
                                                </Icon>
                                                <input
                                                        type="file"
                                                        id="file-input"
                                                        ref={fileInputRef}
                                                        style={{ display: 'none' }}
                                                        onChange={handleChange}
                                                        accept="image/png, image/jpeg, image/jpg"
                                                />
                                                <IconButton
                                                        sx={{
                                                                color: '#757575',
                                                                backgroundColor: '#F5F5F5',
                                                                position: 'absolute',
                                                                right: '0',
                                                                bottom: '10px'
                                                        }}
                                                        onClick={handleButtonClick}
                                                >
                                                        <EditOutlined
                                                                sx={{
                                                                        width: '14px',
                                                                        height: '14px'
                                                                }}
                                                        />
                                                </IconButton>
                                                <IconButton
                                                        sx={{
                                                                color: '#757575',
                                                                backgroundColor: '#F5F5F5',
                                                                position: 'absolute',
                                                                bottom: '10px',
                                                                borderRadius: '100% !important',
                                                                right: '16px',
                                                                top: '0px',
                                                                width: '18px',
                                                                height: '18px',
                                                                padding: '5px'
                                                        }}
                                                        onClick={handleRemoveImage}
                                                >
                                                        <CloseOutlined
                                                                sx={{
                                                                        width: '18px',
                                                                        height: '18px'
                                                                }}
                                                        />
                                                </IconButton>
                                        </div>
                                </div>
                        </div>
                        <div>
                                <p
                                        className="fs-6 mb-4 fw-semibold"
                                        style={{ marginLeft: '12px', marginTop: '10px' }}
                                >
                                        Basic Details
                                </p>
                                <Formik
                                        innerRef={formikRef}
                                        initialValues={myInitialValues}
                                        validationSchema={validationSchema}
                                        validateOnMount
                                        onSubmit={onSubmit}
                                >
                                        {({
                                                isValid,
                                                dirty,
                                                setFieldValue,
                                                validateForm,
                                                handleSubmit,
                                                values
                                        }) => {
                                                return (
                                                        <Form onSubmit={handleSubmit}>
                                                                <div className="row m-0">
                                                                        <div className="col-12">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        // type="text"
                                                                                        name="organizationName"
                                                                                        label="Organization Name"
                                                                                        autocomplete="off"
                                                                                />
                                                                        </div>
                                                                </div>

                                                                <div className="row m-0">
                                                                        <AddressAutocomplete
                                                                                onChange={(address) => {
                                                                                        const fields = [
                                                                                                'addressLine1',
                                                                                                'addressLine2',
                                                                                                'city',
                                                                                                'country',
                                                                                                'zip',
                                                                                                'state',
                                                                                                'name'
                                                                                        ]

                                                                                        fields.forEach((item) => {
                                                                                                if (
                                                                                                        !values.organizationName &&
                                                                                                        item === 'name' &&
                                                                                                        address[item]
                                                                                                )
                                                                                                        setFieldValue('organizationName', address[item])
                                                                                                else if (address[item])
                                                                                                        setFieldValue(item, address[item])
                                                                                        })
                                                                                }}
                                                                        />
                                                                </div>
                                                                <div className="row m-0">
                                                                        <div className="col-12 col-md-6">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="addressLine1"
                                                                                        label="Address Line 1"
                                                                                        onChange={(e) =>
                                                                                                handleAddressChange(e, setFieldValue, validateForm)
                                                                                        }
                                                                                />
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="addressLine2"
                                                                                        label="Address Line 2"
                                                                                        onChange={(e) =>
                                                                                                handleAddressChange(e, setFieldValue, validateForm)
                                                                                        }
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="row m-0">
                                                                        <div className="col-6 col-md-6 col-lg-3">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="city"
                                                                                        label="City"
                                                                                        onChange={(e) =>
                                                                                                handleAddressChange(e, setFieldValue, validateForm)
                                                                                        }
                                                                                />
                                                                        </div>
                                                                        <div className="col-6 col-md-6 col-lg-3">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="state"
                                                                                        label="State"
                                                                                        onChange={(e) =>
                                                                                                handleAddressChange(e, setFieldValue, validateForm)
                                                                                        }
                                                                                />
                                                                        </div>
                                                                        <div className="col-6 col-md-6 col-lg-3">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="country"
                                                                                        label="Country"
                                                                                        onChange={(e) =>
                                                                                                handleAddressChange(e, setFieldValue, validateForm)
                                                                                        }
                                                                                />
                                                                        </div>
                                                                        <div className="col-6 col-md-6 col-lg-3">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="zip"
                                                                                        label="Zip Code"
                                                                                        onChange={(e) =>
                                                                                                handleAddressChange(e, setFieldValue, validateForm)
                                                                                        }
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="row m-0">
                                                                        <div className="col-12 col-md-6">
                                                                                <FormComponents
                                                                                        name="entityType"
                                                                                        label="Entity Type"
                                                                                        control="select"
                                                                                        options={entityTypes}
                                                                                />
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="dba"
                                                                                        label="DBA"
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="row m-0">
                                                                        <div className="col-12 col-md-4">
                                                                                <FormComponents
                                                                                        name="formationDate"
                                                                                        label="Formation Date"
                                                                                        control="date"
                                                                                />
                                                                        </div>
                                                                        <div className="col-12 col-md-4">
                                                                                <FormComponents
                                                                                        name="industryType"
                                                                                        label="Industry Type"
                                                                                        control="select"
                                                                                        options={industryTypes}
                                                                                />
                                                                        </div>
                                                                        <div className="col-12 col-md-4">
                                                                                <FormComponents
                                                                                        control="input"
                                                                                        type="text"
                                                                                        name="ein"
                                                                                        label="EIN"
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="row m-0">
                                                                        <div className="d-flex align-items-center justify-content-end">
                                                                                <ButtonComponent
                                                                                        onClick={() => {
                                                                                                history.push('/dashboard/manage-organizations')
                                                                                        }}
                                                                                        variant="light"
                                                                                        text="Cancel"
                                                                                />
                                                                                <div>
                                                                                        <ButtonComponent
                                                                                                variant="dark"
                                                                                                text={
                                                                                                        [isAdding, isUpdating].some((item) => item)
                                                                                                                ? 'Saving Cahnges ...'
                                                                                                                : 'Save Changes'
                                                                                                }
                                                                                                extraClass="ms-3"
                                                                                                type="submit"
                                                                                                disabled={!isValid || !dirty}
                                                                                        />
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        </Form>
                                                )
                                        }}
                                </Formik>
                        </div>
                </>
        )
}

export default CompanyForm

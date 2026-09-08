import React from 'react'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import * as Yup from 'yup'
import { CircularProgress, TextField } from '@mui/material'
import { ErrorOutlined } from '@mui/icons-material'
import { Field, Form, Formik } from 'formik'
import GenericTable from '../../shared/GenericTable/GenericTable'
import ButtonComponent from '../../shared/ButtonComponent'
import EmailEditor from '../Editor/EmailEditor'
import TextError from '../../../hoc/TextError'
import FormModalMUI from '../../shared/Modals/FormModalMUI'
import useEmailChecks from '../../../API/checks/useEmailChecks'
import { formatUSD } from '../../../utils/helper'

const validationSchema = Yup.object({
        email: Yup.string()
                .required('Email is required')
                .test('valid-emails', 'One or more emails are invalid', (value) => {
                        if (!value) return false
                        const emails = value.split(',').map((email) => email.trim())
                        return emails.every((email) => Yup.string().email().isValidSync(email))
                }),
        subject: Yup.string().required('Required!')
})

const columnData = [
        {
                key: '#',
                value: 'sno',
                colWidth: '2%',
                align: 'center',
                type: 'html'
        },
        {
                key: 'Check No.',
                value: 'checkNumber',
                colWidth: '10%',
                align: 'center',
                isSort: true,
                sortType: 'number'
        },
        {
                key: 'Amount',
                value: 'amount',
                colWidth: '10%',
                align: 'center',
                isSort: true,
                sortType: 'number'
        },
        {
                key: 'Issued date',
                value: 'issuedDate',
                colWidth: '13%',
                align: 'center',
                isSort: true,
                sortType: 'date'
        },
        {
                key: 'Bank NickName',
                value: 'bankNickname',
                colWidth: '12%',
                type: 'html',
                align: 'center'
        }
]

const initialValues = {
        email: '',
        subject: 'You just got paid!'
}

const EmailChecks = ({ selectedData, onClose, setSelectedRows }) => {
        const { mutate: emailChecks, isPending } = useEmailChecks()

        const [value, setValue] = React.useState('Template')

        const [isConfirmSendModal, setIsConfirmSendModal] = React.useState(false)
        const [alreadyUploadedFiles] = React.useState([])

        const [content, setContent] = React.useState('')

        const totalCost = selectedData?.reduce(
                (acc, item) => (acc += parseFloat(item.amount)),
                0
        )

        const formValues = {
                ...initialValues,
                email: [
                        ...new Set(
                                selectedData?.map((item) => item?.payee?.email).filter((email) => email)
                        )
                ].join(', ')
        }

        const handleChange = (_, newValue) => {
                setValue(newValue)
        }

        const onSubmit = (values) => {
                const payload = {
                        checkIds: selectedData?.map((item) => item?._id),
                        content,
                        subject: values.subject,
                        emails: [...new Set(values.email.split(',').map((i) => i.trim()))]
                }

                emailChecks(payload, {
                        onSuccess: () => {
                                onClose()
                                setSelectedRows([])
                        }
                })
        }

        return (
                <>
                        <TabContext
                                value={value}
                                sx={{
                                        width: '100%',
                                        '& .MuiDialogContent-root': {
                                                width: '100%',
                                                backgroundColor: 'red'
                                        }
                                }}
                        >
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <TabList
                                                onChange={handleChange}
                                                aria-label="lab API tabs example"
                                                TabIndicatorProps={{
                                                        style: {
                                                                backgroundColor: '#1e3a5f'
                                                        }
                                                }}
                                                variant="fullWidth"
                                        >
                                                <Tab
                                                        label="Template"
                                                        value="Template"
                                                        style={{ color: '#1e3a5f' }}
                                                        className="fw-bold"
                                                />
                                                <Tab
                                                        label="Checks"
                                                        value="Checks"
                                                        style={{ color: '#1e3a5f' }}
                                                        className="fw-bold"
                                                />
                                        </TabList>
                                </Box>
                                <TabPanel value="Template">
                                        <div
                                                className="mail-container"
                                                style={{ maxWidth: 'inherit', width: '100%' }}
                                        >
                                                <div
                                                        className="mail-container-inner"
                                                        style={{ maxWidth: 'inherit', width: '100%' }}
                                                >
                                                        <Formik
                                                                initialValues={formValues}
                                                                validationSchema={validationSchema}
                                                                onSubmit={onSubmit}
                                                        >
                                                                {({ values, handleSubmit, isValid }) => {
                                                                        return (
                                                                                <Form onSubmit={handleSubmit}>
                                                                                        <Field name="email">
                                                                                                {({ field, form }) => {
                                                                                                        const {
                                                                                                                setFieldValue,
                                                                                                                errors,
                                                                                                                touched,
                                                                                                                setTouched,
                                                                                                                validateField
                                                                                                        } = form

                                                                                                        const handleChange = (e) => {
                                                                                                                let value = e.target.value

                                                                                                                value = value.replace(/[\s,]+/g, ', ')

                                                                                                                const uniqueEmails = [
                                                                                                                        ...new Set(
                                                                                                                                value.split(', ').map((email) => email.trim())
                                                                                                                        )
                                                                                                                ]

                                                                                                                setFieldValue(field.name, uniqueEmails.join(', '))

                                                                                                                validateField(field.name)
                                                                                                        }

                                                                                                        const handleBlur = () => {
                                                                                                                setTouched({ ...touched, [field.name]: true })
                                                                                                                validateField(field.name)
                                                                                                        }

                                                                                                        return (
                                                                                                                <>
                                                                                                                        <div className="form-div preffix d-flex align-items-center justify-content-start position-relative mb-4">
                                                                                                                                <div className="input-prefix">To</div>
                                                                                                                                <TextField
                                                                                                                                        placeholder="payee@organisation.com"
                                                                                                                                        label=""
                                                                                                                                        name={field.name}
                                                                                                                                        className="custom-text-field"
                                                                                                                                        value={field.value}
                                                                                                                                        onChange={handleChange}
                                                                                                                                        onBlur={handleBlur}
                                                                                                                                        sx={{
                                                                                                                                                width: '100%',
                                                                                                                                                '& input': {
                                                                                                                                                        padding: '12px 0px',
                                                                                                                                                        fontSize: '12px',
                                                                                                                                                        color: '#757575'
                                                                                                                                                },
                                                                                                                                                '& fieldset': {
                                                                                                                                                        border: 'none'
                                                                                                                                                }
                                                                                                                                        }}
                                                                                                                                />
                                                                                                                                {errors.email && (
                                                                                                                                        <TextError>{errors.email} </TextError>
                                                                                                                                )}
                                                                                                                        </div>
                                                                                                                </>
                                                                                                        )
                                                                                                }}
                                                                                        </Field>

                                                                                        <Field name="subject" value={values.subject}>
                                                                                                {({ field, form }) => {
                                                                                                        const { setFieldValue } = form

                                                                                                        return (
                                                                                                                <>
                                                                                                                        <div className="form-div preffix d-flex align-items-center justify-content-start mb-3 position-relative">
                                                                                                                                <div className="input-prefix d-flex align-items-center justify-content-start">
                                                                                                                                        Subject{' '}
                                                                                                                                        <span
                                                                                                                                                className="ms-1"
                                                                                                                                                style={{ color: 'red' }}
                                                                                                                                        >
                                                                                                                                                *
                                                                                                                                        </span>
                                                                                                                                </div>
                                                                                                                                <TextField
                                                                                                                                        placeholder="Your email subject"
                                                                                                                                        label=""
                                                                                                                                        className="custom-text-field"
                                                                                                                                        name={field.name}
                                                                                                                                        value={field.value}
                                                                                                                                        onChange={(e) => {
                                                                                                                                                setFieldValue(field.name, e.target.value)
                                                                                                                                        }}
                                                                                                                                        sx={{
                                                                                                                                                width: '100%',
                                                                                                                                                '& input': {
                                                                                                                                                        padding: '12px 0px',
                                                                                                                                                        fontSize: '12px',
                                                                                                                                                        color: '#757575'
                                                                                                                                                },
                                                                                                                                                '& fieldset': {
                                                                                                                                                        border: 'none'
                                                                                                                                                }
                                                                                                                                        }}
                                                                                                                                />
                                                                                                                                {form?.errors && form?.errors?.subject ? (
                                                                                                                                        <TextError>Required!</TextError>
                                                                                                                                ) : null}
                                                                                                                        </div>
                                                                                                                </>
                                                                                                        )
                                                                                                }}
                                                                                        </Field>

                                                                                        <EmailEditor content={content} setContent={setContent} />
                                                                                        <div className="d-flex align-items-center justify-content-end mt-3">
                                                                                                <ButtonComponent
                                                                                                        text="Send"
                                                                                                        variant="dark"
                                                                                                        disabled={isPending || !isValid}
                                                                                                        type="submit"
                                                                                                        extraClass="me-3"
                                                                                                        endIcon={isPending && <CircularProgress size={14} />}
                                                                                                />
                                                                                        </div>
                                                                                </Form>
                                                                        )
                                                                }}
                                                        </Formik>
                                                </div>
                                        </div>
                                </TabPanel>
                                <TabPanel value="Checks">
                                        <div className="d-block">
                                                <div className="fw-bold text-secondary float-start">
                                                        <small>Selected Checks</small>
                                                </div>
                                                <div
                                                        className="alert alert-success p-0 fw-bold"
                                                        style={{ width: 'fit-content', margin: '0 auto' }}
                                                >
                                                        <small className="px-2 fs-12">
                                                                Total Cost : {formatUSD(totalCost)}
                                                        </small>
                                                </div>
                                                <div className="fw-bold text-secondary" />
                                        </div>
                                        <div
                                                className="generic-table-container"
                                                style={{ maxWidth: 'inherit', width: '100%', height: '55vh' }}
                                        >
                                                <GenericTable
                                                        columnData={columnData}
                                                        modifiedData={makeTableData(selectedData)}
                                                        count={selectedData?.data?.length || 0}
                                                        initialfilter={''}
                                                        height={'45vh'}
                                                />
                                        </div>
                                        <div className="d-flex justify-content-end">
                                                <ButtonComponent text="Save" variant="dark" type="button" />
                                        </div>
                                </TabPanel>
                                {isConfirmSendModal && (
                                        <FormModalMUI
                                                onClose={() => {
                                                        setIsConfirmSendModal(!isConfirmSendModal)
                                                }}
                                                open={isConfirmSendModal}
                                                maxWidth="sm"
                                        >
                                                <div className="container">
                                                        <div className="">
                                                                <div className="d-flex align-items-center justify-content-center txt-danger mt-3 mb-2">
                                                                        <ErrorOutlined sx={{ fontSize: '80px' }} />
                                                                </div>
                                                                <div className="col d-flex justify-content-center">
                                                                        <div className="row">
                                                                                <h3>
                                                                                        <p>
                                                                                                <b>Confirm Deletion?</b>
                                                                                        </p>
                                                                                </h3>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className="row">
                                                                <div className="col d-flex justify-content-center">
                                                                        <div className="row">
                                                                                <p className="text-center m-0 mb-2">
                                                                                        {alreadyUploadedFiles.length}{' '}
                                                                                        {alreadyUploadedFiles?.length > 1 ? 'checks' : 'check'}{' '}
                                                                                        already exist. You want to re-upload that?
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>

                                                <div className="d-flex align-items-center justify-content-center mt-3 mb-4">
                                                        <ButtonComponent
                                                                text="Cancel"
                                                                type="button"
                                                                variant="light"
                                                                click={() => {
                                                                        setIsConfirmSendModal(!isConfirmSendModal)
                                                                }}
                                                                extraClass="me-3"
                                                        />
                                                        <ButtonComponent
                                                                text={'Continue'}
                                                                type="submit"
                                                                variant="danger"
                                                        />
                                                </div>
                                        </FormModalMUI>
                                )}
                        </TabContext>
                </>
        )
}

export default EmailChecks

const makeTableData = (data) => {
        const temp = []

        data.forEach((item, index) => {
                let obj = {}
                let date = new Date(item?.issuedDate)
                obj.sno = index + 1
                obj.checkNumber = item.checkNumber
                obj.amount = formatUSD(item.amount)

                obj.issuedDate = `${date.getDate()}/${
                        date.getMonth() + 1
                }/${date.getFullYear()}`
                obj.bankNickname = item.bank.accountNickName
                temp.push(obj)
                index++
        })

        return temp
}

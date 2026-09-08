///Packages components
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Formik, FieldArray } from 'formik'
import { useReactToPrint } from 'react-to-print'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { Alert } from '@mui/material'

import { AddOutlined } from '@mui/icons-material'

////Icons Used

///Custom components used
import FormComponents from '../components/shared/forms'
import PageHeader from '../components/shared/PageHeader'
import ButtonComponent from '../components/shared/ButtonComponent'

////Redux functions used
import { updateSnackbar } from '../redux/snackbarState'

///Apis used
import Printcheck from '../components/views/Printcheck'
import { printStyles } from '../utils/helper'

import FormModalMUI from '../components/shared/Modals/FormModalMUI'
import AddTag from '../components/views/forms/AddTag'

import AddBank from '../components/views/forms/AddBank'
import AddPayee from '../components/views/forms/AddPayee'
import NestedSelect from '../components/shared/forms/NestedSelect'
import CreateCheckSkeleton from '../components/shared/Skeletons/CreateCheckSkeleton'
import AddAddress from '../components/views/forms/AddAddress'
import AddSignature from '../components/views/forms/AddSignature'

import team from '../assets/images/team.jpeg'
import SubscriptionErrorModal from '../components/shared/Modals/SubscriptionErrorModal'
import checkFormValidationSchema from '../utils/validationSchemas/checksValidationSchema'
import useBanks from '../API/banks/useBanks'
import useUserInfo from '../API/users/useUserInfo'
import { getNextCheckNumber } from '../API/banks/useNextCheckNumber'
import usePayees from '../API/payees/usePayees'
import useAddCheck from '../API/checks/useAddCheck'
import useUpdateCheck from '../API/checks/useUpdateCheck'
import useOrganizations from '../API/users/organizations/useOrganizations'
import useAddresses from '../API/addresses/useAddresses'

const signatureOptions = [
        { key: 'Yes', value: true },
        { key: 'No', value: false }
]

const getOptions = (optionsList, inactiveId) => {
        const active = optionsList.filter((i) => i.status === 'active')
        const inactive = optionsList.filter((i) => i._id === inactiveId)

        return [...active, ...inactive]
}

const CreateCheck = () => {
        const { mutate: addCheck, isPending: isAdding } = useAddCheck()
        const { mutate: updateCheck, isPending: isUpdating } = useUpdateCheck()
        const dispatch = useDispatch()
        const printRef = useRef(null)
        const location = useLocation()

        const isUpdate = location?.state?.isUpdate || false

        const checkData = useMemo(() => {
                return isUpdate
                        ? {
                                        ...location?.state?.printContent
                          }
                        : undefined
        }, [location?.state?.printContent, isUpdate])

        const { data: userData } = useUserInfo()
        const { data } = useBanks({ includeDeactivated: true })
        const { data: payeesData } = usePayees({ status: 'active' })
        const allGroups = useSelector((state) => state.appData.groups)

        const { data: userAddresses } = useAddresses()

        const banks = useMemo(
                () =>
                        isUpdate
                                ? data?.data
                                : data?.data?.filter((i) => i.status !== 'inactive') || [],
                [data, isUpdate]
        )
        const payees = isUpdate
                ? payeesData?.data
                : payeesData?.data?.filter((i) => i.status !== 'inactive') || []

        const submitted = isAdding || isUpdating

        const selectedOrganization = useSelector(
                (state) => state.appData.selectedOrganization
        )

        const { data: organizations } = useOrganizations()

        const currentOrganization = organizations?.find(
                (org) => org._id === selectedOrganization
        )

        const [printContent, setPrintContent] = useState([])

        const [selectedTag, setSelectedTag] = useState([])
        const [isTagModalOpen, setTagModalOpen] = useState(false)
        const [isAddBankModalOpen, setAddBankModalOpen] = useState(false)
        const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)
        const [checkId, setCheckId] = useState('')

        const [checkNumber, setCheckNumber] = useState('')
        const [isSignatureModalOpen, setSignatureModalOpen] = useState(false)
        const [isAddressModalOpen, setAddressModalOpen] = useState(false)

        const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

        const isFirstTimeSignUp = localStorage.getItem('isFirstTimeSignUp') === 'true'

        const [printCheck, setPrintCheck] = useState(false)

        const formInitialValues = {
                checkNumber: checkData?.checkNumber || '',
                amount: checkData ? checkData.amount : '',
                issuedDate: checkData?.issuedDate
                        ? new Date(checkData.issuedDate)
                        : new Date(),
                payeeId: checkData?.payee._id || '',
                bankId: checkData?.bank._id || '',
                memo: checkData?.memo || '',
                invoiceId: checkData?.invoiceId || '',
                tags: checkData ? [...checkData?.tags] : [],
                isSignatureSelected:
                        checkData?.isSignatureSelected ||
                        userData?.preferences?.wantSignature ||
                        false,
                status: checkData ? checkData?.status : ''
        }

        const openAddressModal = () => {
                setAddressModalOpen(true)
        }

        const [showPreview, setShowPreview] = useState(false)

        const bankOptions = getOptions(banks || [], formInitialValues.bankId).map(
                (bank) => {
                        return { key: bank.bankName, value: bank._id, status: bank.status }
                }
        )

        const payeeOptions = getOptions(
                payeesData?.data || [],
                formInitialValues.payeeId
        ).map((payee) => {
                return { key: payee.name, value: payee._id, status: payee.status }
        })

        useEffect(() => {
                setPrintContent({ ...location?.state?.printContent?.rowData })
                if (location?.state?.printCheck) {
                        setPrintCheck(true)
                }
                if (location?.state?.isUpdate) {
                }
        }, [location, isUpdate])

        useEffect(() => {
                if (banks) {
                        if (isUpdate) {
                                setCheckId(checkData?._id)
                                setCheckNumber(checkData?.checkNumber)

                                setSelectedTag([...checkData?.tags])
                        }
                }
        }, [isUpdate, banks, checkData])

        const [nestedListOptions, setNestedListOptions] = useState(null)
        const [showWarning, setWarning] = useState(false)

        const [isDirty, setIsDirty] = useState(false)

        const setDirty = (dirty) => {
                setIsDirty(dirty)
        }

        const closeAddressModal = (forced) => {
                if (isDirty && !forced) {
                        setWarning(true)
                } else {
                        setAddressModalOpen(false)
                        setWarning(false)
                }
        }

        useEffect(() => {
                makeNestedListOptions(allGroups?.data)
        }, [allGroups])

        const makeNestedListOptions = async (groups) => {
                if (!Array.isArray(groups)) return
                let options = groups
                        .filter(
                                (group) => group.hasOwnProperty('name') && group?.tags?.length > 0
                        )
                        .map((group) => {
                                if (group?.tags?.length > 0) {
                                        let categoryList = group?.tags?.map((item) => {
                                                return {
                                                        key: item?.name,
                                                        value: item?._id,
                                                        color: item?.color
                                                }
                                        })

                                        return {
                                                categoryHead: group.name,
                                                categoryHeadColor: group.color,
                                                categoryList: categoryList
                                        }
                                }
                        })

                let independent_tags = groups
                        .filter((group) => !group.hasOwnProperty('name'))
                        .map((group) => {
                                let categoryList = group?.tags?.map((item) => {
                                        return {
                                                key: item?.name,
                                                value: item?._id,
                                                color: item?.color
                                        }
                                })

                                return {
                                        categoryHead: 'Other tags',
                                        categoryHeadColor: 'grey',
                                        categoryList: categoryList
                                }
                        })

                options.push(independent_tags[0])
                setNestedListOptions(options)
        }
        const [updatedTagsArray, setUpdatedTagsArray] = useState([])

        const handleChange = (id, formIndex) => {
                setSelectedTag((prevTags) => {
                        const updatedTags = [...prevTags]
                        const formTags = Array.isArray(updatedTags[formIndex])
                                ? [...updatedTags[formIndex]]
                                : []

                        if (formTags.includes(id)) {
                                const index = formTags.indexOf(id)
                                if (index > -1) {
                                        formTags.splice(index, 1)
                                }
                        } else {
                                formTags.push(id)
                        }

                        updatedTags[formIndex] = formTags

                        const newArray = [...updatedTags]

                        setUpdatedTagsArray(newArray)
                        return newArray
                })
        }

        const openTagEditor = () => {
                setTagModalOpen(true)
        }

        const closeTagEditor = () => {
                setTagModalOpen(false)
        }

        const openAddBank = () => {
                setAddBankModalOpen(true)
        }

        const closeAddBank = (forced) => {
                if (isDirty && !forced) {
                        setWarning(true)
                } else {
                        setAddBankModalOpen(false)
                        setWarning(false)
                }
        }

        const openAddPayee = () => {
                setAddPayeeModalOpen(true)
        }

        const closeAddPayee = (forced) => {
                if (isDirty && !forced) {
                        setWarning(true)
                } else {
                        setAddPayeeModalOpen(false)
                        setWarning(false)
                }
        }

        const [allBodies, setAllBodies] = useState([])

        const showPreviewCheck = (values) => {
                // Check if user is subscribed
                if (!userData?.isSubscribed) {
                        setShowSubscriptionModal(true)
                        return
                }

                // Existing preview logic
                setAllBodies([])
                values.forms.forEach((value) => {
                        let payee = payees?.find((payee) => payee.id === value.payeeId)
                        let bankDetails = banks?.find((bank) => bank._id === value.bankId)

                        let payeeCopy = { ...payee }
                        let bankDetailsCopy = { ...bankDetails }

                        delete payeeCopy.id
                        delete bankDetailsCopy._id

                        let body = {
                                ...value,
                                bankDetails: {
                                        ...bankDetailsCopy
                                },
                                payee: {
                                        ...payeeCopy
                                },

                                tags: [...selectedTag],
                                isSignatureSelected: value.isSignatureSelected || false
                        }

                        delete body.payeeId
                        delete body.bankId
                        setPrintContent({ ...body })

                        setAllBodies((prevBodies) => [...prevBodies, body])
                })

                setShowPreview(true)
        }

        const onSubmit = async (values, operation, resetForm) => {
                const updatedValues = values.forms.map((value, index) => {
                        return {
                                ...value,
                                tags: updatedTagsArray[index]
                        }
                })

                let body = null

                if (!isUpdate) {
                        const dataArray = updatedValues.map((item) => {
                                const { bankId, payeeId, ...rest } = item
                                return {
                                        ...rest,

                                        bankId: item.bankId, // Dynamic bankId value
                                        address: {
                                                addressId: userAddresses[0]._id
                                        },

                                        payeeId: item.payeeId // Dynamic payeeId value
                                }
                        })
                        body = dataArray
                }

                setCheckNumber(values.checkNumber)

                try {
                        if (isUpdate) {
                                const dataArray = updatedValues.map((item) => {
                                        const { bankId, payeeId, ...rest } = item
                                        return {
                                                ...rest,
                                                bankId,
                                                payeeId
                                        }
                                })
                                body = dataArray
                                updateCheck({ body: body[0], id: checkId })

                                if (operation === 'save&Print') {
                                        setPrintContent({ ...body })
                                        handlePrint()
                                }
                        } else {
                                addCheck(body, {
                                        onSuccess: (data) => {
                                                setCheckId(data?._id)
                                                setPrintContent({ ...data })
                                        }
                                })

                                if (operation === 'save&Print') {
                                        handlePrint()
                                } else {
                                        resetForm && resetForm()
                                        setShowPreview(false)
                                        setSelectedTag([])
                                }
                        }
                } catch (err) {
                        const { response } = err
                        const { data } = response
                        const { error } = data
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        message: `${
                                                error?.userMessage || !isUpdate
                                                        ? 'Unable to add check.'
                                                        : 'Unable to update check.'
                                        }`,
                                        severity: 'error'
                                })
                        )
                }
        }

        const handlePrint = useReactToPrint({
                content: () => printRef.current,
                fonts: [
                        {
                                family: 'Inter',
                                source:
                                        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
                        }
                ],
                pageStyle: printStyles,
                documentTitle: `Check Number - ${checkNumber}.pdf`
        })

        const [blankStatus, setBlankstatus] = useState(false)

        const [blankFormIndexes, setBlankFormIndexes] = useState([])

        // Add handler for continuing with limited access
        const handleContinueLimited = () => {
                setShowSubscriptionModal(false)
                // Optionally proceed with preview in limited mode
                setShowPreview(true)
        }

        const shouldDisableSubmit =
                !userAddresses?.length ||
                (selectedOrganization
                        ? !currentOrganization?.signatureUrl.length
                        : !userData?.signatureUrl.length)

        const displayAddAddressAlert = !userAddresses?.length
        const displaySignatureAlert = selectedOrganization
                ? !currentOrganization?.signatureUrl
                        ? true
                        : false
                : !userData?.signatureUrl

        return (
                <>
                        <div className="container">
                                <PageHeader
                                        text={isUpdate ? 'Edit Check' : 'Create Check'}
                                        info="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                                />
                                {displayAddAddressAlert && (
                                        <Alert
                                                severity="info"
                                                className="mb-4 d-flex align-items-center w-100"
                                                sx={{
                                                        '.MuiAlert-message': {
                                                                width: '100%'
                                                        }
                                                }}
                                        >
                                                <div className="d-flex align-items-center justify-content-between">
                                                        <p className="m-0 fs-6" style={{ color: '#161617;' }}>
                                                                You need to add an address to create checks.
                                                        </p>
                                                        <button
                                                                className="fw-semibold m-0 fs-6 border-0 bg-transparent p-0"
                                                                onClick={openAddressModal}
                                                                style={{
                                                                        color: '#0439EA'
                                                                }}
                                                        >
                                                                Add Address
                                                        </button>
                                                </div>
                                        </Alert>
                                )}

                                {displaySignatureAlert && (
                                        <Alert
                                                severity="info"
                                                className="mb-4 d-flex align-items-center w-100"
                                                sx={{
                                                        '.MuiAlert-message': {
                                                                width: '100%'
                                                        }
                                                }}
                                        >
                                                <div className="d-flex align-items-center justify-content-between">
                                                        <p className="m-0 fs-6" style={{ color: '#161617;' }}>
                                                                You need to add signture to sign checks. You can also update in
                                                                Profile Settings.
                                                        </p>
                                                        <button
                                                                className="fw-semibold m-0 fs-6 border-0 bg-transparent p-0"
                                                                onClick={() => {
                                                                        setSignatureModalOpen(!isSignatureModalOpen)
                                                                }}
                                                                style={{
                                                                        color: '#0439EA'
                                                                }}
                                                        >
                                                                Add Signature
                                                        </button>
                                                </div>
                                        </Alert>
                                )}

                                {formInitialValues ? (
                                        printCheck ? (
                                                <>
                                                        {allBodies.map((body, index) => (
                                                                <Printcheck key={index} printContent={body} />
                                                        ))}
                                                </>
                                        ) : (
                                                <Formik
                                                        key={JSON.stringify(shouldDisableSubmit)}
                                                        initialValues={{ forms: [formInitialValues] }}
                                                        validationSchema={checkFormValidationSchema}
                                                        onSubmit={(values) => {
                                                                onSubmit(values, '', null)
                                                        }}
                                                >
                                                        {({
                                                                errors,
                                                                values,
                                                                handleSubmit,
                                                                setFieldValue,
                                                                resetForm,
                                                                isValid,
                                                                dirty
                                                        }) => (
                                                                <form onSubmit={handleSubmit}>
                                                                        <FieldArray name="forms">
                                                                                {({ push, remove }) => (
                                                                                        <>
                                                                                                <div>
                                                                                                        {values?.forms?.map((form, index) => {
                                                                                                                return (
                                                                                                                        <>
                                                                                                                                <div key={index}>
                                                                                                                                        <div className="row mb-3 px-2 m-0">
                                                                                                                                                <div className="col-12 col-md-6">
                                                                                                                                                        <FormComponents
                                                                                                                                                                options={signatureOptions}
                                                                                                                                                                control="radio"
                                                                                                                                                                name={`forms.${index}.isSignatureSelected`}
                                                                                                                                                                label="Want to sign with signature?"
                                                                                                                                                        />
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-6 d-flex align-items-start justify-content-end"></div>
                                                                                                                                        </div>
                                                                                                                                        <div className="row p-0 mx-0 my-2">
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <div className="d-flex align-items-start justify-content-center w-100">
                                                                                                                                                                <FormComponents
                                                                                                                                                                        name={`forms.${index}.bankId`}
                                                                                                                                                                        key={submitted}
                                                                                                                                                                        label="Select a Bank Account*"
                                                                                                                                                                        control="autocomplete"
                                                                                                                                                                        options={bankOptions}
                                                                                                                                                                        multiple={false}
                                                                                                                                                                        btnText="Add Bank Account"
                                                                                                                                                                        isAddBtn={true}
                                                                                                                                                                        onChange={async (value) => {
                                                                                                                                                                                const bankId = value.value

                                                                                                                                                                                const ownerType =
                                                                                                                                                                                        selectedOrganization
                                                                                                                                                                                                ? 'organization'
                                                                                                                                                                                                : 'user'
                                                                                                                                                                                let checkNumber
                                                                                                                                                                                const checkNumberDb =
                                                                                                                                                                                        await getNextCheckNumber(
                                                                                                                                                                                                ownerType,
                                                                                                                                                                                                bankId
                                                                                                                                                                                        )
                                                                                                                                                                                if (index === 0) {
                                                                                                                                                                                        checkNumber =
                                                                                                                                                                                                checkNumberDb?.nextAvailableCheckNumber
                                                                                                                                                                                } else {
                                                                                                                                                                                        checkNumber =
                                                                                                                                                                                                index +
                                                                                                                                                                                                checkNumberDb.nextAvailableCheckNumber
                                                                                                                                                                                }

                                                                                                                                                                                setFieldValue(
                                                                                                                                                                                        `forms.${index}.checkNumber`,
                                                                                                                                                                                        checkNumber
                                                                                                                                                                                )
                                                                                                                                                                        }}
                                                                                                                                                                />
                                                                                                                                                                <button
                                                                                                                                                                        className="add-btn icon-type-btn"
                                                                                                                                                                        onClick={openAddBank}
                                                                                                                                                                        type="button"
                                                                                                                                                                >
                                                                                                                                                                        <AddOutlined
                                                                                                                                                                                sx={{
                                                                                                                                                                                        color: 'rgba(0,0,0,0.87)',
                                                                                                                                                                                        width: '18px',
                                                                                                                                                                                        height: '18px'
                                                                                                                                                                                }}
                                                                                                                                                                        />
                                                                                                                                                                </button>
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <div className="d-flex align-items-start justify-content-center w-100">
                                                                                                                                                                <FormComponents
                                                                                                                                                                        name={`forms.${index}.payeeId`}
                                                                                                                                                                        label="Select Payee*"
                                                                                                                                                                        control="autocomplete"
                                                                                                                                                                        key={submitted}
                                                                                                                                                                        options={payeeOptions}
                                                                                                                                                                        multiple={false}
                                                                                                                                                                        btnText="Add Payee"
                                                                                                                                                                        isAddBtn={true}
                                                                                                                                                                />
                                                                                                                                                                <button
                                                                                                                                                                        className="add-btn icon-type-btn"
                                                                                                                                                                        onClick={openAddPayee}
                                                                                                                                                                        type="button"
                                                                                                                                                                >
                                                                                                                                                                        <AddOutlined
                                                                                                                                                                                sx={{
                                                                                                                                                                                        color: 'rgba(0,0,0,0.87)',
                                                                                                                                                                                        width: '18px',
                                                                                                                                                                                        height: '18px'
                                                                                                                                                                                }}
                                                                                                                                                                        />
                                                                                                                                                                </button>
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <div className="d-flex align-items-start">
                                                                                                                                                                <div className="field-prefix">$</div>
                                                                                                                                                                <FormComponents
                                                                                                                                                                        name={`forms.${index}.amount`}
                                                                                                                                                                        type="number"
                                                                                                                                                                        label="Amount"
                                                                                                                                                                        control="input"
                                                                                                                                                                        prefix={true}
                                                                                                                                                                />
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                        <div className="row p-0 mx-0 my-2">
                                                                                                                                                <div
                                                                                                                                                        className="col-12 col-md-4 px-3"
                                                                                                                                                        style={{ display: 'none' }}
                                                                                                                                                >
                                                                                                                                                        <FormComponents
                                                                                                                                                                name={`forms.${index}.checkNumber`}
                                                                                                                                                                type="text"
                                                                                                                                                                // label="Check Number*"
                                                                                                                                                                control="input"
                                                                                                                                                                disabled
                                                                                                                                                        />
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <FormComponents
                                                                                                                                                                name={`forms.${index}.issuedDate`}
                                                                                                                                                                label="Issued Date"
                                                                                                                                                                control="date"
                                                                                                                                                        />
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <FormComponents
                                                                                                                                                                name={`forms.${index}.invoiceId`}
                                                                                                                                                                type="text"
                                                                                                                                                                label="Invoice ID"
                                                                                                                                                                control="input"
                                                                                                                                                        />
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <FormComponents
                                                                                                                                                                name={`forms.${index}.memo`}
                                                                                                                                                                type="text"
                                                                                                                                                                label="Memo"
                                                                                                                                                                control="input"
                                                                                                                                                        />
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                        <div className="row p-0 mx-0 my-2">
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <div className="d-flex align-items-start justify-content-center w-100">
                                                                                                                                                                <NestedSelect
                                                                                                                                                                        label="Select Tags"
                                                                                                                                                                        name={`forms.${index}.tags`}
                                                                                                                                                                        id="tags"
                                                                                                                                                                        selected={
                                                                                                                                                                                Array.isArray(selectedTag[index])
                                                                                                                                                                                        ? selectedTag[index]
                                                                                                                                                                                        : [selectedTag[index]]
                                                                                                                                                                        }
                                                                                                                                                                        handleChange={(id) =>
                                                                                                                                                                                handleChange(id, index)
                                                                                                                                                                        }
                                                                                                                                                                        options={nestedListOptions}
                                                                                                                                                                        multiple={true}
                                                                                                                                                                        color={true}
                                                                                                                                                                        isAddBtn={true}
                                                                                                                                                                ></NestedSelect>
                                                                                                                                                                <button
                                                                                                                                                                        className="add-btn icon-type-btn"
                                                                                                                                                                        onClick={openTagEditor}
                                                                                                                                                                        type="button"
                                                                                                                                                                >
                                                                                                                                                                        <AddOutlined
                                                                                                                                                                                sx={{
                                                                                                                                                                                        color: 'rgba(0,0,0,0.87)',
                                                                                                                                                                                        width: '18px',
                                                                                                                                                                                        height: '18px'
                                                                                                                                                                                }}
                                                                                                                                                                        />
                                                                                                                                                                </button>
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                                <div className="col-12 col-md-4 px-3">
                                                                                                                                                        <div className="d-flex align-items-start justify-content-center w-100">
                                                                                                                                                                <FormComponents
                                                                                                                                                                        name={`forms.${index}.status`}
                                                                                                                                                                        key={submitted}
                                                                                                                                                                        label="Status*"
                                                                                                                                                                        control="autocomplete"
                                                                                                                                                                        options={[
                                                                                                                                                                                { key: 'Draft', value: 'DRAFT' },
                                                                                                                                                                                { key: 'Void', value: 'VOID' },
                                                                                                                                                                                ...(values.status === 'DRAFT'
                                                                                                                                                                                        ? []
                                                                                                                                                                                        : [
                                                                                                                                                                                                        {
                                                                                                                                                                                                                key: 'Blank',
                                                                                                                                                                                                                value: 'BLANK'
                                                                                                                                                                                                        }
                                                                                                                                                                                          ])
                                                                                                                                                                        ]}
                                                                                                                                                                        multiple={false}
                                                                                                                                                                        btnText="Status"
                                                                                                                                                                        isAddBtn={true}
                                                                                                                                                                        value={values.status}
                                                                                                                                                                        onChange={(selectedValue) => {
                                                                                                                                                                                if (selectedValue.key === 'Blank') {
                                                                                                                                                                                        setBlankstatus(true)
                                                                                                                                                                                        if (
                                                                                                                                                                                                blankFormIndexes.includes(index)
                                                                                                                                                                                        ) {
                                                                                                                                                                                                setBlankFormIndexes(
                                                                                                                                                                                                        blankFormIndexes.filter(
                                                                                                                                                                                                                (idx) => idx !== index
                                                                                                                                                                                                        )
                                                                                                                                                                                                )
                                                                                                                                                                                        } else {
                                                                                                                                                                                                setBlankFormIndexes([
                                                                                                                                                                                                        ...blankFormIndexes,
                                                                                                                                                                                                        index
                                                                                                                                                                                                ])
                                                                                                                                                                                        }
                                                                                                                                                                                } else {
                                                                                                                                                                                        setBlankstatus(false)

                                                                                                                                                                                        // If status is not "Blank", hide the quantity field
                                                                                                                                                                                        setBlankFormIndexes(
                                                                                                                                                                                                blankFormIndexes.filter(
                                                                                                                                                                                                        (idx) => idx !== index
                                                                                                                                                                                                )
                                                                                                                                                                                        )
                                                                                                                                                                                }
                                                                                                                                                                        }}
                                                                                                                                                                />
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                        {blankFormIndexes.includes(index) && (
                                                                                                                                                <div className="row p-0 mx-0 my-2">
                                                                                                                                                        <div className="col-12 col-md-4 px-3">
                                                                                                                                                                <FormComponents
                                                                                                                                                                        name={`forms.${index}.quantity`}
                                                                                                                                                                        type="text"
                                                                                                                                                                        label="Quantity"
                                                                                                                                                                        control="input"
                                                                                                                                                                />
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                        )}
                                                                                                                                        <div className="row p-0 mx-0 my-0">
                                                                                                                                                <div className="col-12">
                                                                                                                                                        <div
                                                                                                                                                                className={`d-flex justify-content-between`}
                                                                                                                                                        >
                                                                                                                                                                <div>
                                                                                                                                                                        {showPreview &&
                                                                                                                                                                        Object.keys(printContent).length !==
                                                                                                                                                                                0 ? (
                                                                                                                                                                                <div className="d-flex align-items-right"></div>
                                                                                                                                                                        ) : (
                                                                                                                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                                                                                                                        {index > 0 && (
                                                                                                                                                                                                <ButtonComponent
                                                                                                                                                                                                        style={{
                                                                                                                                                                                                                marginBottom: '7px'
                                                                                                                                                                                                        }}
                                                                                                                                                                                                        text={'Remove Form'}
                                                                                                                                                                                                        variant="light"
                                                                                                                                                                                                        type="button"
                                                                                                                                                                                                        // onClick={() => removeForm(index)}
                                                                                                                                                                                                        onClick={() => remove(index)}
                                                                                                                                                                                                />
                                                                                                                                                                                        )}
                                                                                                                                                                                </div>
                                                                                                                                                                        )}
                                                                                                                                                                </div>
                                                                                                                                                        </div>
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                </div>
                                                                                                                        </>
                                                                                                                )
                                                                                                        })}
                                                                                                        <div className="row p-0 mx-0 my-0 mb-4">
                                                                                                                <div className="col-12">
                                                                                                                        <div
                                                                                                                                className={`d-flex ${
                                                                                                                                        // index === forms.length - 1
                                                                                                                                        // ?
                                                                                                                                        'justify-content-between'
                                                                                                                                        // :
                                                                                                                                        // 'justify-content-end'
                                                                                                                                }`}
                                                                                                                        >
                                                                                                                                <div className="d-flex align-items-center">
                                                                                                                                        <ButtonComponent
                                                                                                                                                text={'Save & Print'}
                                                                                                                                                variant="light"
                                                                                                                                                type="button"
                                                                                                                                                disabled={
                                                                                                                                                        (!isUpdate && !isValid) ||
                                                                                                                                                        !dirty ||
                                                                                                                                                        submitted
                                                                                                                                                }
                                                                                                                                                click={() => {
                                                                                                                                                        onSubmit(values, 'save&Print', resetForm)
                                                                                                                                                }}
                                                                                                                                                extraClass="me-3"
                                                                                                                                        />
                                                                                                                                        <ButtonComponent
                                                                                                                                                text={submitted ? 'Saving...' : 'Save'}
                                                                                                                                                variant="dark"
                                                                                                                                                type="submit"
                                                                                                                                                disabled={
                                                                                                                                                        shouldDisableSubmit ||
                                                                                                                                                        (!isUpdate && !isValid) ||
                                                                                                                                                        !dirty ||
                                                                                                                                                        submitted
                                                                                                                                                }
                                                                                                                                        />
                                                                                                                                </div>

                                                                                                                                <div>
                                                                                                                                        <ButtonComponent
                                                                                                                                                text={'Add Check'}
                                                                                                                                                variant="light"
                                                                                                                                                type="button"
                                                                                                                                                disabled={blankStatus}
                                                                                                                                                onClick={() =>
                                                                                                                                                        push({
                                                                                                                                                                invoiceId: '',
                                                                                                                                                                memo: '',
                                                                                                                                                                checkNumber: '',
                                                                                                                                                                amount: '',
                                                                                                                                                                bankId: '',
                                                                                                                                                                payeeId: '',
                                                                                                                                                                tags: [],
                                                                                                                                                                status: 'DRAFT',
                                                                                                                                                                isSignatureSelected:
                                                                                                                                                                        userData?.preferences
                                                                                                                                                                                ?.wantSignature || false,
                                                                                                                                                                issuedDate: new Date()
                                                                                                                                                        })
                                                                                                                                                }
                                                                                                                                        />
                                                                                                                                </div>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </>
                                                                                )}
                                                                        </FieldArray>
                                                                </form>
                                                        )}
                                                </Formik>
                                        )
                                ) : (
                                        <CreateCheckSkeleton />
                                )}
                        </div>
                        {printContent && Object.keys(printContent).length !== 0
                                ? allBodies.map((body, index) => (
                                                <Printcheck
                                                        printContent={body}
                                                        showPreview={showPreview}
                                                        printRef={printRef}
                                                        handlePrint={handlePrint}
                                                />
                                  ))
                                : null}

                        <FormModalMUI
                                maxWidth="md"
                                open={isFirstTimeSignUp}
                                onClose={() => {
                                        localStorage.setItem('isFirstTimeSignUp', false)
                                }}
                        >
                                <div className="container">
                                        <div className="row">
                                                <div
                                                        className="col-4"
                                                        style={{ paddingTop: '50px', paddingLeft: '20px' }}
                                                >
                                                        <img className="team" src={team} alt="team" />
                                                </div>
                                                <div className="col-8" style={{ padding: '50px' }}>
                                                        <div className="mb-4">
                                                                <h1>
                                                                        <b>Welcome to Synccos</b>
                                                                </h1>
                                                        </div>
                                                        <div style={{ marginBottom: '40px' }}>
                                                                <p>
                                                                        Thank you for being a part of our amazing new venture. We
                                                                        apologize for any performance issues as we build and cater to
                                                                        our early adopters' needs. Your feedback is crucial as we
                                                                        shape the future. Please sign in or sign up to join the
                                                                        discussion on how we can best suit your needs. Let's create
                                                                        something extraordinary together! #ItsYourSynccos
                                                                </p>
                                                        </div>

                                                        <ButtonComponent
                                                                text="Close"
                                                                variant="dark"
                                                                onClick={() => {
                                                                        localStorage.setItem('isFirstTimeSignUp', false)
                                                                }}
                                                        />
                                                </div>
                                        </div>
                                </div>
                        </FormModalMUI>

                        <FormModalMUI
                                title="Create Tag"
                                open={isTagModalOpen}
                                maxWidth="sm"
                                onClose={closeTagEditor}
                        >
                                <AddTag onClose={closeTagEditor} title="Create Tag" edit={false} />
                        </FormModalMUI>
                        <FormModalMUI
                                title="Add new bank account"
                                open={isAddBankModalOpen}
                                maxWidth="md"
                                onClose={() => closeAddBank(false)}
                        >
                                <AddBank
                                        onClose={closeAddBank}
                                        setDirty={setDirty}
                                        warning={showWarning}
                                        setWarning={setWarning}
                                />
                        </FormModalMUI>
                        <FormModalMUI
                                title="Add new payee"
                                open={isAddPayeeModalOpen}
                                maxWidth="sm"
                                onClose={() => closeAddPayee(false)}
                                hideDividers={true}
                                styles={{
                                        title: {
                                                fontSize: '24px',
                                                fontWeight: 600,
                                                color: '#111827',
                                                mb: 1,
                                                lineHeight: 1.2
                                        }
                                }}
                        >
                                <AddPayee
                                        onClose={closeAddPayee}
                                        isEdit={false}
                                        setDirty={setDirty}
                                        warning={showWarning}
                                        setWarning={setWarning}
                                />
                        </FormModalMUI>

                        <FormModalMUI
                                title="Create Signature"
                                open={isSignatureModalOpen}
                                onClose={() => {
                                        setSignatureModalOpen(!isSignatureModalOpen)
                                }}
                                maxWidth="sm"
                        >
                                <AddSignature
                                        type={!!selectedOrganization ? 'organization' : 'user'}
                                        onClose={() => {
                                                setSignatureModalOpen(!isSignatureModalOpen)
                                        }}
                                />
                        </FormModalMUI>

                        <AddAddress
                                type={!!selectedOrganization ? 'organization' : 'user'}
                                isModalOpen={isAddressModalOpen}
                                setWarning={setWarning}
                                closeModal={closeAddressModal}
                                setDirty={setDirty}
                                showWarning={showWarning}
                        />

                        <SubscriptionErrorModal
                                open={showSubscriptionModal}
                                onClose={() => setShowSubscriptionModal(false)}
                                onContinueLimited={handleContinueLimited}
                        />
                </>
        )
}

export default CreateCheck

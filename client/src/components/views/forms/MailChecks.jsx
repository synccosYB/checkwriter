import { useEffect, useRef, useState } from 'react'
import GenericTable from '../../shared/GenericTable/GenericTable'
import { useDispatch } from 'react-redux'
import ButtonComponent from '../../shared/ButtonComponent'
import { postMailRate } from '../../../API/MailAPI'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { IconButton } from '@mui/material'
import { updateSnackbar } from '../../../redux/snackbarState'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormComponents from '../../shared/forms'
import { jsPDF } from 'jspdf'
import Printcheck from '../Printcheck'
import { useReactToPrint } from 'react-to-print'
import { printStyles } from '../../../utils/helper'
import { sendCheckEmails } from '../../../API/EmailAPI'

const MailChecks = ({ selectedData }) => {
        const dispatch = useDispatch()
        const printRef = useRef(null)

        const [modifiedData, setModifiedData] = useState([])
        const [isLoading, setIsLoading] = useState(true)
        const [totalCost, setTotalCost] = useState(0)
        const [isDisabled, setIsDisabled] = useState(true)
        const [rateInfo, setRateInfo] = useState([])
        const [mailTo, setMailTo] = useState('')
        const [printContent, setPrintContent] = useState()
        const [mailAddress, setMailAddress] = useState('')
        const [isFormVisible, setIsFormVisible] = useState(false) // Manage form visibility
        const [selectedShipping, setSelectedShipping] = useState('PriorityMail') // Step 1: Create state

        useEffect(() => {
                if (selectedData.length !== 0) {
                        setIsLoading(true)
                        makeTableData(selectedData)
                } else {
                        setIsLoading(false)
                }
        }, [])

        useEffect(() => {
                if (rateInfo.length !== 0) {
                        makeTableData(selectedData)
                }
        }, [])

        const validationSchema = Yup.object({
                shipping: Yup.string().required('Required Email Address!')
        })

        const createShipment = async (data) => {
                let shipments = []
                for (let item of data) {
                        shipments.push({
                                checkId: item?._id,
                                checkNumber: item?.checkNumber
                        })
                }

                let body = {
                        shipments: shipments
                }

                try {
                        let res = await postMailRate(body)
                        setRateInfo([...res?.data])
                } catch (error) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'error',
                                        message: 'Unable to get rates. Try Again.'
                                })
                        )
                }
        }

        const removeItem = (id) => {
                selectedData = selectedData.filter((item) => item._id !== id)
                makeTableData(selectedData)
        }

        const makeTableData = (data) => {
                let sno = 1
                let temp = []
                let total = 0

                for (let i = 0; i < data.length; i++) {
                        let item = data[i]
                        let cost = parseFloat(1.2 * rateInfo[i]?.rates[0]?.amount).toFixed(2)

                        let rateId = rateInfo[i]?.rates[0]?.object_id
                        total = parseFloat(total) + parseFloat(item.amount)

                        temp.push({
                                _id: item?._id,
                                sno: sno,
                                checkNo: item?.checkNumber,
                                payeeName: item?.payee?.name,
                                address:
                                        item?.payee?.address?.addressLine1 +
                                        ', ' +
                                        item?.payee?.address?.addressLine2 +
                                        ', ' +
                                        item?.payee?.address?.city +
                                        ', ' +
                                        item?.payee?.address?.state +
                                        ', ' +
                                        item?.payee?.address?.country +
                                        ', ' +
                                        item?.payee?.address?.zipCode,
                                cost: '$ ' + item.amount,
                                rateId: rateId,
                                remove: (
                                        <IconButton color="error" onClick={() => removeItem(item?._id)}>
                                                <DeleteOutlinedIcon />
                                        </IconButton>
                                )
                        })

                        setTotalCost(total)
                        setModifiedData(temp)
                        sno += 1
                }

                setIsLoading(false)
                setIsDisabled(false)
        }

        const sendMail = async () => {
                let checksDetails = []

                for (let details of modifiedData) {
                        checksDetails.push({
                                checkId: details._id,
                                checkNumber: details.checkNo,
                                payeeName: details.payeeName,
                                rateId: details.rateId,
                                totalAmount: details.cost.substring(2)
                        })
                }

                let body = {
                        checksDetails: checksDetails
                }

        }

        const columnData = [
                {
                        key: '#',
                        value: 'sno',
                        colWidth: '2%',
                        align: 'left'
                },
                {
                        key: '# Check No',
                        value: 'checkNo',
                        colWidth: '2%',
                        align: 'left'
                },
                {
                        key: 'Payee Name',
                        value: 'payeeName',
                        colWidth: '2%',
                        align: 'left'
                },
                {
                        key: 'Address',
                        value: 'address',
                        colWidth: '4%',
                        align: 'center'
                },
                {
                        key: 'Amount',
                        value: 'cost',
                        colWidth: '2%',
                        align: 'right'
                },
                {
                        key: 'Remove',
                        value: 'remove',
                        type: 'html',
                        colWidth: '2%',
                        align: 'center'
                }
        ]

        const onSubmit = (value) => {
        }

        const close = (forced) => {
                setIsFormVisible(false)
        }

        const [pdfFiles, setPdfFiles] = useState([]) // State to hold generated PDFs

        const createPDFs = (data) => {
                const generatedFiles = [] // Array to hold generated PDF blobs
                data.forEach((item) => {
                        const doc = new jsPDF()

                        doc.text(`Check Number: ${item.checkNo}`, 10, 10)
                        doc.text(`Payee Name: ${item.payeeName}`, 10, 20)
                        doc.text(`Amount: $${item.cost}`, 10, 30)
                        doc.text(`Memo: ${item.memo}`, 10, 40)
                        const pdfBlob = doc.output('blob')
                        generatedFiles.push(pdfBlob)
                })
                setPdfFiles(generatedFiles)
                const combinedData = new FormData() // Create a new FormData object
                const blobArray = [] // Array to hold the blob files

                data.forEach((item, index) => {
                        const pdfBlob = generatedFiles[index] // Get the corresponding blob
                        const file = blobToFile(pdfBlob, `check_${item.checkNo}.pdf`) // Convert blob to file
                        blobArray.push(file) // Add the file to the blob array
                })

                blobArray.forEach((file, index) => {
                        combinedData.append('blob', file)
                })

                combinedData.append('data', JSON.stringify(data)) // Append the data array as a JSON string
                combinedData.append('shippingType', selectedShipping) // Append shipping type
                try {
                        const res = sendCheckEmails(combinedData) // Ensure this is awaited
                } catch (err) {
                        return false
                }
        }

        const onNext = (value) => {
                createPDFs(modifiedData)
        }

        const ShippingOptions = [
                { key: 'Priority Mail', value: 'PriorityMail' },
                { key: 'Ground Advantage', value: 'Ground Advantage' },
                { key: 'Overnight', value: 'Overnight' },
                { key: 'Express', value: 'Express' }
        ]

        const viewPDF = (index) => {
                handlePrint()
        }
        useEffect(() => {
                if (printContent && Object.keys(printContent).length !== 0) {
                        handlePrint()
                }
        }, [printContent])

        const handleButtonClick = (item) => {
                setPrintContent(item)
        }

        const handlePrint = useReactToPrint({
                content: () => printRef.current,
                pageStyle: printStyles,
                documentTitle: `Check Number - ${printContent?.checkNumber}.pdf`,
                onAfterPrint: () => {
                        // Create a Blob URL after printing
                        const pdfBlob = new Blob([printRef.current], { type: 'application/pdf' })
                        const pdfUrl = URL.createObjectURL(pdfBlob)
                        sendToBackend(pdfUrl)
                        setPrintContent()
                }
        })

        const blobToFile = (theBlob, fileName) => {
                return new File([theBlob], fileName, { type: theBlob.type })
        }

        const sendToBackend = async (pdfBlob) => {
                const formData = new FormData()
                const file = blobToFile(pdfBlob, 'generated_pdf.pdf')
                formData.append('pdfFile', file)
                for (let [key, value] of formData.entries()) {
                }

        }

        return (
                <div className="container" style={{ width: '820px' }}>
                        <div className="generic-table-container">
                                {!isFormVisible && (
                                        <GenericTable
                                                columnData={columnData}
                                                modifiedData={modifiedData}
                                                count={selectedData?.length || 0}
                                                paginationOff={true}
                                        />
                                )}
                                {!isFormVisible && (
                                        <Formik
                                                initialValues={{
                                                        shipping: 'PriorityMail'
                                                }}
                                                validationSchema={validationSchema}
                                                onSubmit={onSubmit}
                                        >
                                                {({ handleSubmit, setFieldValue, values, dirty }) => (
                                                        <Form onSubmit={handleSubmit} className="px-3 pt-3 pb-3">
                                                                <div className="row">
                                                                        <div className="col-12 col-md-12">
                                                                                <div className="d-flex align-items-start">
                                                                                        <div className="col-12 col-md-12">
                                                                                                <FormComponents
                                                                                                        options={ShippingOptions}
                                                                                                        control="radio"
                                                                                                        name="shipping"
                                                                                                        label={
                                                                                                                <span style={{ fontSize: '1.2em' }}>Shipping</span>
                                                                                                        }
                                                                                                        onChange={(e) => setSelectedShipping(e.target.value)}
                                                                                                />
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </div>

                                                                {!isFormVisible && (
                                                                        <div className="d-flex flex-row align-items-start justify-content-end mt-2">
                                                                                <div className="mt-1">
                                                                                        <ButtonComponent
                                                                                                text="Submit"
                                                                                                variant="dark"
                                                                                                onClick={onNext}
                                                                                                disabled={isDisabled}
                                                                                        />
                                                                                </div>
                                                                        </div>
                                                                )}
                                                        </Form>
                                                )}
                                        </Formik>
                                )}
                                {printContent && (
                                        <Printcheck
                                                printContent={printContent}
                                                showPreview={false}
                                                printRef={printRef}
                                                handlePrint={handlePrint}
                                        />
                                )}
                        </div>
                        {/* {pdfFiles.length > 0 && (
                                <div className="d-flex flex-row align-items-start justify-content-start mt-2">
                                        {pdfFiles.map((_, index) => (
                                                <ButtonComponent
                                                        key={index}
                                                        text={`View PDF ${index + 1}`} // Button text
                                                        variant="dark"
                                                        onClick={() => viewPDF(pdfFiles)} // Call viewPDF with the index
                                                />
                                        ))}
                                </div>
                        )} */}
                        {selectedData.map((item) => (
                                <div className="d-flex flex-row align-items-start justify-content-start mt-2">
                                        <ButtonComponent
                                                key={item._id}
                                                text={`Print ${item.checkNumber}`} // Button text
                                                variant="dark"
                                                onClick={() => handleButtonClick(item)} // Set print content on click
                                        />
                                </div>
                        ))}
                </div>
        )
}

export default MailChecks

import { createRef } from 'react'
import numberToWords from 'number-to-words'
import {
        startOfWeek,
        endOfWeek,
        startOfMonth,
        endOfMonth,
        startOfYear,
        endOfYear,
        formatISO
} from 'date-fns'

import { getAllTags } from '../API/TagsAPI'

import {
        updateAppData,
        updateTagsData,
        updateGroupsData
} from '../redux/appData'
import { checkLockIcon } from '../assets/svg'

import { getAllGroups } from '../API/GroupAPI'
import { updateSnackbar } from '../redux/snackbarState'
import { getAllTransactions } from '../API/TransactionAPI'
import jwtDecode from 'jwt-decode'

export const bankAccountType = (str) => {
        let words = str.toLowerCase().split(' ')

        // Convert the first word to lowercase
        let firstWord = words[0]
        words[0] = firstWord.charAt(0).toLowerCase() + firstWord.slice(1)

        // Convert the remaining words to title case
        for (let i = 1; i < words.length; i++) {
                let word = words[i]
                words[i] = word.charAt(0).toUpperCase() + word.slice(1)
        }

        // Join the words and remove spaces
        let camelCaseStr = words.join('')

        return camelCaseStr
}

export const abbreviateNumber = (n) => {
        if (n < 1e3) return n
        if (n >= 1e3) return +(n / 1e3).toFixed(1) + 'K'
}

export const getTransactions = async (dispatch) => {
        try {
                const res = await getAllTransactions()
                const { data } = res

                dispatch(updateAppData({ key: 'transactions', data }))
        } catch (err) {
                console.error('err', err)
        }
}

export const getTagsData = async (dispatch) => {
        try {
                const res = await getAllTags()
                const { data } = res
                dispatch(updateTagsData(data))
        } catch (error) {
                console.error('err', error)
                dispatch(
                        updateSnackbar({
                                open: true,
                                message: 'Error while fetching tags.',
                                severity: 'error'
                        })
                )
                dispatch(updateTagsData([]))
        }
}

export const fetchTags = async (dispatch) => {
        try {
                const res = await getAllTags()
                let tags = Object.values(res.data)
                dispatch(updateTagsData(tags))
        } catch (error) {
                console.error('err', error)
                dispatch(
                        updateSnackbar({
                                open: true,
                                message: 'Error while fetching tags.',
                                severity: 'error'
                        })
                )
                dispatch(updateTagsData([]))
        }
}

export const fetchGroups = async (dispatch) => {
        try {
                const res = await getAllGroups()
                let tags = Object.values(res.data)
                dispatch(updateGroupsData(tags))
        } catch (error) {
                console.error('err', error)
                dispatch(
                        updateSnackbar({
                                open: true,
                                message: 'Error while fetching groups.',
                                severity: 'error'
                        })
                )
                dispatch(updateGroupsData([]))
        }
}

export const convertNumberToEnglish = (number) => {
        let ones = [
                '',
                'one',
                'two',
                'three',
                'four',
                'five',
                'six',
                'seven',
                'eight',
                'nine',
                'ten',
                'eleven',
                'twelve',
                'thirteen',
                'fourteen',
                'fifteen',
                'sixteen',
                'seventeen',
                'eighteen',
                'nineteen'
        ]
        let tens = [
                '',
                '',
                'twenty',
                'thirty',
                'forty',
                'fifty',
                'sixty',
                'seventy',
                'eighty',
                'ninety'
        ]
        let result = ''

        if (number < 0) {
                result = 'negative '
                number = -number
        }

        if (number >= 1000000000) {
                result +=
                        convertNumberToEnglish(Math.floor(number / 1000000000)) + ' billion'
                number %= 1000000000
        }

        if (number >= 1000000) {
                result +=
                        (result.length > 0 ? ' ' : '') +
                        convertNumberToEnglish(Math.floor(number / 1000000)) +
                        ' million'
                number %= 1000000
        }

        if (number >= 1000) {
                result +=
                        (result.length > 0 ? ' ' : '') +
                        convertNumberToEnglish(Math.floor(number / 1000)) +
                        ' thousand'
                number %= 1000
        }

        if (number >= 100) {
                result +=
                        (result.length > 0 ? ' ' : '') +
                        convertNumberToEnglish(Math.floor(number / 100)) +
                        ' hundred'
                number %= 100
        }

        if (number >= 20) {
                result += (result.length > 0 ? ' ' : '') + tens[Math.floor(number / 10)]
                number %= 10
        }

        if (number > 0) {
                result += (result.length > 0 ? ' ' : '') + ones[number]
        }

        return result
}

export const dataUriToBlob = (dataURI) => {
        // Convert base64 to raw binary data
        const byteString = atob(dataURI.split(',')[1])

        // Separate out the mime component
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // Create an ArrayBuffer to hold the binary data
        const arrayBuffer = new ArrayBuffer(byteString.length)
        const uint8Array = new Uint8Array(arrayBuffer)

        // Write the binary data to the ArrayBuffer
        for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i)
        }

        // Create a Blob object from the ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: mimeString })

        return blob
}

export const dataUriToImg = (dataURI) => {
        // Convert base64 to raw binary data
        const byteString = atob(dataURI.split(',')[1])

        // Separate out the mime component
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // Create an ArrayBuffer to hold the binary data
        const arrayBuffer = new ArrayBuffer(byteString.length)
        const uint8Array = new Uint8Array(arrayBuffer)

        // Write the binary data to the ArrayBuffer
        for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i)
        }

        // Create a Blob object from the ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: mimeString })

        // Create a File object from the Blob and set the filename
        const file = new File([blob], 'signature.png', { type: mimeString })

        return file
}

export const getCheckPrintContent = (props) => {
        const printRef = createRef(null)

        const {
                address = '',
                payee = '',
                bank = '',
                amount = 0,
                memo = '',
                issuedDate = new Date(),
                checkNumber = '',
                userData = {},
                isSignatureSelected,
                signImagestr
        } = props

        const date = new Date(issuedDate)

        const wholeNumber = Math.floor(Math.abs(amount || 0))
        const decimalPart = Math.round((Math.abs(amount || 0) - wholeNumber) * 100)
        let amountInWords = 'Amount is too large'
        try {
                if (Number.isSafeInteger(wholeNumber) && Number.isSafeInteger(decimalPart)) {
                        const words = numberToWords.toWords(wholeNumber)
                        const decimalWords = numberToWords.toWords(decimalPart)
                        amountInWords = `${words} and ${decimalWords} cent*****`
                }
        } catch (e) {
                amountInWords = 'Amount is too large'
        }

        printRef.current = (
                <>
                        <div className="print-body" style={{ display: 'block' }} ref={printRef}>
                                <div
                                        className="check-body position-relative"
                                        style={{ fontFamily: 'Inter' }}
                                >
                                        <div className="d-flex justify-content-between align-items-start first-section">
                                                <div className="user-info">
                                                        <p
                                                                className="fw-semibold user-name"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {userData?.firstName || ''} {userData?.lastName || ''}
                                                        </p>
                                                        <p
                                                                className="fw-normal address-info"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {address?.addressLine1}
                                                                {address?.addressLine2 && address?.addressLine2 !== ''
                                                                        ? `, ${address?.addressLine2}`
                                                                        : ''}
                                                        </p>
                                                        <p
                                                                className="fw-normal address-info"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {address?.city || ''}, {address?.state || ''} ,
                                                                {address?.zipCode || ''}
                                                        </p>
                                                </div>
                                                <div className="bank-logo">
                                                        <h1
                                                                className="bank-name-header"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {bank?.bankName}
                                                        </h1>
                                                </div>
                                                <div
                                                        className="background-div"
                                                        // style={{
                                                        //      backgroundColor: checkColor
                                                        // }}
                                                >
                                                        <div className="background">
                                                                No. <span className="fs-6 fw-bold">{checkNumber}</span>
                                                        </div>
                                                </div>
                                        </div>
                                        <div
                                                className="d-flex align-items-start justify-content-end check-date"
                                                // style={{
                                                //      color: checkColor
                                                // }}
                                        >
                                                Date:{' '}
                                                <span
                                                        className=""
                                                        style={
                                                                {
                                                                        //color: checkColor,
                                                                        //borderColor: checkColor
                                                                }
                                                        }
                                                >
                                                        {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}
                                                </span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between payee-amount-div">
                                                <p
                                                        className="text-uppercase pay-order-txt"
                                                        // style={{
                                                        //      color: checkColor
                                                        // }}
                                                >
                                                        Pay to the order of:
                                                </p>
                                                <div className="pay-person w-100">
                                                        <div className="payee-name d-flex align-items-center">
                                                                <p
                                                                        className="payee w-100"
                                                                        // style={{
                                                                        //      borderColor: checkColor,
                                                                        //      color: checkColor
                                                                        // }}
                                                                >
                                                                        {payee?.name}
                                                                </p>
                                                                <span
                                                                        className="dollar-sign"
                                                                        // style={{
                                                                        //      color: checkColor
                                                                        // }}
                                                                >
                                                                        $
                                                                </span>
                                                        </div>
                                                </div>
                                                <div
                                                        className="diagnol-box"
                                                        // style={{
                                                        //      color: checkColor
                                                        // }}
                                                >
                                                        **
                                                        {amount && amount !== ''
                                                                ? amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
                                                                : '0'}
                                                </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between text-amount-div">
                                                <p
                                                        className="text-amount text-capitalize"
                                                        // style={{
                                                        //      borderColor: checkColor,
                                                        //      color: checkColor
                                                        // }}
                                                >
                                                        {amountInWords.replaceAll('-', ' ')}
                                                </p>
                                                <p
                                                        className="dollar-txt"
                                                        // style={{
                                                        //      color: checkColor
                                                        // }}
                                                >
                                                        Dollors
                                                </p>
                                                <div className="d-flex align-items-center justify-content-center security-txt-div">
                                                        <div className="lock-icon">{checkLockIcon}</div>
                                                        <p
                                                                className="text-uppercase security-txt"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                security feature included
                                                        </p>
                                                </div>
                                        </div>
                                        <div
                                                className="d-flex align-items-center justify-content-start memo-div"
                                                // style={{
                                                //      color: checkColor
                                                // }}
                                        >
                                                Memo : {memo}
                                        </div>
                                        <div className="d-flex align-items-center justify-content-end">
                                                <div className="signature-div">
                                                        <div
                                                                className="signature-box"
                                                                // style={{
                                                                //      borderColor: checkColor
                                                                // }}
                                                        >
                                                                {isSignatureSelected ? (
                                                                        <img
                                                                                src={`data:image/png;base64,${signImagestr}`}
                                                                                alt="signature"
                                                                                style={{
                                                                                        width: '75%',
                                                                                        height: 'inherit',
                                                                                        display: 'block',
                                                                                        margin: '0 auto'
                                                                                }}
                                                                        />
                                                                ) : null}
                                                        </div>
                                                        <p
                                                                className="text-uppercase"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                Authorized Signature
                                                        </p>
                                                </div>
                                        </div>
                                        <div
                                                className="check-number text-center"
                                                // style={{
                                                //      color: checkColor
                                                // }}
                                        >
                                                C0000{checkNumber}C A{bank?.bankRoutingNumber}A C
                                                {bank?.accountNumber}C
                                        </div>
                                </div>
                                <div className="middle-section-check container mx-5 my-5 ps-5">
                                        <div className="user-address ms-5 mb-4 pt-5">
                                                <div className="user-info mb-5">
                                                        <p
                                                                className="fw-normal user-name ext-black m-0 fs-14"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {userData?.firstName || ''} {userData?.lastName || ''}
                                                        </p>
                                                        <p
                                                                className="fw-normal address-info ext-black m-0 fs-14"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {address?.addressLine1}
                                                                {address?.addressLine2 && address?.addressLine2 !== ''
                                                                        ? `, ${address?.addressLine2}`
                                                                        : ''}
                                                        </p>
                                                        <p
                                                                className="fw-normal address-info ext-black m-0 fs-14"
                                                                // style={{
                                                                //      color: checkColor
                                                                // }}
                                                        >
                                                                {address?.city || ''}, {address?.state || ''} ,
                                                                {address?.zipCode || ''}
                                                        </p>
                                                </div>
                                        </div>
                                        <div className="mb-5 ms-5 mt-5 pb-5">
                                                <p className="text-black m-0 fs-14">{payee?.name}</p>
                                        </div>
                                </div>
                                <div className="lower-section-check mt-4">
                                        <div className="row mt-5">
                                                <div className="col-3">
                                                        <p className="fs-14 m-0 fw-bold">
                                                                {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}
                                                        </p>
                                                </div>
                                                <div className="col-6">
                                                        <p className="fs-14 m-0 fw-bold">{payee?.name || ''}</p>
                                                </div>
                                                <div className="col-3">
                                                        <p className="fs-14 m-0 fw-bold">{checkNumber}</p>
                                                </div>
                                        </div>

                                        <div className="row">
                                                <div className="col-3"></div>
                                                <div className="col-5">
                                                        <div className="row mt-4">
                                                                <div className="col-5">
                                                                        <p className="fs-14">Pay To</p>
                                                                </div>
                                                                <div className="col-7">
                                                                        <p className="fs-14">{payee?.name}</p>
                                                                </div>
                                                        </div>
                                                        <div className="row">
                                                                <div className="col-5">
                                                                        <p className="fs-14">Pay From:</p>
                                                                </div>
                                                                <div className="col-7">
                                                                        <p className="fs-14 m-0">
                                                                                {userData?.firstName || ''} {userData?.lastName || ''}
                                                                        </p>
                                                                        <p className="fs-14 m-0">
                                                                                {address?.addressLine1 || ''} ,{' '}
                                                                                {address?.addressLine2 || ''}
                                                                        </p>
                                                                        <p className="fs-14 m-0">
                                                                                {address?.city}, {address?.state}, {address?.zipCode}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                </div>
                                                <div className="col-3"></div>
                                        </div>
                                        <div
                                                className="d-flex align-items-start justify-content-between pt-3"
                                                style={{
                                                        marginTop: '7rem'
                                                }}
                                        >
                                                <div>
                                                        <p className="m-0 fs-14">Memo: {memo}</p>
                                                        <p className="fw-bold m-0 fs-14">
                                                                {userData?.firstName || ''} {userData?.lastName || ''}
                                                        </p>
                                                </div>
                                                <div>
                                                        <p className="fw-bold m-0 fs-14">**{amount}</p>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </>
        )

        return printRef
}

export const printStyles = ` .print-container {
        width: 80%;
        margin: 5rem auto 0;
}

.print-body {
}

.check-body {
        border: 1px solid #c8cbcb;
        background: #fff;
        font-family: Inter;
}

.check-body .user-info {
        margin: 15px 0px 0 30px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .user-info p {
        margin: 0;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .user-info p.user-name {
        font-size: 14px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .user-info p.address-info {
        font-size: 11px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body h1.bank-name-header {
        font-size: 28px;
        font-weight: bold;
        margin: 18px 0 0;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .background-div {
        background: #1e3a5f;
        position: relative;
        padding: 15px 25px 15px 110px;
        -webkit-clip-path: polygon(0 0, 100% 0, 100% 75vh, 0 100%);
        clip-path: polygon(60px 0, 100% 0, 100% 100%, 0 100%);
        color: #fff;
        font-family: Inter;
}

.check-body .background-div .background {
        font-size: 14px;
}

.check-body .check-date {
        margin-right: 30px;
        font-size: 12px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .check-date span {
        width: 130px;
        border-bottom: 1px solid #1e3a5f;
        text-align: center;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div {
        margin: 10px 30px;
        font-size: 14px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div p {
        font-size: 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div p:first-child {
        width: 10%;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div .pay-person p {
        border-bottom: 1px solid #1e3a5f;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div .pay-person .payee-name span.dollar-sign {
        font-size: 25px;
        margin: 0 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div .pay-person .payee-name p {
        font-size: 14px;
        font-weight: 600;
        font-family: Inter;
        color: #1e3a5f;
        margin-left: 5px;
}

.diagnol-box {
        font-size: 14px;
        border: 2px solid #1e3a5f;
        font-weight: 600;
        padding: 8px 35px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-number {
        margin-bottom: 25px;
        font-family: 'MICR';
        font-size: 16px;
        color: #1e3a5f;
}

.signature-div {
        margin: 0 30px 20px 0;
        text-align: center;
        font-family: Inter;
        color: #1e3a5f;
}

.signature-div .signature-box {
        background-color: rgba(94, 164, 121, 0.05);
        border-bottom: 1px solid #1e3a5f;
        height: 45px;
        width: 250px;
        font-family: Inter;
        color: #1e3a5f;
}

.signature-div p {
        margin: 0;
        font-size: 12px;
        font-family: Inter;
        color: #1e3a5f;
}

.memo-div {
        margin-top: 14px;
        margin-left: 30px;
        font-size: 14px;
        margin-bottom: 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div {
        margin: 15px 30px;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div .text-amount {
        width: 100%;
        border-bottom: 1px solid #1e3a5f;
        margin: 0;
        font-family: Inter;
        color: #1e3a5f;
        font-size: 12px;
}

.text-amount-div .dollar-txt {
        font-size: 12px;
        margin: 0 10px 0px;
        text-transform: uppercase;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div .security-txt {
        font-size: 8px;
        margin: 0;
        margin-left: 5px;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div .security-txt-div {
        width: 100px;
        color: #1e3a5f;
}

@media print {
        .check-body {
                font-family: Inter;
                margin: 10px 0px;
                height: 326px;
                color: '#000';
        }

        .check-body h1.bank-name-header {
                font-size: 26px;
                font-family: Inter;
                color: '#000';
        }

        .check-body .user-info p.user-name {
                font-size: 16px;
                font-family: Inter;
                color: '#000';
        }

        .check-body .user-info p.address-info {
                font-size: 12px;
                font-family: Inter;
                color: '#000';
        }
        .check-body .background-div {
                padding: 0px 0px 12px 130px !important;
                font-family: Inter;
                color: '#000';
        }
        .check-body .check-date {
                font-family: Inter;
                color: '#000';
        }
        .check-body .payee-amount-div p {
                font-size: 10px;
                font-family: Inter;
                color: '#000';
        }
        .check-body .payee-amount-div p:first-child {
                width: 100px;
                font-family: Inter;
                margin-right: 5px;
                color: '#000';
        }
        .check-body .payee-amount-div .pay-person .payee-name p {
                font-size: 14px;
                font-weight: 600;
                font-family: Inter;
                color: '#000';
        }
        .check-body .payee-amount-div .pay-person .payee-name span.dollar-sign {
                font-size: 30px;
                margin: 0 10px;
                font-family: Inter;
                color: '#000';
        }
        .diagnol-box {
                font-size: 18px;
                border: 1.5px solid #000 !important;
                font-weight: 600;
                padding: 6px 40px;
                font-family: Inter;
                color: '#000';
        }
        .text-amount-div {
                margin: 0 30px;
                font-family: Inter;
                font-size: 14px;
                color: '#000';
        }
        .memo-div {
                margin-left: 30px;
                font-size: 14px;
                margin-bottom: 8px;
                font-family: Inter;
                color: '#000';
        }
        .signature-div {
                margin-bottom: 10px;
                color: '#000';
        }
        .signature-div p {
                margin: 0;
                font-size: 12px;
                font-family: Inter;
                color: '#000';
        }
        .check-number {
                margin-bottom: 15px;
                font-family: 'MICR';
                color: '#000';
                font-size: 16px;
        }
        .check-body .check-date span {
                border-bottom: 1px solid #000;
        }
        .check-body .payee-amount-div .pay-person p {
                border-bottom: 1px solid #000;
                font-family: Inter;
                color: #000;
        }
        .lock-icon svg path {
                fill: #000 !important;
        }
        .text-amount-div .text-amount {
                border-color: #000 !important;
        }
        .check-body .payee-amount-div .pay-person .payee-name p {
                border-color: #000 !important;
        }
        .check-body .check-date span {
                border-color: #000 !important;
        }
        .signature-div .signature-box {
                border-color: #000 !important;
        }
        .check-body .payee-amount-div {
                margin: -100px 30px 0px;
        }
}`

export const emailCheckPrintStyles = ` .print-container {
        width: 80%;
        margin: 5rem auto 0;
}

.check-body {
        background: #fff;
        font-family: Inter;
}

.check-body .user-info {
        margin: 15px 0px 0 30px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .user-info p {
        margin: 0;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .user-info p.user-name {
        font-size: 12px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .user-info p.address-info {
        font-size: 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body h1.bank-name-header {
        font-size: 20px;
        font-weight: bold;
        margin: 18px 0 0;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .background-div {
        background: #1e3a5f;
        position: relative;
        padding: 12px 100px 12px 25px;
        -webkit-clip-path: polygon(0 0, 100% 0, 100% 75vh, 0 100%);
        clip-path: polygon(60px 0, 100% 0, 100% 100%, 0 100%);
        color: #fff;
        font-family: Inter;
}

.check-body .background-div .background {
        font-size: 12px;
}

.check-body .check-date {
        margin-right: 30px;
        font-size: 10px;
        font-family: Inter;
        color: #1e3a5f;
        margin-bottom: 0;
}

.check-body .check-date span {
        width: 100px;
        border-bottom: 1px solid #1e3a5f;
        text-align: center;
        font-family: Inter;
        color: #1e3a5f;
        margin-left: 5px;
}

.check-body .payee-amount-div {
        align-itenms: end !important;
        margin: 15px 30px 0;
        font-size: 12px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div p.pay-order-txt {
        margin-bottom: 0;
        font-size: 10px;
        width: 15%;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div p {
        font-size: 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div .pay-person p {
        border-bottom: 1px solid #1e3a5f;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div .pay-person .payee-name span.dollar-sign {
        font-size: 20px;
        margin: 0 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-body .payee-amount-div .pay-person .payee-name p {
        font-size: 12px;
        font-weight: 600;
        font-family: Inter;
        color: #1e3a5f;
        margin-left: 5px;
}

.diagnol-box {
        font-size: 12px;
        border: 2px solid #1e3a5f;
        font-weight: 600;
        padding: 8px 35px;
        font-family: Inter;
        color: #1e3a5f;
}

.check-number {
        margin-bottom: 15px;
        font-family: 'MICR';
        font-size: 24px !important;
        color: #1e3a5f;
        margin: 0;
        
}

.signature-div {
        margin: 0 30px 20px 0;
        text-align: center;
        font-family: Inter;
        color: #1e3a5f;
}

.signature-div .signature-box {
        background-color: #fff;
        border-bottom: 1px solid #1e3a5f;
        height: 35px;
        width: 250px;
        font-family: Inter;
        color: #1e3a5f;
}

.signature-div p {
        margin: 0;
        font-size: 10px;
        font-family: Inter;
        color: #1e3a5f;
        margin-bottom: 0;
}

.memo-div {
        margin-top: 0px;
        margin-left: 30px;
        font-size: 12px;
        margin-bottom: 10px;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div {
        margin: 15px 30px 0;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div .text-amount {
        width: 100%;
        border-bottom: 1px solid #1e3a5f;
        margin: 0;
        font-family: Inter;
        color: #1e3a5f;
        font-size: 12px;
}

.text-amount-div .dollar-txt {
        font-size: 10px;
        margin: 0 10px 0px;
        text-transform: uppercase;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div .security-txt {
        font-size: 8px;
        margin: 0;
        margin-left: 5px;
        font-family: Inter;
        color: #1e3a5f;
}

.text-amount-div .security-txt-div {
        width: 100px;
        color: #1e3a5f;
}
.middle-section-check {
                display: block;
                margin: 7rem 0 !important;
        }
        .middle-section-check p {
                font-family: Inter !important;
                color: #1e3a5f !important;
        }
        .lower-section-check {
                display: block;
                padding: 0 2rem !important;
                margin-top: 4rem !important;
        }
        .lower-section-check p {
                font-family: Inter !important;
                color: #1e3a5f !important;
        }
                `

export function getDaysUntilExpiration(unixTimestamp) {
        // Convert Unix timestamp to UTC date
        const expirationDate = new Date(unixTimestamp * 1000)
        const expirationUTC = Date.UTC(
                expirationDate.getUTCFullYear(),
                expirationDate.getUTCMonth(),
                expirationDate.getUTCDate()
        )

        // Get current date in UTC
        const now = new Date()
        const nowUTC = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
        )

        const oneDay = 24 * 60 * 60 * 1000 // Number of milliseconds in a day
        const timeDifference = expirationUTC - nowUTC
        const daysToExpire = Math.floor(timeDifference / oneDay)

        return daysToExpire
}

export const validateEmail = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
        if (!email) {
                return 'Email is required'
        }
        if (!emailRegex.test(email)) {
                return 'Please enter a valid email address'
        }
        return ''
}

export const validatePhone = (phone) => {
        const phoneRegex = /^\+?(?:[1-9]\d{1,4}[- ]?){1,4}\d{4,10}$/
        if (!phone) {
                return 'Phone number is required'
        }
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
                return 'Please enter a valid 10-digit phone number'
        }
        return ''
}

export const handleVerificationCodeChange = (
        index,
        value,
        verificationCode,
        setVerificationCode
) => {
        if (!/^\d*$/.test(value)) return

        const newCode = [...verificationCode]
        newCode[index] = value
        setVerificationCode(newCode)

        if (value !== '' && index < 5) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`)
                if (nextInput) nextInput.focus()
        }
}

export const handleVerificationCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
                const prevInput = document.querySelector(`input[data-index="${index - 1}"]`)
                if (prevInput) prevInput.focus()
        }
}

export const maskEmail = (email) => {
        const [name, domain] = email.split('@')
        return `${name}@***${domain.slice(domain.lastIndexOf('.'))}`
}

export const maskPhone = (phone) => {
        return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
}
export const amountFix = (amount) => {
        const num = Number(amount)
        if (isNaN(num)) return '$0.00'
        if (num < 0) {
                return `-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(num))}`
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export const getStarAndEndDate = (period = 'weekly') => {
        let startDate, endDate
        const now = new Date() // Current date

        switch (period.toLowerCase()) {
                case 'weekly':
                        startDate = startOfWeek(now, { weekStartsOn: 0 }) // Sunday as the first day of the week
                        endDate = endOfWeek(now, { weekStartsOn: 0 })
                        break
                case 'monthly':
                        startDate = startOfMonth(now)
                        endDate = endOfMonth(now)
                        break
                case 'yearly':
                        startDate = startOfYear(now)
                        endDate = endOfYear(now)
                        break
                default: //default is week
                        startDate = startOfWeek(now, { weekStartsOn: 0 })
                        endDate = endOfWeek(now, { weekStartsOn: 0 })
        }
        return { startDate: formatISO(startDate), endDate: formatISO(endDate) }
}
export const isNotNullOrUndefined = (value) =>
        value !== undefined || value !== null

export const getTotalPagesForPagination = (totalRecords, pageSize = 10) =>
        Math.ceil(totalRecords / pageSize)

export const formatUSD = (amount) => {
        return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
        }).format(amount)
}

export const formatDate = (dateString) => {
        const date = new Date(dateString)
        if (isNaN(date)) {
                return dateString
        }
        const formattedDate = date.toLocaleDateString('en-CA')
        return formattedDate
}

export const getPaymentMethodIcon = (method) => {
        if (
                method === 'visa' ||
                method === 'mastercard' ||
                method === 'amex' ||
                method === 'unionpay'
        ) {
                return `/img/payment-icons/${method}.png`
        }
        return '/img/payment-icons/visa.png'
}

export function isMfaWindowValidFromToken(token) {
        if (!token || typeof token !== 'string' || token.split('.').length !== 3) return false
        try {
                const decoded = jwtDecode(token)
                if (!decoded?.mfaExpiresAt) return false
                return new Date(decoded.mfaExpiresAt).getTime() > Date.now()
        } catch (e) {
                return false
        }
}
import React, { useEffect } from 'react'
import numberToWords from 'number-to-words'
import { checkLockIcon } from '../../assets/svg'

const useGetPrintContent = ({ printContent, callback }) => {
        const printRef = React.useRef(null)

        const {
                address = '',
                payee = '',
                bankDetails = '',
                amount = 0,
                memo = '',
                issuedDate = new Date(),
                checkNumber = ''
        } = printContent

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

        useEffect(() => {
                if (printContent && callback && printContent.current !== null) {
                        callback(printContent)
                }
        }, [printRef])

        return (
                <div
                        className="print-body"
                        style={{ display: 'none', fontFamily: 'Inter' }}
                        ref={printRef}
                >
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
                                                        {address?.name || ''}
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
                                                        {bankDetails?.bankName}
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
                                        className="d-flex align-items-center justify-content-end check-date"
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
                                <div className="d-flex align-items-center justify-content-between payee-amount-div mt-4">
                                        <p
                                                className="text-uppercase"
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
                                                ></div>
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
                                        C0000{checkNumber}C A{bankDetails?.bankRoutingNumber}A C
                                        {bankDetails?.accountNumber}C
                                </div>
                        </div>
                        {/* <div className="middle-section-check container">
                                                <div className="user-address">
                                                        <div className="user-info">
                                                                <p
                                                                        className="fw-semibold user-name"
                                                                        // style={{
                                                                        //      color: checkColor
                                                                        // }}
                                                                >
                                                                        {address?.name || ''}
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
                                                </div>
                                        </div> */}
                        {/* <div className="lower-section-check">
                                                <p className="check-number">{checkNumber}</p>
                                                <div className="d-flex align-items-start justify-content-center">
                                                        <div>
                                                                <p>Pay To:</p>
                                                        </div>
                                                        <div>
                                                                <p>{payee?.address?.name}</p>
                                                                <p>
                                                                        {payee?.address?.addressLine1 || ''} ,{' '}
                                                                        {payee?.address?.addressLine2 || ''}
                                                                </p>
                                                                <p>
                                                                        {payee?.address?.city}, {payee?.address?.state},{' '}
                                                                        {payee?.address?.zipCode}
                                                                </p>
                                                        </div>
                                                </div>
                                                <div className="d-flex align-items-start justify-content-center">
                                                        <div>
                                                                <p>Pay From:</p>
                                                        </div>
                                                        <div>
                                                                <p>{address?.name}</p>
                                                                <p>
                                                                        {address?.addressLine1 || ''} , {address?.addressLine2 || ''}
                                                                </p>
                                                                <p>
                                                                        {address?.city}, {address?.state}, {address?.zipCode}
                                                                </p>
                                                        </div>
                                                </div>
                                        </div> */}
                </div>
        )
}

export default useGetPrintContent

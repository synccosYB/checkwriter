import React from 'react'
import numberToWords from 'number-to-words'
import { checkLockIcon } from '../../assets/svg'
import '../../styles/Print.css'
import useUserInfo from '../../API/users/useUserInfo'

const Printcheck = ({ printContent, showPreview, printRef }) => {
        const { data: userData } = useUserInfo()
        const {
                address = '',
                payee = '',
                bankDetails = '',
                amount = 0,
                memo = '',
                issuedDate = new Date(),
                checkNumber = '',
                isSignatureSelected,
                status
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

        return (
                <>
                        <div
                                className="print-container"
                                style={showPreview ? { display: 'block' } : { display: 'none' }}
                        >
                                <div
                                        className="print-body d-flex align-items-between flex-column"
                                        ref={printRef}
                                >
                                        <div
                                                className="check-body position-relative"
                                                style={{ fontFamily: 'Inter' }}
                                        >
                                                <div className="d-flex justify-content-between align-items-start first-section">
                                                        <div className="user-info">
                                                                <p className="fw-semibold user-name">
                                                                        {address?.name1 ? address?.name1 : userData?.firstName || ''}{' '}
                                                                        {address?.name1 ? null : userData?.lastName || ''}
                                                                </p>
                                                                <p className="fw-normal address-info">
                                                                        {address?.addressLine1}
                                                                        {address?.addressLine2 && address?.addressLine2 !== ''
                                                                                ? `, ${address?.addressLine2}`
                                                                                : ''}
                                                                </p>
                                                                <p className="fw-normal address-info">
                                                                        {address?.city || ''}, {address?.state || ''} ,
                                                                        {address?.zipCode || ''}
                                                                </p>
                                                        </div>
                                                        <div className="bank-logo">
                                                                <h1 className="bank-name-header">{bankDetails?.bankName}</h1>
                                                        </div>
                                                        <div className="background-div">
                                                                <div className="background">
                                                                        No. <span className="fs-6 fw-bold">{checkNumber}</span>
                                                                </div>
                                                        </div>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-end check-date">
                                                        Date:{' '}
                                                        <span>
                                                                {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}
                                                        </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between payee-amount-div mt-4">
                                                        <p className="text-uppercase">Pay to the order of:</p>
                                                        <div className="pay-person w-100">
                                                                <div className="payee-name d-flex align-items-center">
                                                                        <p className="payee w-100">{payee?.name}</p>
                                                                        <span className="dollar-sign">$</span>
                                                                </div>
                                                        </div>
                                                        <div
                                                                className="diagnol-box"
                                                                style={
                                                                        status === 'BLANK'
                                                                                ? { padding: '18px 70px' }
                                                                                : { padding: '6px 35px' }
                                                                }
                                                        >
                                                                {status === 'BLANK'
                                                                        ? ''
                                                                        : `**${
                                                                                        amount && amount !== ''
                                                                                                ? amount.toLocaleString('en-US', {
                                                                                                                minimumFractionDigits: 2
                                                                                                  })
                                                                                                : '0'
                                                                          }`}
                                                        </div>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between text-amount-div">
                                                        <p className="text-amount text-capitalize">
                                                                {status === 'BLANK' ? '' : amountInWords.replaceAll('-', ' ')}
                                                        </p>
                                                        <p className="dollar-txt">Dollors</p>
                                                        <div className="d-flex align-items-center justify-content-center security-txt-div">
                                                                <div className="lock-icon">{checkLockIcon}</div>
                                                                <p className="text-uppercase security-txt">
                                                                        security feature included
                                                                </p>
                                                        </div>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-start memo-div">
                                                        Memo : {memo}
                                                </div>
                                                <div className="d-flex align-items-center justify-content-end">
                                                        <div className="signature-div">
                                                                <div className="signature-box">
                                                                        {isSignatureSelected ? (
                                                                                <img
                                                                                        src={userData?.signatureUrl}
                                                                                        alt="signature"
                                                                                        style={{
                                                                                                width: '75%',
                                                                                                height: 'inherit'
                                                                                        }}
                                                                                />
                                                                        ) : null}
                                                                </div>
                                                                <p className="text-uppercase">Authorized Signature</p>
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
                                                <div className="mb-5 ms-5 mt-5 pb-4">
                                                        <p className="text-black m-0 fs-14">{payee?.name}</p>
                                                </div>
                                        </div>
                                        <div className="lower-section-check mt-3">
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
                                                <div className="d-flex align-items-start justify-content-between mt-5 pt-3">
                                                        <div>
                                                                <p className="m-0 fs-14">Memo: {memo}</p>
                                                                <p className="fw-bold m-0 fs-14">
                                                                        {userData?.firstName || ''} {userData?.lastName || ''}
                                                                </p>
                                                        </div>
                                                        <div>
                                                                <p className="fw-bold m-0 fs-14">
                                                                        {' '}
                                                                        {status === 'BLANK' ? '' : `**${amount}`}
                                                                </p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </>
        )
}

export default Printcheck

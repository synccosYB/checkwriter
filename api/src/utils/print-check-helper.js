import numberToWords from 'number-to-words';
import { styles } from './printStyles.js';

export function generateHtml(children) {
  const htmlSample = `
  <!DOCTYPE html>
<html>
<head>
  <title>My PDF</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  <link rel="stylesheet" href="/static/utils/print-check-styles.css">
</head>
<div>
<style>${styles}</style>
<body >
${children}
</body>
 <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
</body>
</html>
   
`;

  return htmlSample;
}

export const getSingleCheckHtml = (checkData, signatureUrl) => {
  const {
    payee,
    address,
    bankDetails,
    issuedDate,
    status,
    checkNumber,
    amount,
    memo,
  } = checkData;

  const date = new Date(issuedDate);

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  const wholeNumber = Math.floor(amount);
  const decimalPart = Math.round((amount - wholeNumber) * 100);
  const words = numberToWords.toWords(wholeNumber);
  const decimalWords = numberToWords.toWords(decimalPart);
  const amountInWords = `${words} and ${decimalWords} cent*****`;

  return `<div class="page"> 
  <div 
    class="print-body d-flex align-items-between flex-column" 
    
    <div 
        class="check-body position-relative" 
        style="font-family: 'Inter'">
        <div class="d-flex justify-content-between align-items-start first-section">
            <div class="user-info">
                <p 
                    class="fw-semibold user-name"> 
                    ${payee.companyName}
                </p>
                <p 
                    class="fw-normal address-info"> 
                    ${address?.addressLine1}
                </p>
                <p 
                    class="fw-normal address-info"> 
                    ${address?.city}, ${address?.state}, ${address?.zipCode} 
                </p>
            </div>
            <div class="bank-logo">
                <h1 
                    class="bank-name-header"> 
                    ${bankDetails?.bankName}
                </h1>
            </div>
            <div 
                class="background-div"> 
                <div class="background">
                    No. <span class="fs-6 fw-bold">${checkNumber}</span>
                </div>
            </div>
        </div>
        <div 
            class="d-flex align-items-center justify-content-end check-date">
            Date: 
            <span>
                   ${formattedDate}
            </span>
        </div>
        <div class="d-flex align-items-center justify-content-between payee-amount-div mt-4">
            <p 
                class="text-uppercase"> 
                Pay to the order of: 
            </p>
            <div class="pay-person w-100">
                <div class="payee-name d-flex align-items-center">
                    <p 
                        class="payee w-100"> 
                        ${payee?.name}
                    </p>
                    <span class="dollar-sign">$</span>
                </div>
            </div>
            <div 
                class="diagnol-box" 
                style="{ 
                    //color: checkColor 
                }" 
                style="{ 
                    ${
                      status === 'BLANK'
                        ? { padding: '18px 70px' }
                        : { padding: '6px 35px' }
                    }
                }">
                    ${
                      status === 'BLANK'
                        ? ''
                        : '**' +
                          amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })
                    }
            </div>
        </div>
        <div class="d-flex align-items-center justify-content-between text-amount-div">
            <p 
                class="text-amount text-capitalize"> 
                  ${amountInWords}
            </p>
            <p 
                class="dollar-txt"> 
                Dollars 
            </p>
            <div class="d-flex align-items-center justify-content-center security-txt-div">
                <div class="lock-icon">${moneyIcon}</div>
                <p 
                    class="text-uppercase security-txt"> 
                    security feature included 
                </p>
            </div>
        </div>
        <div 
            class="d-flex align-items-center justify-content-start memo-div"> 
            Memo : ${memo || ''} 
        </div>
        <div class="d-flex align-items-center justify-content-end">
            <div class="signature-div">
                <div 
                    class="signature-box"> 
                   <img 
                        src="${signatureUrl}" 
                        alt="signature" 
                        style="{ 
                            width: '65%', 
                            height: 'inherit' 
                        }" /> 
                </div>
                <p 
                    class="text-uppercase"> 
                    Authorized Signature 
                </p>
            </div>
        </div>
        <div 
            class="check-number text-center">  
            C0000${checkNumber}C A${bankDetails?.routingNumber}A C
							${bankDetails?.accountNumber}C
        </div>
    </div>
    <div class="middle-section-check container mx-5 my-5 ps-5">
        <div class="user-address ms-5 mb-4 pt-5">
            <div class="user-info mb-5">
                <p 
                    class="fw-normal user-name ext-black m-0 fs-14"> 
                     ${payee?.companyName}
                </p>
                <p 
                    class="fw-normal address-info ext-black m-0 fs-14"> 
                      ${address?.addressLine1}
                </p>
                <p 
                    class="fw-normal address-info ext-black m-0 fs-14"> 
                    ${address?.city}, ${address?.state} ${address?.zipCode} 
                </p>
            </div>
        </div>
        <div class="mb-5 ms-5 mt-5 pb-4">
            <p class="text-black m-0 fs-14">${payee.name}</p>
        </div>
    </div>
    <div class="lower-section-check mt-3">
        <div class="row mt-5">
            <div class="col-3">
                <p class="fs-14 m-0 fw-bold"> ${formattedDate}</p>
            </div>
            <div class="col-6">
                <p class="fs-14 m-0 fw-bold">${payee?.name}</p>
            </div>
            <div class="col-3">
                <p class="fs-14 m-0 fw-bold">${checkNumber}</p>
            </div>
        </div>

        <div class="row">
            <div class="col-3"></div>
            <div class="col-5">
                <div class="row mt-4">
                    <div class="col-5">
                        <p class="fs-14">Pay To</p>
                    </div>
                    <div class="col-7">
                        <p class="fs-14">${payee?.name}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-5">
                        <p class="fs-14">Pay From:</p>
                    </div>
                    <div class="col-7">
                        <p class="fs-14 m-0">${payee?.companyName}</p>
                        <p class="fs-14 m-0">${address?.addressLine1}, </p>
                        <p class="fs-14 m-0"> ${address?.city}, ${
    address?.state
  } ${address?.zipCode} </p>
                    </div>
                </div>
            </div>
            <div class="col-3"></div>
        </div>
        <div class="d-flex align-items-start justify-content-between mt-5 pt-3">
            <div>
                <p class="m-0 fs-14">Memo: ${memo || ''} </p>
                <p class="fw-bold m-0 fs-14">${payee?.companyName}</p>
            </div>
            <div>
                <p class="fw-bold m-0 fs-14"> ${
                  status === 'BLANK'
                    ? ''
                    : '**' +
                      amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })
                }</p>
            </div>
        </div>
    </div>
</div>
</div>
</div>`;
};

const moneyIcon = `
  <svg
		width="24"
		height="22"
		viewBox="0 0 24 22"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M18.3281 8.40114H18.2702V4.33977C18.2702 2.22386 15.3701 0.5 11.8108 0.5C8.25041 0.5 5.35148 2.22386 5.35148 4.33977V8.40114H5.29358C2.5376 8.40114 0.269531 9.73181 0.269531 11.3875V18.3841C0.269531 20.0227 2.50924 21.3705 5.29358 21.3705H18.3281C21.0841 21.3705 23.3521 20.0398 23.3521 18.3841V11.3875C23.3226 9.73181 21.0841 8.40114 18.3281 8.40114ZM8.8824 4.33977C8.8824 3.38409 10.2031 2.59886 11.8108 2.59886C13.4186 2.59886 14.7393 3.38409 14.7393 4.33977V8.40114H8.8824V4.33977ZM19.8212 18.3841C19.8212 18.8796 19.1598 19.2716 18.3281 19.2716H5.29358C4.46078 19.2716 3.80045 18.8796 3.80045 18.3841V11.3875C3.80045 10.8932 4.46078 10.5 5.29358 10.5H7.10215H16.49H18.2986C19.1314 10.5 19.7917 10.8932 19.7917 11.3875V18.3841H19.8212Z"
			fill="#5EA479"
		/>
	</svg>`;

const formatUSD = (amount) => {
  const num = Number(amount)
  if (isNaN(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export const welcomeEmailTemplate = (message) => {
  try {
    return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Syncoos Email Verify</title>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                <script
                    src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"
                    integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3"
                    crossorigin="anonymous"
                ></script>
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"
                    integrity="sha384-mQ93GR66B00ZXjt0YO5KlohRA5SY2XofN4zfuZxLkoj1gXtW8ANNCe9d5Y3eG5eD"
                    crossorigin="anonymous"
                ></script>
                </head>

                <body>
                <div
                    style="
                    background-color: #f0f1f5;
                    margin: 0 !important;
                    padding: 0 !important;
                    "
                >
                    <div style="width: 80%; margin: 0 auto; padding: 2rem 2rem">
                    <div style="display: flex; flex-direction: column; align-items: center">
                        <div
                        style="
                            background-image: linear-gradient(
                            91.57deg,
                            #84d6a6 5.31%,
                            #4eb7a8 54.78%,
                            #2da4aa 94.92%
                            );
                            width: 50%;
                            padding: 50px 50px 80px;
                            text-align: center;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        "
                        >
                        <img
                            src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png"
                            alt=""
                            width="auto"
                            height="40px"
                        />
                        </div>
                        <div style="background-color: #f6f6f6">
                        <div
                            style="margin: 0 auto; background-color: #fff; padding: 70px 60px"
                        >
                            <p
                            style="
                                font-family: inherit;
                                margin: 20px 0;
                                font-weight: 400;
                                font-size: 16px;
                            "
                            >
                            Hi there,
                            </p>
                            <p
                            style="
                                font-family: inherit;
                                margin: 20px 0 10px;
                                font-weight: 400;
                                font-size: 16px;
                            "
                            >
                            The OTP to verify this email id is
                            </p>
                            <p
                            style="
                                background: #e7faf9;
                                font-family: inherit;
                                border-radius: 8px;
                                color: #000;
                                display: inline-block;
                                font-size: 36px;
                                font-weight: 600;
                                line-height: 44px;
                                letter-spacing: 1px;
                                padding: 8px 32px;
                            "
                            >
                            ${message}
                            </p>
                            <p
                            style="
                                font-family: inherit;
                                margin: 10px 0 20px;
                                font-weight: 400;
                                font-size: 16px;
                            "
                            >
                            In case there's been a mistake, hit reply and let us know right
                            away.
                            </p>
                            <p
                            style="
                                font-family: inherit;
                                margin: 30px 0 5px;
                                font-weight: 400;
                                font-size: 16px;
                            "
                            >
                            Thanks,
                            </p>
                            <p
                            style="
                                font-family: inherit;
                                margin: 5px 0 20px;
                                font-weight: 400;
                                font-size: 16px;
                            "
                            >
                            Team Synccos
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </body>
            </html>
        `;
  } catch (err) {
    throw err;
  }
};

export const forgotPasswordTemplate = (url) => {
  try {
    return `
        <!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
            <title></title>
            <!--[if !mso]>
                <!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <!--
                <![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style type="text/css">
                #outlook a {
                padding: 0;
                }

                body {
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                }

                table,
                td {
                border-collapse: collapse;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                }

                img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
                -ms-interpolation-mode: bicubic;
                }

                p {
                display: block;
                margin: 13px 0;
                }
            </style>
            <!--[if mso]>
                <noscript>
                    <xml>
                        <o:OfficeDocumentSettings>
                            <o:AllowPNG />
                            <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                    </xml>
                </noscript>
                <![endif]-->
            <!--[if lte mso 11]>
                <style type="text/css">                         .mj-outlook-group-fix {                                 width: 100% !important;                         }                       </style>
                <![endif]-->
            <style type="text/css">
                @media only screen and (min-width: 480px) {
                .mj-column-per-50 {
                    width: 50% !important;
                    max-width: 50%;
                }
                }
            </style>
            <style media="screen and (min-width:480px)">
                .moz-text-html .mj-column-per-50 {
                width: 50% !important;
                max-width: 50%;
                }
            </style>
            <style type="text/css">
                @media only screen and (max-width: 480px) {
                table.mj-full-width-mobile {
                    width: 100% !important;
                }

                td.mj-full-width-mobile {
                    width: auto !important;
                }
                }
            </style>
            <style type="text/css">
                .outer-container {
                background-color: #f0f1f5;
                min-width: 100%;
                margin: 100px auto;
                padding: 20px 20px;
                }

                .inner-container {
                min-width: 100%;
                max-width: 700px;
                margin: 0 auto;
                }

                .left-section {
                display: block;
                background-image: linear-gradient(91.57deg, #84d6a6 5.31%, #4eb7a8 54.78%, #2da4aa 94.92%);
                text-align: center;
                min-width: 100%;
                padding: 50px 0;
                }

                .right-section {
                display: block;
                min-width: 100%;
                margin: 0 auto;
                background: #fff;
                padding: 10px 0;
                }
            </style>
            </head>
            <body style="word-spacing: normal">
            <div style="">
                <!--[if mso | IE]>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" class="outer-container-outlook" style="width:600px;" width="600" >
                        <tr>
                            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                <![endif]-->
                <div class="outer-container" style="margin: 0px auto; max-width: 600px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%">
                    <tbody>
                    <tr>
                        <td style="                                                                     direction: ltr;                                                                 font-size: 0px;                                                                 padding: 20px 0;                                                                        text-align: center;                                                             ">
                        <!--[if mso | IE]>
                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td class="inner-container-outlook" width="600px" >
                                                                <table align="center" border="0" cellpadding="0" cellspacing="0" class="inner-container-outlook" style="width:600px;" width="600" >
                                                                    <tr>
                                                                        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                                                                            <![endif]-->
                        <div class="inner-container" style="margin: 0px auto; max-width: 600px">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%">
                            <tbody>
                                <tr>
                                <td style="                                                                                                             direction: ltr;                                                                                                         font-size: 0px;                                                                                                         padding: 20px 0;                                                                                                                text-align: center;                                                                                                     ">
                                    <!--[if mso | IE]>
                                                                                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                                                                    <tr>
                                                                                                        <td class="left-section-outlook" style="vertical-align:top;width:300px;" >
                                                                                                            <![endif]-->
                                    <div class="mj-column-per-50 mj-outlook-group-fix left-section" style="                                                                                                                     font-size: 0px;                                                                                                                 text-align: left;                                                                                                                       direction: ltr;                                                                                                                 display: inline-block;                                                                                                                  vertical-align: top;                                                                                                                    width: 100%;                                                                                                            ">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align: top" width="100%">
                                        <tbody>
                                        <tr>
                                            <td align="center" style="                                                                                                                                                  font-size: 0px;                                                                                                                                                 padding: 10px 25px;                                                                                                                                                     word-break: break-word;                                                                                                                                         ">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="                                                                                                                                                               border-collapse: collapse;                                                                                                                                                              border-spacing: 0px;                                                                                                                                                    ">
                                                <tbody>
                                                <tr>
                                                    <td style="width: 250px">
                                                    <img alt="app-logo" height="auto" src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png" style="                                                                                                                                                                                           border: 0;                                                                                                                                                                                              display: block;                                                                                                                                                                                         outline: none;                                                                                                                                                                                          text-decoration: none;                                                                                                                                                                                          height: auto;                                                                                                                                                                                           width: 70%;                                                                                                                                                                                             font-size: 13px;                                                                                                                                                                                        " width="250" />
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </div>
                                    <!--[if mso | IE]>
                                                                                                        </td>
                                                                                                        <td class="right-section-outlook" style="vertical-align:top;width:300px;" >
                                                                                                            <![endif]-->
                                    <div class="mj-column-per-50 mj-outlook-group-fix right-section" style="                                                                                                                    font-size: 0px;                                                                                                                 text-align: left;                                                                                                                       direction: ltr;                                                                                                                 display: inline-block;                                                                                                                  vertical-align: top;                                                                                                                    width: 100%;                                                                                                            ">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align: top" width="100%">
                                        <tbody>
                                        <tr>
                                            <td align="center" class="email-subject" style="                                                                                                                                                    font-size: 0px;                                                                                                                                                 padding: 30px 15px 20px;                                                                                                                                                        word-break: break-word;                                                                                                                                         ">
                                            <div style="                                                                                                                                                                font-family: inherit;                                                                                                                                                           font-size: 24px;                                                                                                                                                                font-weight: 500;                                                                                                                                                               line-height: 30px;                                                                                                                                                              text-align: center;                                                                                                                                                             color: #222222;                                                                                                                                                 "> Welcome to Synccos Check Writer Subscription from Synccos Inc.! </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" class="email-txt" style="                                                                                                                                                  font-size: 0px;                                                                                                                                                 padding: 10px 15px;                                                                                                                                                     word-break: break-word;                                                                                                                                         ">
                                            <div style="                                                                                                                                                                font-family: inherit;                                                                                                                                                           font-size: 16px;                                                                                                                                                                line-height: 1;                                                                                                                                                         text-align: left;                                                                                                                                                               color: #222222;                                                                                                                                                 "> Dear User, </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" class="email-txt" style="                                                                                                                                                  font-size: 0px;                                                                                                                                                 padding: 5px 15px;                                                                                                                                                      word-break: break-word;                                                                                                                                         ">
                                            <div style="                                                                                                                                                                font-family: inherit;                                                                                                                                                           font-size: 16px;                                                                                                                                                                line-height: 24px;                                                                                                                                                              text-align: left;                                                                                                                                                               color: #222222;                                                                                                                                                 "> Click on the link below to reset your password. </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" class="email-txt" style="                                                                                                                                                  font-size: 0px;                                                                                                                                                 padding: 5px 15px;                                                                                                                                                      word-break: break-word;                                                                                                                                         ">
                                            <div style="                                                                                                                                                                font-family: inherit;                                                                                                                                                           font-size: 16px;                                                                                                                                                                line-height: 24px;                                                                                                                                                              text-align: left;                                                                                                                                                               color: #222222;                                                                                                                                                 ">
                                                <b>NOTE:</b> Only valid for 15 minutes.
                                            </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </div>
                                    <!--[if mso | IE]>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                                <![endif]-->
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        <!--[if mso | IE]>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <![endif]-->
                        </td>
                    </tr>
        <tr>
                                            <td align='left' class='email-txt' style='font-size:0px;padding:5px 15px;word-break:break-word;'>
                                            <div style='font-family:inherit;font-size:16px;line-height:24px;text-align:left;color:#222222;'> <a href='${url}' target="_blank">${url}</a>. </div>
                                            </td>
                                        </tr>
                    </tbody>
                </table>
                </div>
                <!--[if mso | IE]>
                            </td>
                        </tr>
                    </table>
                    <![endif]-->
            </div>
            </body>
        </html>
    `;
  } catch (err) {
    throw err;
  }
};

export const otpVerificationTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Syncoos Email Verify</title>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
      <script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"
        integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3"
        crossorigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"
        integrity="sha384-mQ93GR66B00ZXjt0YO5KlohRA5SY2XofN4zfuZxLkoj1gXtW8ANNCe9d5Y3eG5eD"
        crossorigin="anonymous"
      ></script>
    </head>
  
    <body>
      <div
        style="
          background-color: #f0f1f5;
          margin: 0 !important;
          padding: 0 !important;
        "
      >
        <div style="width: 80%; margin: 0 auto; padding: 2rem 2rem">
          <div style="display: flex; flex-direction: column; align-items: center">
            <div
              style="
                background-image: linear-gradient(
                  91.57deg,
                  #84d6a6 5.31%,
                  #4eb7a8 54.78%,
                  #2da4aa 94.92%
                );
                width: 50%;
                padding: 50px 50px 80px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <img
                src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png"
                alt=""
                width="auto"
                height="40px"
              />
            </div>
            <div style="background-color: #f6f6f6">
              <div
                style="margin: 0 auto; background-color: #fff; padding: 70px 60px"
              >
                <p
                  style="
                    font-family: inherit;
                    margin: 20px 0;
                    font-weight: 400;
                    font-size: 16px;
                  "
                >
                  Hi there,
                </p>
                <p
                  style="
                    font-family: inherit;
                    margin: 20px 0 10px;
                    font-weight: 400;
                    font-size: 16px;
                  "
                >
                  The OTP to verify this email id is
                </p>
                <p
                  style="
                    background: #e7faf9;
                    font-family: inherit;
                    border-radius: 8px;
                    color: #000;
                    display: inline-block;
                    font-size: 36px;
                    font-weight: 600;
                    line-height: 44px;
                    letter-spacing: 1px;
                    padding: 8px 32px;
                  "
                >
                  ${otp}
                </p>
                <p
                  style="
                    font-family: inherit;
                    margin: 10px 0 20px;
                    font-weight: 400;
                    font-size: 16px;
                  "
                >
                  In case there's been a mistake, hit reply and let us know right
                  away.
                </p>
                <p
                  style="
                    font-family: inherit;
                    margin: 30px 0 5px;
                    font-weight: 400;
                    font-size: 16px;
                  "
                >
                  Thanks,
                </p>
                <p
                  style="
                    font-family: inherit;
                    margin: 5px 0 20px;
                    font-weight: 400;
                    font-size: 16px;
                  "
                >
                  Team Synccos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

export const sendCheckToPayee = (
  urls,
  senderName,
  organization,
  address,
  content,
  recipientName,
  checkIds
) => {
  try {
    const htmlHeader = `<!DOCTYPE html>
    <html
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      lang="en"
    >
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            box-sizing: border-box;
          }
    
          body {
            margin: 0;
            padding: 0;
          }
    
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
    
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
    
          p {
            line-height: inherit;
          }
    
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
    
          .image_block img + div {
            display: none;
          }
    
          @media (max-width: 705px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
    
            .icons-inner {
              text-align: center;
            }
    
            .icons-inner td {
              margin: 0 auto;
            }
    
            .row-content {
              width: 100% !important;
            }
    
            .mobile_hide {
              display: none;
            }
    
            .stack .column {
              width: 100%;
              display: block;
            }
    
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
    
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
    
            .row-3 .column-1 .block-1.paragraph_block td.pad > div {
              font-size: 13px !important;
            }
    
            .row-3 .column-1 .block-3.heading_block h1 {
              font-size: 17px !important;
            }
    
            .row-3 .column-1 .block-2.paragraph_block td.pad > div {
              font-size: 12px !important;
            }
    
            .row-2 .column-1 .block-1.heading_block h2 {
              font-size: 16px !important;
            }
    
            .row-4 .column-1 {
              padding: 5px 0 !important;
            }
          }
        </style>
      </head>
    
      <body
        style="
          background-color: #ffffff;
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: none;
          text-size-adjust: none;
        "
      >
        <table
          class="nl-container"
          width="100%"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            background-color: #ffffff;
          "
        >
          <tbody>
            <tr>
              <td>
                <table
                  class="row row-1"
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    background-color: #ffffff;
                  "
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          class="row-content stack"
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            background-color: #ffffff;
                            border-bottom: 1px solid #e3e6e8;
                            border-radius: 4px 4px 0 0;
                            color: #000000;
                            width: 685px;
                          "
                          width="685"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="column column-1"
                                width="100%"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  font-weight: 400;
                                  text-align: left;
                                  padding-bottom: 5px;
                                  padding-top: 5px;
                                  vertical-align: top;
                                  border-top: 0px;
                                  border-right: 0px;
                                  border-bottom: 0px;
                                  border-left: 0px;
                                "
                              >
                                <table
                                  class="image_block block-1"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="pad"
                                      style="
                                        padding-bottom: 15px;
                                        padding-left: 10px;
                                        padding-right: 10px;
                                        padding-top: 15px;
                                        width: 100%;
                                      "
                                    >
                                      <div
                                        class="alignment"
                                        align="left"
                                        style="line-height: 10px"
                                      >
                                        <img
                                          src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png"
                                          style="
                                            display: block;
                                            height: auto;
                                            border: 0;
                                            width: 171px;
                                            max-width: 100%;
                                          "
                                          width="171"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table
                  class="row row-2"
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    background-color: #ffffff;
                  "
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          class="row-content stack"
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            background-color: #ffffff;
                            border-radius: 0;
                            color: #000000;
                            width: 685px;
                          "
                          width="685"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="column column-1"
                                width="100%"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  font-weight: 400;
                                  text-align: left;
                                  padding-bottom: 5px;
                                  padding-top: 5px;
                                  vertical-align: top;
                                  border-top: 0px;
                                  border-right: 0px;
                                  border-bottom: 0px;
                                  border-left: 0px;
                                "
                              >
                                <table
                                  class="heading_block block-1"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="pad"
                                      style="
                                        padding-bottom: 10px;
                                        padding-left: 10px;
                                        padding-right: 10px;
                                        padding-top: 5px;
                                        text-align: center;
                                        width: 100%;
                                      "
                                    >
                                      <h2
                                        style="
                                          margin: 0;
                                          color: #555555;
                                          direction: ltr;
                                          font-family: 'Open Sans', 'Helvetica Neue',
                                            Helvetica, Arial, sans-serif;
                                          font-size: 18px;
                                          font-weight: 400;
                                          letter-spacing: normal;
                                          line-height: 120%;
                                          text-align: left;
                                          margin-top: 0;
                                          margin-bottom: 0;
                                        "
                                      >
                                        <span class="tinyMce-placeholder"
                                          >Dear ${recipientName},</span
                                        >
                                      </h2>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table
                  class="row row-3"
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    background-color: #ffffff;
                  "
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          class="row-content stack"
                          align="center"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            background-color: #ffffff;
                            border-radius: 0;
                            color: #000000;
                            width: 685px;
                          "
                          width="685"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="column column-1"
                                width="100%"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  font-weight: 400;
                                  text-align: left;
                                  padding-bottom: 5px;
                                  padding-top: 5px;
                                  vertical-align: top;
                                  border-top: 0px;
                                  border-right: 0px;
                                  border-bottom: 0px;
                                  border-left: 0px;
                                "
                              >
                                <table
                                  class="paragraph_block block-1"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    word-break: break-word;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="pad"
                                      style="
                                        padding-bottom: 20px;
                                        padding-left: 10px;
                                        padding-right: 10px;
                                        padding-top: 10px;
                                      "
                                    >
                                      <div
                                        style="
                                          color: #000000;
                                          direction: ltr;
                                          font-family: 'Open Sans', 'Helvetica Neue',
                                            Helvetica, Arial, sans-serif;
                                          font-size: 16px;
                                          font-weight: 400;
                                          letter-spacing: 0px;
                                          line-height: 150%;
                                          text-align: left;
                                          mso-line-height-alt: 24px;
                                        "
                                      >
                                        <p style="margin: 0">
                                          ${content}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table
                                  class="paragraph_block block-2"
                                  width="100%"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    word-break: break-word;
                                  "
                                >
                                  <tr>
                                    <td
                                      class="pad"
                                      style="
                                        padding-bottom: 20px;
                                        padding-left: 10px;
                                        padding-right: 10px;
                                        padding-top: 10px;
                                      "
                                    >
                                      <div
                                        style="
                                          color: #000000;
                                          direction: ltr;
                                          font-family: 'Open Sans', 'Helvetica Neue',
                                            Helvetica, Arial, sans-serif;
                                          font-size: 16px;
                                          font-weight: 400;
                                          letter-spacing: 0px;
                                          line-height: 150%;
                                          text-align: left;
                                          mso-line-height-alt: 24px;
                                        "
                                      >
                                        <p style="margin: 0; margin-bottom: 8px">
                                          Thanks and regards,&nbsp;<br />${senderName}
                                        </p>
                                        <p style="margin: 0">
                                          ${organization}<br />${address}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table
                                  class="heading_block block-3"
                                  width="100%"
                                  border="0"
                                  cellpadding="10"
                                  cellspacing="0"
                                  role="presentation"
                                  style="
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                  "
                                >
                                  <tr>
                                    <td class="pad">
                                      <h1
                                        style="
                                          margin: 0;
                                          color: #555555;
                                          direction: ltr;
                                          font-family: 'Open Sans', 'Helvetica Neue',
                                            Helvetica, Arial, sans-serif;
                                          font-size: 23px;
                                          font-weight: 700;
                                          letter-spacing: normal;
                                          line-height: 150%;
                                          text-align: left;
                                          margin-top: 0;
                                          margin-bottom: 0;
                                        "
                                      >
                                        <span class="tinyMce-placeholder"
                                          >Attachments:-</span
                                        >
                                      </h1>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
    
                
                <table
                  class="row row-4"
                  align="center"
                  width="100%"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    background-color: #ffffff;
                  "
                >
                  <tbody>
                    <tr>
                      <td>`;
    const htmlFooter = `</td>
    </tr>
  </tbody>
</table>
</td>
</tr>
</tbody>
</table>

</body>
</html>`;
    const htmlEmptyColumn = `<td
    class="column column-4"
    width="25%"
    style="
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      font-weight: 400;
      text-align: left;
      padding-bottom: 5px;
      padding-top: 5px;
      vertical-align: top;
      border-top: 0px;
      border-right: 0px;
      border-bottom: 0px;
      border-left: 0px;
    "
  ></td>
`;
    const htmlGroupingTable = `<table
    class="row-content stack"
    align="center"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      background-color: #ffffff;
      border-radius: 0 0 4px 4px;
      color: #000000;
      width: 685px;
    "
    width="685"
  >
    <tbody>
      <tr>`;

    let completeHtml = htmlHeader;
    let buttonCount = 0;
    const htmlGroupingTableEnd = `</tr>
    </tbody>
    </table>`;

    for (let i = 0; i < urls.length; i++) {
      if (i % 4 === 0) {
        completeHtml += htmlGroupingTable;
        const remainingButtons = Math.min(4, urls.length - i);

        for (let j = 0; j < remainingButtons; j++) {
          const shortName =
            checkIds[i + j].substring(0, 4) +
            "..." +
            checkIds[i + j].substring(
              checkIds[i + j].length - 4,
              checkIds[i + j].length
            );
          const htmlButton = `<td
          class="column column-1"
          width="25%"
          style="
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            font-weight: 400;
            text-align: left;
            padding-bottom: 20px;
            padding-top: 5px;
            vertical-align: top;
            border-top: 0px;
            border-right: 0px;
            border-bottom: 0px;
            border-left: 0px;
          "
        >
          <table
            class="button_block block-1"
            width="100%"
            border="0"
            cellpadding="10"
            cellspacing="0"
            role="presentation"
            style="
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            "
          >
            <tr>
              <td class="pad">
                <div class="alignment" align="center">
                  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:45px;width:151px;v-text-anchor:middle;" arcsize="23%" stroke="false" fillcolor="#5da76f"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:14px"><![endif]-->
                  <div
                    title="${checkIds[i + j]}.pdf"
                    style="
                      text-decoration: none;
                      display: block;
                      color: #ffffff;
                      background-color: #5da76f;
                      border-radius: 10px;
                      width: 100%;
                      border-top: 0px solid transparent;
                      font-weight: 400;
                      border-right: 0px solid transparent;
                      border-bottom: 0px solid transparent;
                      border-left: 0px solid transparent;
                      padding-top: 10px;
                      padding-bottom: 10px;
                      font-family: 'Open Sans',
                        'Helvetica Neue', Helvetica, Arial,
                        sans-serif;
                      font-size: 14px;
                      text-align: center;
                      mso-border-alt: none;
                      word-break: keep-all;
                      cursor: pointer;
                    "
                  >
                    <a
                    href="${urls[i + j]}"
                    target="_blank"
                    rel="no-referrer"
                      style="
                        padding-left: 0px;
                        padding-right: 0px;
                        font-size: 14px;
                        display: inline-block;
                        letter-spacing: normal;
                        color: #fff;
                        text-decoration: none;
                      "
                      ><span
                        style="
                          word-break: break-word;
                          line-height: 25.2px;
                        "
                        >${shortName}.pdf</span
                      ></a
                    >
                  </div>
                  <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                </div>
              </td>
            </tr>
          </table>
        </td>`;
          completeHtml += htmlButton;
          buttonCount++;
        }

        const emptyColumnsCount = 4 - remainingButtons;
        for (let k = 0; k < emptyColumnsCount; k++) {
          completeHtml += htmlEmptyColumn;
        }

        completeHtml += htmlGroupingTableEnd;
      }

      completeHtml += htmlFooter;
    }

    return completeHtml;
  } catch (err) {
    throw err;
  }
};

export const emailUlTemplate = (userDetails, mode) => {
  try {
    return `
    <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <style>
                * {
                        box-sizing: border-box;
                }

                body {
                        margin: 0;
                        padding: 0;
                }

                a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: inherit !important;
                }

                #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                }

                p {
                        line-height: inherit
                }

                .desktop_hide,
                .desktop_hide table {
                        mso-hide: all;
                        display: none;
                        max-height: 0px;
                        overflow: hidden;
                }

                .image_block img+div {
                        display: none;
                }

                @media (max-width:620px) {
                        .desktop_hide table.icons-inner {
                                display: inline-block !important;
                        }

                        .icons-inner {
                                text-align: center;
                        }

                        .icons-inner td {
                                margin: 0 auto;
                        }

                        .row-content {
                                width: 100% !important;
                        }

                        .stack .column {
                                width: 100%;
                                display: block;
                        }

                        .mobile_hide {
                                max-width: 0;
                                min-height: 0;
                                max-height: 0;
                                font-size: 0;
                                display: none;
                                overflow: hidden;
                        }

                        .desktop_hide,
                        .desktop_hide table {
                                max-height: none !important;
                                display: table !important;
                        }

                        .row-1 .column-1 .block-2.heading_block h2 {
                                text-align: center !important;
                        }

                        .row-1 .column-1 .block-2.heading_block h2 {
                                font-size: 21px !important;
                        }

                        .row-1 .column-1 .block-3.paragraph_block td.pad>div {
                                font-size: 14px !important;
                        }
                }
        </style>
</head>

<body style="text-size-adjust: none; background-color: #fff; margin: 0; padding: 0;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff;">
                <tbody>
                        <tr>
                                <td>
                                        <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                        <tr>
                                                                <td>
                                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000; width: 600px; margin: 0 auto;" width="600">
                                                                                <tbody>
                                                                                        <tr>
                                                                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; text-align: left; font-weight: 400; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="15" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                                <tr>
                                                                                                                        <td class="pad">
                                                                                                                                <div class="alignment" align="left" style="line-height:10px"><img src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png" style="height: auto; display: block; border: 0; max-width: 150px; width: 100%;" width="150"></div>
                                                                                                                        </td>
                                                                                                                </tr>
                                                                                                        </table>
                                                                                                        <table class="heading_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                                <tr>
                                                                                                                        <td class="pad">
                                                                                                                                <h2 style="margin: 0; color: #000000; direction: ltr; font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">New User Signup</span></h2>
                                                                                                                        </td>
                                                                                                                </tr>
                                                                                                        </table>
                                                                                                        <table class="paragraph_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                                                <tr>
                                                                                                                        <td class="pad">
                                                                                                                                <div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                                                        <p style="margin: 0; margin-bottom: 16px;">Dear Yoel,&nbsp;<br><br>A new user just landed on Synccos Check Writer.&nbsp;<br>Here are the details for the user:-&nbsp;<br><br>Full Name - ${
                                    userDetails.firstName
                                  } ${userDetails.middleName || ""} ${
      userDetails.lastName
    }&nbsp;<br>Email - ${userDetails.email}<br>Phone Number - ${
      userDetails.phone || "Not available"
    }<br>Signup through - ${mode}<br><br></p>
                                                                                                                                        <p style="margin: 0;">Thank You,<br>Synccos Team&nbsp;</p>
                                                                                                                                </div>
                                                                                                                        </td>
                                                                                                                </tr>
                                                                                                        </table>
                                                                                                </td>
                                                                                        </tr>
                                                                                </tbody>
                                                                        </table>
                                                                </td>
                                                        </tr>
                                                </tbody>
                                        </table>
</body>

</html>
    `;
  } catch (err) {
    throw err;
  }
};

export const paymentReceivedTemplate = (userName, recipientName, recipientEmail, amount, transactionId, invoiceNumber, synccosDetails) => {
  return `<!doctype html>
  <html
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
  >
  <head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--[if mso
  ]><xml
  ><o:OfficeDocumentSettings
  ><o:PixelsPerInch>96</o:PixelsPerInch
  ><o:AllowPNG /></o:OfficeDocumentSettings></xml
  ><![endif]-->
  <style>
  * {
  box-sizing: border-box;
  }
  
  
  body {
  margin: 0;
  padding: 0;
  }
  
  
  a[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: inherit !important;
  }
  
  
  #MessageViewBody a {
  color: inherit;
  text-decoration: none;
  }
  
  
  p {
  line-height: inherit;
  }
  
  
  .desktop_hide,
  .desktop_hide table {
  mso-hide: all;
  display: none;
  max-height: 0px;
  overflow: hidden;
  }
  
  
  .image_block img + div {
  display: none;
  }
  
  
  @media (max-width: 705px) {
  .desktop_hide table.icons-inner {
  display: inline-block !important;
  }
  
  
  .icons-inner {
  text-align: center;
  }
  
  
  .icons-inner td {
  margin: 0 auto;
  }
  
  
  .mobile_hide {
  display: none;
  }
  
  
  .row-content {
  width: 100% !important;
  }
  
  
  .stack .column {
  width: 100%;
  display: block;
  }
  
  
  .mobile_hide {
  min-height: 0;
  max-height: 0;
  max-width: 0;
  overflow: hidden;
  font-size: 0px;
  }
  
  
  .desktop_hide,
  .desktop_hide table {
  display: table !important;
  max-height: none !important;
  }
  
  
  .row-2 .column-1 .block-1.heading_block h2 {
  font-size: 16px !important;
  }
  
  
  .row-3 .column-1 .block-4.paragraph_block td.pad > div {
  font-size: 12px !important;
  }
  
  
  .row-3 .column-1 .block-1.paragraph_block td.pad > div,
  .row-3 .column-1 .block-3.paragraph_block td.pad > div {
  font-size: 13px !important;
  }
  
  
  .row-3 .column-1 .block-2.heading_block h2 {
  text-align: center !important;
  font-size: 24px !important;
  }
  
  
  .row-3 .column-1 .block-2.heading_block td.pad {
  padding: 15px 10px !important;
  }
  }
  </style>
  </head>
  
  
  <body
  style="
  margin: 0;
  background-color: #fff;
  padding: 0;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  "
  >
  <table
  class="nl-container"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #fff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row row-1"
  align="center"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row-content stack"
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #fff;
  border-bottom: 1px solid #e3e6e8;
  border-radius: 4px 4px 0 0;
  color: #000;
  width: 685px;
  margin: 0 auto;
  "
  width="685"
  >
  <tbody>
  <tr>
  <td
  class="column column-1"
  width="100%"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  font-weight: 400;
  text-align: left;
  padding-bottom: 5px;
  padding-top: 5px;
  vertical-align: top;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  "
  >
  <table
  class="image_block block-1"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 15px;
  width: 100%;
  "
  >
  <div
  class="alignment"
  align="left"
  style="line-height: 10px"
  >
  <img
  src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png"
  style="
  display: block;
  height: auto;
  border: 0;
  max-width: 171px;
  width: 100%;
  "
  width="171"
  />
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <table
  class="row row-2"
  align="center"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row-content stack"
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  border-radius: 0;
  color: #000;
  width: 685px;
  margin: 0 auto;
  "
  width="685"
  >
  <tbody>
  <tr>
  <td
  class="column column-1"
  width="100%"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  font-weight: 400;
  text-align: left;
  padding-bottom: 5px;
  padding-top: 5px;
  vertical-align: top;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  "
  >
  <table
  class="heading_block block-1"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  text-align: center;
  width: 100%;
  "
  >
  <h2
  style="
  margin: 0;
  color: #555555;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 120%;
  text-align: left;
  margin-top: 0;
  margin-bottom: 0;
  "
  >
  <span class="tinyMce-placeholder"
  >Dear ${userName},</span
  >
  </h2>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <table
  class="row row-3"
  align="center"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row-content stack"
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  border-radius: 0;
  color: #000;
  width: 685px;
  margin: 0 auto;
  "
  width="685"
  >
  <tbody>
  <tr>
  <td
  class="column column-1"
  width="100%"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  font-weight: 400;
  text-align: left;
  padding-bottom: 5px;
  padding-top: 5px;
  vertical-align: top;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  "
  >
  <table
  class="paragraph_block block-1"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  word-break: break-word;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 20px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  "
  >
  <div
  style="
  color: #000000;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 150%;
  text-align: left;
  mso-line-height-alt: 24px;
  "
  >
  <p style="margin: 0">
  You have just received a payment from ${recipientName}, with the email address ${recipientEmail}.
  </p>
  </div>
  </td>
  </tr>
  </table>
  <table
  class="heading_block block-2"
  width="100%"
  border="0"
  cellpadding="10"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  "
  >
  <tr>
  <td class="pad">
  <h2
  style="
  margin: 0;
  color: #5da76f;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: normal;
  line-height: 150%;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0;
  "
  >
  <span class="tinyMce-placeholder"
  >Payment Received : ${formatUSD(amount)}</span
  >
  </h2>
  </td>
  </tr>
  </table>
  <table
  class="paragraph_block block-3"
  width="100%"
  border="0"
  cellpadding="10"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  word-break: break-word;
  "
  >
  <tr>
  <td class="pad">
  <div
  style="
  color: #101112;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 120%;
  text-align: left;
  mso-line-height-alt: 19.2px;
  "
  >
  <p style="margin: 0">
  Transaction ID:- ${transactionId}<br />Invoice
  ID:- ${invoiceNumber}
  </p>
  </div>
  </td>
  </tr>
  </table>
  <table
  class="paragraph_block block-4"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  word-break: break-word;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 20px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  "
  >
  <div
  style="
  color: #000000;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 150%;
  text-align: left;
  mso-line-height-alt: 24px;
  "
  >
  <p style="margin: 0">
  Thanks and regards,&nbsp;<br />${synccosDetails}
  </p>
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <!-- End -->
  </body>
  </html>
  `
}


export const paymentDoneTemplate = (recipientName, amount, transactionId, invoiceNumber, synccosDetails) => {
  return `<!doctype html>
  <html
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
  >
  <head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--[if mso
  ]><xml
  ><o:OfficeDocumentSettings
  ><o:PixelsPerInch>96</o:PixelsPerInch
  ><o:AllowPNG /></o:OfficeDocumentSettings></xml
  ><![endif]-->
  <style>
  * {
  box-sizing: border-box;
  }
  
  
  body {
  margin: 0;
  padding: 0;
  }
  
  
  a[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: inherit !important;
  }
  
  
  #MessageViewBody a {
  color: inherit;
  text-decoration: none;
  }
  
  
  p {
  line-height: inherit;
  }
  
  
  .desktop_hide,
  .desktop_hide table {
  mso-hide: all;
  display: none;
  max-height: 0px;
  overflow: hidden;
  }
  
  
  .image_block img + div {
  display: none;
  }
  
  
  @media (max-width: 705px) {
  .desktop_hide table.icons-inner {
  display: inline-block !important;
  }
  
  
  .icons-inner {
  text-align: center;
  }
  
  
  .icons-inner td {
  margin: 0 auto;
  }
  
  
  .mobile_hide {
  display: none;
  }
  
  
  .row-content {
  width: 100% !important;
  }
  
  
  .stack .column {
  width: 100%;
  display: block;
  }
  
  
  .mobile_hide {
  min-height: 0;
  max-height: 0;
  max-width: 0;
  overflow: hidden;
  font-size: 0px;
  }
  
  
  .desktop_hide,
  .desktop_hide table {
  display: table !important;
  max-height: none !important;
  }
  
  
  .row-3 .column-1 .block-2.heading_block h2 {
  text-align: center !important;
  font-size: 24px !important;
  }
  
  
  .row-3 .column-1 .block-2.heading_block td.pad {
  padding: 15px 10px !important;
  }
  
  
  .row-3 .column-1 .block-1.paragraph_block td.pad > div,
  .row-3 .column-1 .block-3.paragraph_block td.pad > div {
  font-size: 13px !important;
  }
  
  
  .row-3 .column-1 .block-4.paragraph_block td.pad > div {
  font-size: 12px !important;
  }
  
  
  .row-2 .column-1 .block-1.heading_block h2 {
  font-size: 16px !important;
  }
  }
  </style>
  </head>
  
  
  <body
  style="
  margin: 0;
  background-color: #fff;
  padding: 0;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  "
  >
  <table
  class="nl-container"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #fff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row row-1"
  align="center"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row-content stack"
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #fff;
  border-bottom: 1px solid #e3e6e8;
  border-radius: 4px 4px 0 0;
  color: #000;
  width: 685px;
  margin: 0 auto;
  "
  width="685"
  >
  <tbody>
  <tr>
  <td
  class="column column-1"
  width="100%"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  font-weight: 400;
  text-align: left;
  padding-bottom: 5px;
  padding-top: 5px;
  vertical-align: top;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  "
  >
  <table
  class="image_block block-1"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 15px;
  width: 100%;
  "
  >
  <div
  class="alignment"
  align="left"
  style="line-height: 10px"
  >
  <img
  src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png"
  style="
  display: block;
  height: auto;
  border: 0;
  max-width: 171px;
  width: 100%;
  "
  width="171"
  />
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <table
  class="row row-2"
  align="center"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row-content stack"
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  border-radius: 0;
  color: #000;
  width: 685px;
  margin: 0 auto;
  "
  width="685"
  >
  <tbody>
  <tr>
  <td
  class="column column-1"
  width="100%"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  font-weight: 400;
  text-align: left;
  padding-bottom: 5px;
  padding-top: 5px;
  vertical-align: top;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  "
  >
  <table
  class="heading_block block-1"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  text-align: center;
  width: 100%;
  "
  >
  <h2
  style="
  margin: 0;
  color: #555555;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 120%;
  text-align: left;
  margin-top: 0;
  margin-bottom: 0;
  "
  >
  <span class="tinyMce-placeholder"
  >Dear ${recipientName},</span
  >
  </h2>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <table
  class="row row-3"
  align="center"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  "
  >
  <tbody>
  <tr>
  <td>
  <table
  class="row-content stack"
  align="center"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  background-color: #ffffff;
  border-radius: 0;
  color: #000;
  width: 685px;
  margin: 0 auto;
  "
  width="685"
  >
  <tbody>
  <tr>
  <td
  class="column column-1"
  width="100%"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  font-weight: 400;
  text-align: left;
  padding-bottom: 5px;
  padding-top: 5px;
  vertical-align: top;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  "
  >
  <table
  class="paragraph_block block-1"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  word-break: break-word;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 20px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  "
  >
  <div
  style="
  color: #000000;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 150%;
  text-align: left;
  mso-line-height-alt: 24px;
  "
  >
  <p style="margin: 0">
  Your payment of ${formatUSD(amount)} is
  successfully done.
  </p>
  </div>
  </td>
  </tr>
  </table>
  <table
  class="heading_block block-2"
  width="100%"
  border="0"
  cellpadding="10"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  "
  >
  <tr>
  <td class="pad">
  <h2
  style="
  margin: 0;
  color: #5da76f;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: normal;
  line-height: 150%;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0;
  "
  >
  <span class="tinyMce-placeholder"
  >Payment Sent : ${formatUSD(amount)}</span
  >
  </h2>
  </td>
  </tr>
  </table>
  <table
  class="paragraph_block block-3"
  width="100%"
  border="0"
  cellpadding="10"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  word-break: break-word;
  "
  >
  <tr>
  <td class="pad">
  <div
  style="
  color: #101112;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 120%;
  text-align: left;
  mso-line-height-alt: 19.2px;
  "
  >
  <p style="margin: 0">
  Transaction ID:- ${transactionId}]<br />Invoice
  ID:- ${invoiceNumber}
  </p>
  </div>
  </td>
  </tr>
  </table>
  <table
  class="paragraph_block block-4"
  width="100%"
  border="0"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  word-break: break-word;
  "
  >
  <tr>
  <td
  class="pad"
  style="
  padding-bottom: 20px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  "
  >
  <div
  style="
  color: #000000;
  direction: ltr;
  font-family: 'Open Sans', 'Helvetica Neue',
  Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 150%;
  text-align: left;
  mso-line-height-alt: 24px;
  "
  >
  <p style="margin: 0">
  Thanks and regards,&nbsp;<br />${synccosDetails}
  </p>
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <!-- End -->
  </body>
  </html>
  `
}

export const paymentRequesttemplate = (recipientName, amount, purpose, senderName, senderOrganisation, senderAddress, invoiceNumber, paymentUrl) => {
  return `<!DOCTYPE html>
  <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
  
  
  <head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
  * {
  box-sizing: border-box;
  }
  
  
  body {
  margin: 0;
  padding: 0;
  }
  
  
  a[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: inherit !important;
  }
  
  
  #MessageViewBody a {
  color: inherit;
  text-decoration: none;
  }
  
  
  p {
  line-height: inherit
  }
  
  
  .desktop_hide,
  .desktop_hide table {
  mso-hide: all;
  display: none;
  max-height: 0px;
  overflow: hidden;
  }
  
  
  .image_block img+div {
  display: none;
  }
  
  
  @media (max-width:705px) {
  .desktop_hide table.icons-inner {
  display: inline-block !important;
  }
  
  
  .icons-inner {
  text-align: center;
  }
  
  
  .icons-inner td {
  margin: 0 auto;
  }
  
  
  .mobile_hide {
  display: none;
  }
  
  
  .row-content {
  width: 100% !important;
  }
  
  
  .stack .column {
  width: 100%;
  display: block;
  }
  
  
  .mobile_hide {
  min-height: 0;
  max-height: 0;
  max-width: 0;
  overflow: hidden;
  font-size: 0px;
  }
  
  
  .desktop_hide,
  .desktop_hide table {
  display: table !important;
  max-height: none !important;
  }
  
  
  .row-3 .column-1 .block-2.paragraph_block td.pad>div {
  font-size: 12px !important;
  }
  
  
  .row-3 .column-1 .block-1.paragraph_block td.pad>div {
  font-size: 13px !important;
  }
  
  
  .row-3 .column-1 .block-3.heading_block h1 {
  font-size: 17px !important;
  }
  
  
  .row-2 .column-1 .block-1.heading_block h2 {
  font-size: 16px !important;
  }
  }
  </style>
  </head>
  
  
  <body style="margin: 0; background-color: #fff; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
  <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff;">
  <tbody>
  <tr>
  <td>
  <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
  <tbody>
  <tr>
  <td>
  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-bottom: 1px solid #e3e6e8; border-radius: 4px 4px 0 0; color: #000; width: 685px; margin: 0 auto;" width="685">
  <tbody>
  <tr>
  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
  <td class="pad" style="padding-bottom:15px;padding-left:10px;padding-right:10px;padding-top:15px;width:100%;">
  <div class="alignment" align="left" style="line-height:10px"><img src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png" style="display: block; height: auto; border: 0; max-width: 171px; width: 100%;" width="171"></div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
  <tbody>
  <tr>
  <td>
  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000; width: 685px; margin: 0 auto;" width="685">
  <tbody>
  <tr>
  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
  <table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
  <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:5px;text-align:center;width:100%;">
  <h2 style="margin: 0; color: #555555; direction: ltr; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Dear ${recipientName},</span></h2>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
  <tbody>
  <tr>
  <td>
  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; border-radius: 0; color: #000; width: 685px; margin: 0 auto;" width="685">
  <tbody>
  <tr>
  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
  <table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
  <tr>
  <td class="pad" style="padding-bottom:20px;padding-left:10px;padding-right:10px;padding-top:10px;">
  <div style="color:#000000;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:24px;">
  <p style="margin: 0;">We requested you to make a payment of ${formatUSD(amount)} in the reference of Invoice No. ${invoiceNumber}.<br><br>${purpose}</p>
  </div>
  </td>
  </tr>
  </table>
  <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
  <tr>
  <td class="pad" style="padding-bottom:20px;padding-left:10px;padding-right:10px;padding-top:10px;">
  <div style="color:#000000;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:24px;">
  <p style="margin: 0; margin-bottom: 16px;">Thanks and regards,&nbsp;<br>${senderName}</p>
  <p style="margin: 0;">${senderOrganisation}<br>${senderAddress}</p>
  </div>
  </td>
  </tr>
  </table>
  <table class="heading_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
  <td class="pad">
  <h1 style="margin: 0; color: #555555; direction: ltr; font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 23px; font-weight: 700; letter-spacing: normal; line-height: 150%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Attachments:-</span></h1>
  </td>
  </tr>
  </table>
  <table class="button_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
  <td class="pad">
  <div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:45px;width:100.00px00px;v-text-anchor:middle;" arcsize="23%" stroke="false" fillcolor="#5da76f"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:14px"><![endif]-->
  <div style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#5da76f;border-radius:10px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:10px;padding-bottom:10px;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:14px;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:20px;padding-right:20px;font-size:14px;display:inline-block;letter-spacing:normal;"><a href=${paymentUrl} target="_blank" rel="noreferrer" style="word-break: break-word; line-height: 25.2px;">Click Here to make payment.</a></span></div><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table><!-- End -->
  </body>
  
  
  </html>
  `
}

export const subscriptionPaymentRequesttemplate = (recipientName,amount,paymentUrl,senderName) => {
return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Payment Request</title>
      <style>
          /* Add your custom styles here */
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
          .button {
              background-color: #007bff;
              color: #fff;
              padding: 10px 20px;
              text-decoration: none;
              display: inline-block;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h2>Subscription Payment Request</h2>
          <p>Dear ${recipientName},</p>
          <p>We kindly request payment for your subscription.</p>
          <p>The amount due is ${formatUSD(amount)}.</p>
          <p>Please make the payment <a href="${paymentUrl}" class="button">here</a>.</p>
          <p>Thank you for your prompt attention to this matter.</p>
          <p>Regards,<br>${senderName}</p>
      </div>
  </body>
  </html>`
}

export const subscriptionPaymentReceivedTemplate=(recipientName,amount,senderName)=>{
 return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received Confirmation</title>
    <style>
        /* Add your custom styles here */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Payment Received Confirmation</h2>
        <p>Dear ${recipientName},</p>
        <p>We are writing to confirm that we have received your payment of ${formatUSD(amount)}.</p>
        <p>Thank you for your prompt payment. Your account is now up to date.</p>
        <p>If you have any questions or concerns, please feel free to contact us.</p>
        <p>Thank you for choosing our service.</p>
        <p>Regards,<br>${senderName}</p>
    </div>
</body>
</html>`

}

export const shippingStatusUpdateTemplate = ({
  recipientName,
  provider,
  status,
  trackingNumber,
  serviceName,
  checkNumber,
}) => {
  const providerLabel = provider === 'lob' ? 'LOB Mail' : provider === 'ups' ? 'UPS' : provider === 'fedex' ? 'FedEx' : provider;
  const statusColor = status === 'Mailed' ? '#204464' : status === 'Processing' ? '#EF6C00' : status === 'Error' ? '#f03d3e' : '#058205';
  const statusMessage = {
    Submitted: 'Your check has been submitted for mailing.',
    Processing: 'Your check is currently in transit.',
    Mailed: 'Your check has been delivered.',
    Canceled: 'Your check mailing has been canceled.',
    Error: 'There was an issue with your check mailing. Please contact support.',
  }[status] || `Your check mailing status is: ${status}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shipping Status Update</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f1f5;font-family:Arial,sans-serif;">
  <div style="width:80%;max-width:600px;margin:40px auto;">
    <div style="background:linear-gradient(91.57deg,#84d6a6 5.31%,#4eb7a8 54.78%,#2da4aa 94.92%);padding:30px;text-align:center;">
      <img src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png" alt="Synccos" height="36px" />
    </div>
    <div style="background:#ffffff;padding:40px;">
      <h2 style="color:#181D27;margin-top:0;">Shipping Status Update</h2>
      <p style="color:#444;">Hi ${recipientName || 'there'},</p>
      <p style="color:#444;">${statusMessage}</p>
      <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          ${checkNumber ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Check #</td><td style="padding:6px 0;color:#181D27;font-weight:600;font-size:14px;">${checkNumber}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#888;font-size:14px;">Provider</td><td style="padding:6px 0;color:#181D27;font-weight:600;font-size:14px;">${providerLabel}</td></tr>
          ${serviceName ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Service</td><td style="padding:6px 0;color:#181D27;font-size:14px;">${serviceName}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#888;font-size:14px;">Status</td><td style="padding:6px 0;font-weight:700;font-size:14px;color:${statusColor};">${status}</td></tr>
          ${trackingNumber ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Tracking #</td><td style="padding:6px 0;color:#181D27;font-family:monospace;font-size:13px;">${trackingNumber}</td></tr>` : ''}
        </table>
      </div>
      <p style="color:#888;font-size:12px;">You received this email because you used Synccos Check Writer to mail a check. Log in to your account to view full details.</p>
    </div>
  </div>
</body>
</html>`
}

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const refundReceiptTemplate = ({ recipientName, refundAmount, originalDescription, originalDate, reason }) => {
  const safeName = escapeHtml(recipientName || 'Customer');
  const safeAmount = escapeHtml(formatUSD(refundAmount));
  const safeDescription = escapeHtml(originalDescription || 'N/A');
  const safeDate = escapeHtml(originalDate || 'N/A');
  const safeReason = escapeHtml(reason || 'N/A');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Refund Receipt</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f1f5;font-family:Arial,sans-serif;">
  <div style="width:80%;max-width:600px;margin:40px auto;">
    <div style="background:linear-gradient(91.57deg,#84d6a6 5.31%,#4eb7a8 54.78%,#2da4aa 94.92%);padding:30px;text-align:center;">
      <img src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png" alt="Synccos" height="36px" />
    </div>
    <div style="background:#ffffff;padding:40px;">
      <h2 style="color:#181D27;margin-top:0;">Refund Receipt</h2>
      <p style="color:#444;font-size:16px;line-height:24px;">Dear ${safeName},</p>
      <p style="color:#444;font-size:16px;line-height:24px;">A refund has been processed for your account. Please find the details below:</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:14px;font-weight:600;">Refund Amount</td>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#181D27;font-size:16px;font-weight:700;">${safeAmount}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:14px;font-weight:600;">Original Charge</td>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#444;font-size:14px;">${safeDescription}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:14px;font-weight:600;">Original Date</td>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#444;font-size:14px;">${safeDate}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:14px;font-weight:600;">Reason</td>
          <td style="padding:12px;border-bottom:1px solid #eee;color:#444;font-size:14px;">${safeReason}</td>
        </tr>
      </table>
      <p style="color:#444;font-size:14px;line-height:22px;">The refund may take 5-10 business days to appear on your statement, depending on your bank or card issuer.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
      <p style="color:#888;font-size:12px;">If you have any questions about this refund, please contact us at support@synccos.com.</p>
    </div>
  </div>
</body>
</html>`;
};

export const adminSupportEmailTemplate = (subject, body) => {
  const safeSubject = escapeHtml(subject);
  const safeBody = escapeHtml(body);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f1f5;font-family:Arial,sans-serif;">
  <div style="width:80%;max-width:600px;margin:40px auto;">
    <div style="background:linear-gradient(91.57deg,#84d6a6 5.31%,#4eb7a8 54.78%,#2da4aa 94.92%);padding:30px;text-align:center;">
      <img src="https://d3a5gmleuh5y30.cloudfront.net/appLogo.png" alt="Synccos" height="36px" />
    </div>
    <div style="background:#ffffff;padding:40px;">
      <h2 style="color:#181D27;margin-top:0;">${safeSubject}</h2>
      <div style="color:#444;font-size:16px;line-height:24px;white-space:pre-wrap;">${safeBody}</div>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
      <p style="color:#888;font-size:12px;">This email was sent by the Synccos support team. If you have any questions, please reply to this email or contact us at support@synccos.com.</p>
    </div>
  </div>
</body>
</html>`;
}
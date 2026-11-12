export const verificationEmailTemplate = (
  verificationLink: string,
  lang: "en" | "ar" = "en"
) => {
  const isAr = lang === "ar";
  const title = isAr
    ? "تأكيد بريدك الإلكتروني - Wifey for Lifey"
    : "Please verify Your Email Address";
  const heading = isAr
    ? "يرجى تأكيد بريدك الإلكتروني 💕"
    : "Please verify Your Email Address";
  const bodyText = isAr
    ? "شكراً لانضمامك إلى وايفي فور لايفي! لإتمام إنشاء حسابك، يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني."
    : "Thank you for signing up! To complete your registration, please click the button below to verify your email address.";
  const buttonText = isAr ? "تأكيد البريد الإلكتروني" : "Verify Email";
  const expireText = isAr
    ? "هذا الرابط صالح للاستخدام لمدة 20 دقيقة."
    : "This link will expire in 20 minutes.";
  const dir = isAr ? "rtl" : "ltr";
  const fontFamily = isAr
    ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "Arial, sans-serif";

  return `
    <html lang="${lang}" dir="${dir}">
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: ${fontFamily};
          background-color: #f2f2f2;
          margin: 0;
          padding: 0;
          direction: ${dir};
        }
  
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-top: 40px;
          text-align: center;
        }
  
        h1 {
          color: #d32333;
          text-align: center;
          font-size: 24px;
          margin-top: 20px;
        }
  
        p {
          color: #555555;
          line-height: 1.6;
          font-size: 16px;
        }
  
        .button {
          display: inline-block;
          margin: 20px auto;
          padding: 12px 28px;
          background-color: #d32333;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
        }
  
        .expire-time {
          text-align: center;
          margin-top: 15px;
          color: #888888;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center;">
          <img src="https://www.shopwifeyforlifey.com/logo/WifeyforLifeyPrimaryLogoRed.png" style="display: block; margin: 0 auto; max-width: 130px; height: auto;" width="130" alt="Wifey for Lifey">
        </div>

        <h1>${heading}</h1>
        <p>${bodyText}</p>
        <a href="${verificationLink}" class="button">${buttonText}</a>
        <p class="expire-time">${expireText}</p>
      </div>
    </body>
  </html>
  `;
};
export const verificationEmailTemplate = (verificationLink: string) => {
    return `
          <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          margin: 0;
          padding: 0;
        }
  
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          margin-top: 50px;
        }
  
        h1 {
          color: #333333;
          text-align: center;
        }
  
        p {
          color: #666666;
          line-height: 1.5;
        }
  
        .button {
          display: block;
          margin: 0 auto;
          padding: 10px 20px;
          background-color: #473728;
          color: #ffffff;
          text-decoration: none;
          text-color: #ffffff;
          border-radius: 5px;
          text-align: center; /* Added to center the button */
        }
  
        .expire-time {
          text-align: center;
          margin-top: 10px;
          color: #999999;
        }
  
        .button:hover {
          background-color: #0056b3;
        }
          a.{
         color: #ffffff;
          }
      </style>
    </head>
    <body>
      <div class="container">
 													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 128px;"><img src="https://www.shopwifeyforlifey.com/logo/WifeyforLifeyPrimaryLogoRed.png" style="display: block; height: auto; border: 0; width: 100%;" width="128" alt title height="auto"></div>
																</div>
															</td>
														</tr>
													</table>

        <h1>Please verify Your Email Address</h1>
        <p>
          Thank you for signing up! To complete your registration, please click
          the button below to verify your email address.
        </p>
        <a href=${verificationLink} class="button">Verify Email</a>
        <p class="expire-time">This link will expire in 20 minutes.</p>
      </div>
    </body>
  </html>
  
      `;
  };
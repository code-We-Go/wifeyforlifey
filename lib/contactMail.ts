import nodemailer from 'nodemailer'
export async function sendContactMail({
  to,
  name,
  subject,
  body,
  from
}: {
  to: string;
  name: string;
  subject: string;
  body: string;
  from: string;
}) {
  const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

 const transport = nodemailer.createTransport({
    host: "mail.smtp2go.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  try {
    const testResult = await transport.verify();
    console.log(testResult);
  } catch (error) {
    console.error({ error });
    return;
  }

  try {
    const emailContent = `
<html>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center; vertical-align: middle;">
      <tr>
        <td align="center" valign="middle">
          <div style="padding: 20px; max-width: 600px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
            <p style="font-size: 16px; margin: 0 0 10px;">From: <strong>${from}</strong></p>
            <p style="font-size: 16px; margin: 0 0 10px;">Name: <strong>${name}</strong></p>
            <p style="font-size: 16px; margin: 0;">${body}</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
    const sendResult = await transport.sendMail({
      from: `noreply@shopwifeyforlifey.com`,
      to,
      subject,
      html: emailContent,
      // from: SMTP_EMAIL,
      // to,
      // replyTo:from,
      // sender:name,
      // subject,
      // html: emailContent,
    });
    console.log(sendResult);
  } catch (error) {
    console.log(error);
  }
}

// export function compileWelcomeTemplate(name: string, url: string) {
//   const template = handlebars.compile(welcomeTemplate);
//   const htmlBody = template({
//     name: name,
//     url: url,
//   });
//   return htmlBody;
// }
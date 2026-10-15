export interface AppliancesMasterClassEmailProps {
  clientName?: string;
  orderId?: string;
}

export function getAppliancesMasterClassEmailHtml(props?: AppliancesMasterClassEmailProps) {
  const clientName = props?.clientName ? props.clientName.trim() : "Wifey";
  const orderId = props?.orderId || "";

  // Event details: Friday, October 23, 2026 | 8:00 PM - 10:30 PM Cairo Time
  // In UTC (Cairo GMT+3): 20261023T170000Z / 20261023T193000Z
  const eventTitle = "Appliances Master class - دليلك لاختيار أجهزة بيتك";
  const meetingLink = "https://calendar.app.google/H8pcofFz4EJYNXrQ8";
  const eventDetails = "Appliances Master class with Zeinab Ahmed. Meeting Link: " + meetingLink;
  const eventLocation = meetingLink;

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventTitle
  )}&dates=20261023T170000Z/20261023T193000Z&details=${encodeURIComponent(
    eventDetails
  )}&location=${encodeURIComponent(eventLocation)}`;

  const outlookCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    eventTitle
  )}&startdt=2026-10-23T20:00:00+03:00&enddt=2026-10-23T22:30:00+03:00&body=${encodeURIComponent(
    eventDetails
  )}&location=${encodeURIComponent(eventLocation)}`;

  return `<!doctype html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>تأكيد حجز ورشة أجهزة بيتك - Appliances Master Class</title>
  <style>
    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse !important; border-spacing: 0 !important; }
    img { border: 0; display: block; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: inherit; }
    .email-bg { background-color: #f8f6ff; }
    .body-font { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .button { border-radius: 999px; display: inline-block; font-size: 16px; font-weight: 700; line-height: 20px; padding: 14px 28px; text-align: center; text-decoration: none; }
    @media screen and (max-width: 620px) {
      .outer-pad { padding: 16px 8px !important; }
      .card-pad { padding: 24px 18px !important; }
      .mobile-title { font-size: 26px !important; line-height: 32px !important; }
      .mobile-copy { font-size: 15px !important; line-height: 22px !important; }
      .button-wrap, .button { display: block !important; width: auto !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin:0; padding:0; background-color:#f8f6ff;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    تم تأكيد حجزك في ماستر كلاس الأجهزة مع زينب أحمد | You're booked for Appliances Master Class with Zeinab Ahmed!
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#f8f6ff;">
    <tr>
      <td class="outer-pad" align="center" style="padding:32px 14px;">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:620px;">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 0 0 20px;">
              <img src="https://259071beb2.imgdist.com/pub/bfra/ai5ijq1c/6dz/70v/i4v/Wifey%20for%20Lifey%20Primary%20Logo%20with%20Slogan%20Red.png" style="display:block; height:auto; border:0; width:210px; max-width:100%;" width="210" alt="Wifey for Lifey">
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td class="card-pad" style="padding:36px 36px; background-color:#fbf3e0; border-radius:20px; color:#592a2f; box-shadow:0 6px 20px rgba(0,0,0,0.06);">
              
              <!-- Celebration Header -->
              <div class="body-font mobile-title" style="font-size:30px; line-height:36px; font-weight:800; color:#d32333; text-align:center; margin-bottom:8px;">
                🎉 تم تأكيد حجزك، ${clientName}! 💕
              </div>
              <div class="body-font" style="font-size:18px; line-height:24px; font-weight:700; color:#8b3a49; text-align:center; margin-bottom:16px;">
                You&apos;re Booked! Appliances Master Class 🤍
              </div>

              <div class="body-font mobile-copy" style="font-size:16px; line-height:26px; text-align:center; color:#592a2f; margin-bottom:24px;">
                مبسوطين بوجودك معانا في ورشة <strong>دليلك لاختيار أجهزة بيتك</strong> مع م. <strong>زينب أحمد</strong> استعداداً للبلاك فرايداي. هنساعدك تختاري أجهزة بيتك بثقة وتعرفي إيه الأنسب لاحتياجاتك وميزانيتك!
              </div>

              <!-- Details Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-bottom:24px; background-color:#ffffff; border:1px solid #efc9cf; border-radius:14px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px; color:#592a2f; text-align:right;">
                      <tr>
                        <td width="35%" style="padding:8px 0; color:#d32333; font-weight:700;">الورشة / Session:</td>
                        <td style="padding:8px 0; font-weight:600;">Appliances Master class - دليلك لاختيار أجهزة بيتك</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#d32333; font-weight:700;">المحاضرة / Expert:</td>
                        <td style="padding:8px 0; font-weight:600;">زينب أحمد (Zeinab Ahmed)</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#d32333; font-weight:700;">الميعاد / Date:</td>
                        <td style="padding:8px 0; font-weight:700; color:#d32333;">الجمعة ٢٣ أكتوبر ٢٠٢٦ (Friday, Oct 23, 2026)</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#d32333; font-weight:700;">الوقت / Time:</td>
                        <td style="padding:8px 0; font-weight:600;">من ٨:٠٠ إلى ١٠:٣٠ مساءً بتوقيت القاهرة (8:00 - 10:30 PM Cairo)</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#d32333; font-weight:700;">المكان / Location:</td>
                        <td style="padding:8px 0; font-weight:600;">💻 أونلاين عبر Google Meet</td>
                      </tr>
                      ${orderId ? `
                      <tr>
                        <td style="padding:8px 0; color:#d32333; font-weight:700;">رقم الحجز / Order ID:</td>
                        <td style="padding:8px 0; font-family:monospace; font-size:13px;">${orderId}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Join Meeting Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a class="button" href="${meetingLink}" target="_blank" style="background-color:#d32333; color:#ffffff !important; display:inline-block; font-size:17px; padding:15px 32px; box-shadow:0 4px 12px rgba(211,35,51,0.3);">
                      🔗 اضغطي هنا للدخول على رابط السيشن (Google Meet)
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Add to Calendar Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#fce2e8; border-radius:14px; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 20px; text-align:center;">
                    <div style="font-size:16px; font-weight:700; color:#d32333; margin-bottom:10px;">
                      📅 متفوتيش الميعاد — ضيفي السيشن للتقويم بتاعك:
                    </div>
                    <div>
                      <a class="button" href="${googleCalUrl}" target="_blank" style="background-color:#4285F4; color:#ffffff !important; font-size:13px; padding:10px 18px; margin:4px; display:inline-block;">
                        📅 Google Calendar
                      </a>
                      <a class="button" href="${outlookCalUrl}" target="_blank" style="background-color:#0078D4; color:#ffffff !important; font-size:13px; padding:10px 18px; margin:4px; display:inline-block;">
                        📅 Outlook Calendar
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Agenda / What will happen -->
              <div style="background-color:#ffffff; border-radius:14px; border:1px solid #efc9cf; padding:20px 22px; margin-bottom:24px; text-align:right;">
                <div style="font-size:17px; font-weight:700; color:#d32333; margin-bottom:12px;">
                  ✨ هنعمل إيه في السيشن؟
                </div>
                <ul style="margin:0; padding-right:20px; font-size:15px; line-height:1.7; color:#592a2f;">
                  <li style="margin-bottom:8px;"><strong>شرح كل جهاز بالتفصيل:</strong> والفرق بين أنواعه ومميزات وعيوب كل نوع (مثل الفرق بين أنواع التلاجات، الفريزر العلوي والسفلي، الغسالات، البوتاجازات).</li>
                  <li style="margin-bottom:8px;"><strong>ترشيحات أفضل البراندات:</strong> لكل جهاز في ميزانيات وفئات سعرية مختلفة، وأهم النقاط اللي لازم تركزي عليها قبل الشراء في موسم العروض.</li>
                  <li style="margin-bottom:8px;"><strong>فقرة الأسئلة المباشرة:</strong> هنخصص آخر ١٥ دقيقة لأسئلتكم، ولو اشتريتي أي جهاز وحابة تعرفي رأي زينب فيه تقدري تسأليها مباشرة.</li>
                </ul>
              </div>

              <!-- Important 1:1 Note & Direct Link -->
              <div style="background-color:#fff6f7; border:2px dashed #d32333; border-radius:14px; padding:20px 22px; text-align:center; margin-bottom:24px;">
                <div style="font-size:16px; font-weight:700; color:#d32333; margin-bottom:8px;">
                  💡 محتاجة استشارة خاصة ومخصصة 1:1 لميزانيتك وبيتك بالتفصيل؟
                </div>
                <p style="font-size:14px; line-height:1.6; color:#592a2f; margin:0 0 14px;">
                  الورشة الجماعية بتقدم شرح وترشيحات عامة. لو حابة ترشيحات تفصيلية تناسب مقاسات شقتك وميزانيتك بدقة، تقدري تحجزي سيشن فردية 1:1 مع م. زينب أحمد من قسم جلسات الخبراء!
                </p>
                <a class="button" href="https://shopwifeyforlifey.com/shop?tab=sessions" target="_blank" style="background-color:#592a2f; color:#ffffff !important; font-size:14px; padding:11px 24px; display:inline-block;">
                  👉 تصفحي جلسات الشركاء 1:1 (/shop partners sessions)
                </a>
              </div>

              <!-- Footer Contact -->
              <div style="text-align:center; font-size:13px; line-height:1.6; color:#7c565a; border-top:1px solid #efc9cf; padding-top:20px;">
                لو عندك أي استفسار، متتردديش تتواصلي معانا عبر الإيميل:<br>
                <a href="mailto:orders@shopwifeyforlifey.com" style="color:#d32333; font-weight:700; text-decoration:underline;">orders@shopwifeyforlifey.com</a>
                <div style="margin-top:12px; font-weight:700; color:#d32333; font-size:15px;">
                  Wifey for Lifey 💕
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer Copyright -->
          <tr>
            <td align="center" style="padding:18px 20px 0; color:#8b3a49; font-size:12px; line-height:18px;">
              وصلك هذا البريد لتأكيد حجزك في ماستر كلاس الأجهزة عبر منصة Wifey for Lifey.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

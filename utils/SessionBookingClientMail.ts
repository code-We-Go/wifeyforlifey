export interface SessionBookingClientMailProps {
  clientFirstName: string;
  clientLastName: string;
  sessionTitle: string;
  partnerName: string;
  sessionType?: "one-to-one" | "webinar";
  partnerWhatsApp?: string;
  meetingLink?: string;
  finalPrice?: number;
  orderId?: string;
  lang?: "en" | "ar";
}

export function SessionBookingClientMail({
  clientFirstName,
  clientLastName,
  sessionTitle,
  partnerName,
  sessionType = "one-to-one",
  partnerWhatsApp,
  meetingLink,
  finalPrice,
  orderId,
  lang = "en",
}: SessionBookingClientMailProps) {
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const textAlign = isAr ? "right" : "left";
  const fontFamily = isAr
    ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const clientName = `${clientFirstName} ${clientLastName}`.trim();
  const isWebinar = sessionType === "webinar";
  const cleanPhone = partnerWhatsApp
    ? String(partnerWhatsApp).replace(/[^0-9]/g, "")
    : "";
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

  const calDetails = `Join online webinar: ${sessionTitle}\nMeeting Link: ${meetingLink || "Online"}`;
  const calLocation = meetingLink || "Online";
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    sessionTitle
  )}&details=${encodeURIComponent(calDetails)}&location=${encodeURIComponent(calLocation)}`;
  const outlookCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    sessionTitle
  )}&body=${encodeURIComponent(calDetails)}&location=${encodeURIComponent(calLocation)}`;

  const pageTitle = isAr ? "تأكيد حجز جلستك" : "Your Session Booking Confirmation";
  const bookedHeader = isAr
    ? `تم تأكيد حجزك، يا ${clientFirstName}! 💕`
    : `YOU’RE BOOKED, ${clientFirstName.toUpperCase()}! 💕`;
  const bookedSubtitle = isAr
    ? "تم تأكيد حجز جلستك بنجاح. إليكِ تفاصيل الحجز:"
    : "Your consultation session has been successfully confirmed. Here are the details of your booking:";
  const lblSession = isAr ? "الجلسة:" : "Session:";
  const lblExpert = isAr ? "الخبير:" : "Expert:";
  const lblAmount = isAr ? "المبلغ:" : "Amount:";
  const lblOrderId = isAr ? "رقم الطلب:" : "Order ID:";
  const freeText = isAr ? "مجاناً" : "FREE";

  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${lang}" dir="${dir}">
<head>
	<title>${pageTitle}</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		* {
			box-sizing: border-box;
		}
		body {
			margin: 0;
			padding: 0;
			background-color: #f8f6ff;
			-webkit-text-size-adjust: none;
			text-size-adjust: none;
			font-family: ${fontFamily};
		}
		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}
		.button {
			display: inline-block;
			background-color: #d32333;
			color: #ffffff !important;
			font-size: 15px;
			font-weight: 700;
			text-decoration: none;
			padding: 14px 28px;
			border-radius: 999px;
			text-align: center;
			letter-spacing: 0.3px;
		}
		.wa-button {
			display: inline-block;
			background-color: #25D366;
			color: #ffffff !important;
			font-size: 15px;
			font-weight: 700;
			text-decoration: none;
			padding: 14px 28px;
			border-radius: 999px;
			text-align: center;
			letter-spacing: 0.3px;
		}
		@media (max-width:700px) {
			.row-content {
				width: 100% !important;
			}
			.mobile-pad {
				padding-left: 20px !important;
				padding-right: 20px !important;
			}
		}
	</style>
</head>
<body style="background-color: #f8f6ff; margin: 0; padding: 0;">
	<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8f6ff;">
		<tbody>
			<tr>
				<td align="center" style="padding: 24px 12px;">
					<!-- Main Container -->
					<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fbf3e0; width: 640px; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
						<tbody>
							<!-- Logo Header -->
							<tr>
								<td align="center" style="padding: 32px 32px 20px; background-color: #fbf3e0;">
									<img src="https://259071beb2.imgdist.com/pub/bfra/ai5ijq1c/6dz/70v/i4v/Wifey%20for%20Lifey%20Primary%20Logo%20with%20Slogan%20Red.png" style="display: block; height: auto; border: 0; width: 220px; max-width: 100%;" width="220" alt="Wifey for Lifey">
								</td>
							</tr>

							<!-- Banner Image -->
							<tr>
								<td align="center" style="padding: 0 32px 20px;">
									<img src="https://259071beb2.imgdist.com/pub/bfra/ai5ijq1c/o7k/fc0/lq1/Brid%20and%20Bridesmaids.png" style="display: block; height: auto; border: 0; width: 100%; max-width: 576px; border-radius: 12px;" alt="Session Confirmed">
								</td>
							</tr>

							<!-- Content Body -->
							<tr>
								<td class="mobile-pad" style="padding: 10px 40px 36px; color: #592a2f;">
									<h2 style="margin: 0 0 12px; color: #d32333; font-size: 26px; font-weight: 700; text-align: center;">
										${bookedHeader}
									</h2>
									<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; text-align: center; color: #592a2f;">
										${bookedSubtitle}
									</p>

									<!-- Details Box -->
									<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border: 1px solid #efc9cf; border-radius: 14px; margin-bottom: 24px;">
										<tbody>
											<tr>
												<td style="padding: 20px 24px;">
													<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="font-size: 15px; color: #592a2f; direction: ${dir}; text-align: ${textAlign};">
														<tr>
															<td width="35%" style="padding: 8px 0; color: #d32333; font-weight: 700;">${lblSession}</td>
															<td style="padding: 8px 0; font-weight: 600;">${sessionTitle}</td>
														</tr>
														<tr>
															<td style="padding: 8px 0; color: #d32333; font-weight: 700;">${lblExpert}</td>
															<td style="padding: 8px 0; font-weight: 600;">${partnerName}</td>
														</tr>
														${
                              finalPrice !== undefined && finalPrice !== null
                                ? `<tr>
															<td style="padding: 8px 0; color: #d32333; font-weight: 700;">${lblAmount}</td>
															<td style="padding: 8px 0; font-weight: 600;">${
                                finalPrice === 0 ? freeText : (isAr ? `${finalPrice} ج.م` : `EGP ${finalPrice}`)
                              }</td>
														</tr>`
                                : ""
                            }
														${
                              orderId
                                ? `<tr>
															<td style="padding: 8px 0; color: #d32333; font-weight: 700;">${lblOrderId}</td>
															<td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${orderId}</td>
														</tr>`
                                : ""
                            }
													</table>
												</td>
											</tr>
										</tbody>
									</table>

									<!-- Next Steps & Action Buttons -->
									<div style="background-color: #fce2e8; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
										${
                      isWebinar
                        ? `
										<h4 style="margin: 0 0 8px; color: #d32333; font-size: 18px; font-weight: 700;">
											${isAr ? "رابط ورشة العمل والتقويم 💻" : "Webinar Access & Calendar 💻"}
										</h4>
										<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #592a2f;">
											${isAr ? "هذه ورشة عمل تفاعلية أونلاين. لستِ بحاجة للتواصل مع الخبير عبر واتساب، فقط انضمي مباشرة عبر الرابط بالأسفل في الموعد المحدد." : "This is a group webinar session. You do not need to contact the expert on WhatsApp. Simply join via the session link below at the scheduled time."}
										</p>
										${
                      meetingLink
                        ? `<div style="margin-top: 12px; margin-bottom: 16px;">
											<a class="button" href="${meetingLink}" target="_blank" style="background-color: #d32333; color: #ffffff; display: inline-block;">
												${isAr ? "🔗 رابط الانضمام للورشة" : "🔗 Join Webinar Link"}
											</a>
										</div>`
                        : ""
                    }
										<div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #efc9cf;">
											<p style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #592a2f;">
												${isAr ? "📅 لا تفوتي الموعد — أضيفيه إلى تقويمك:" : "📅 Don't miss it — Add to your Calendar:"}
											</p>
											<div style="display: inline-block; margin: 4px;">
												<a class="button" href="${googleCalUrl}" target="_blank" style="background-color: #4285F4; color: #ffffff; font-size: 13px; padding: 10px 20px; display: inline-block;">
													📅 Google Calendar
												</a>
											</div>
											<div style="display: inline-block; margin: 4px;">
												<a class="button" href="${outlookCalUrl}" target="_blank" style="background-color: #0078D4; color: #ffffff; font-size: 13px; padding: 10px 20px; display: inline-block;">
													📅 Outlook Calendar
												</a>
											</div>
										</div>
										`
                        : `
										<h4 style="margin: 0 0 8px; color: #d32333; font-size: 18px; font-weight: 700;">
											${isAr ? "ما هي الخطوة التالية؟ 💬" : "What Happens Next? 💬"}
										</h4>
										<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #592a2f;">
											${isAr ? `يمكنكِ التواصل مع <strong>${partnerName}</strong> مباشرة عبر واتساب لتنسيق وتحديد موعد جلستكِ، أو سيتواصلون معكِ قريباً.` : `You can reach out to <strong>${partnerName}</strong> directly on WhatsApp to coordinate the date and time of your session, or they will contact you shortly.`}
										</p>
										${
                      waUrl
                        ? `<div style="margin-top: 12px;">
											<a class="wa-button" href="${waUrl}" target="_blank" style="background-color: #25D366; color: #ffffff; display: inline-block;">
												${isAr ? `📲 تواصلي مع ${partnerName} عبر واتساب` : `📲 Message ${partnerName} on WhatsApp`}
											</a>
										</div>`
                        : ""
                    }
										${
                      meetingLink
                        ? `<div style="margin-top: 12px;">
											<a class="button" href="${meetingLink}" target="_blank" style="background-color: #d32333; color: #ffffff; display: inline-block;">
												${isAr ? "🔗 رابط الجلسة" : "🔗 Access Session Link"}
											</a>
										</div>`
                        : ""
                    }
										`
                    }
									</div>

									<p style="margin: 0; font-size: 13px; line-height: 1.5; text-align: center; color: #592a2f; opacity: 0.8;">
										${isAr ? "لديكِ أي سؤال أو استفسار؟ تواصلي معنا عبر" : "Have questions? Feel free to reach out to us at"} <a href="mailto:orders@shopwifeyforlifey.com" style="color: #d32333; font-weight: 600; text-decoration: underline;">orders@shopwifeyforlifey.com</a>.
									</p>
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
}

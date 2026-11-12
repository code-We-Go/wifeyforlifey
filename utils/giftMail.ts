import { CartItem } from "@/app/interfaces/interfaces";

export function giftMail(
  subscriptionID: string,
  cart?: CartItem[],
  lang: "en" | "ar" = "en"
) {
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const textAlign = isAr ? "right" : "left";
  const fontFamily = isAr
    ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "Helvetica Neue, Helvetica, Arial, sans-serif";

  const greeting = isAr ? "هاي يا جميلة، 💖" : "Hi Gorgeous, 💖<br>";
  const p1 = isAr
    ? "يا بخت صاحبتك بيكي! رسمياً هي أسعد عروسة إن عندها حد زيك في ضهرها خلال رحلة فرحها! 🥹✨ إنتِ مش بس بتقدمي لها هدية… إنتِ بتهديها حب، دعم، وراحة بال في أكتر وقت هي محتاجاهم فيه. مبسوطين جداً إنك في حياتها — ودلوقتي، إحنا كمان معاها! 🎀"
    : "Omg — your bestie is officially the luckiest bride ever to have someone like you in her corner during her bridal era! 🥹✨ You’re not just giving her a gift… you’re giving her love, care, and support when she needs it the most. We’re so glad she has YOU — and now, she’s got US too! 🎀";
  const p2 = isAr
    ? "مش هنتواصل مع عروستك الجميلة خالص لحد ما تدّينا إشارة (عبر انستجرام @wifeyforlifey.community) إنك عملتي المفاجأة ليها. عشان اللحظة تفضل ساحرة ومميزة زي ما خططتي لها. 💌"
    : "We’ll hold off on reaching out to your beautiful bride until you let us know (through Instagram @wifeyforlifey.community) that you’ve given her the surprise. That way, the moment stays as magical as you want it to be. 💌";
  const trackingText = isAr
    ? `ده رابط تتبع شحن بلانر Gehaz Bestie:<br>👈 <a href="https://www.shopwifeyforlifey.com/track-order?subscriptionId=${subscriptionID}" style="color: #d32333; text-decoration: underline; font-weight: bold;">تتبعي البلانر</a>`
    : `Here's the link to track her Gehaz Bestie Planner shipment:<br>👉 <a href="https://www.shopwifeyforlifey.com/track-order?subscriptionId=${subscriptionID}" style="color: #d32333; text-decoration: underline; font-weight: bold;">Track My Planner</a>`;
  const bundledTitle = isAr
    ? "المنتجات المشمولة في هديتك:"
    : "Bundled Items included in your gift:";
  const p3 = isAr
    ? "من كل قلوبنا — شكراً لثقتك فينا عشان نكون جزء من رحلتها. سوا، هنخلي رحلة فرحها ذكرى ما تتنسيش. 💍💗"
    : "From the bottom of our hearts — thank you for trusting us to be part of her journey. Together, we’ll make her bridal era unforgettable. 💍💗";
  const signoff = isAr
    ? "بكل الحب،<br>فريق Wifey for Lifey ✨"
    : "With love,<br>The Wifey for Lifey Team✨";

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${lang}" dir="${dir}">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
			font-family: ${fontFamily};
		}<!--[if mso]>
<xml><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:DontUseAdvancedTypographyReadingMail/></w:WordDocument>
<o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml>
<![endif]--><!--[if !mso]><!--><!--<![endif]-->
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

		sup,
		sub {
			font-size: 75%;
			line-height: 0;
		}

		@media (max-width:700px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.image_block div.fullWidth {
				max-width: 100% !important;
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

			.row-3 .column-1 .block-1.heading_block h3 {
				text-align: left !important;
			}

			.row-3 .column-1 .block-1.heading_block h3 {
				font-size: 20px !important;
			}

			.row-3 .column-1 .block-2.paragraph_block td.pad>div {
				text-align: left !important;
				font-size: 14px !important;
			}

			.row-3 .column-1 {
				padding: 0 24px 48px !important;
			}
		}
	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>

<body class="body" style="background-color: #f8f6ff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8f6ff; background-image: none; background-position: top left; background-size: auto; background-repeat: no-repeat;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbf3e0; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 32px; padding-left: 48px; padding-right: 48px; padding-top: 32px; vertical-align: top;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center">
																	<div style="max-width: 584px;"><img src="https://259071beb2.imgdist.com/pub/bfra/ai5ijq1c/6dz/70v/i4v/Wifey%20for%20Lifey%20Primary%20Logo%20with%20Slogan%20Red.png" style="display: block; height: auto; border: 0; width: 100%;" width="584" alt title height="auto"></div>
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
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbf3e0; border-radius: 0; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center">
																	<div class="fullWidth" style="max-width: 680px;"><img src="https://259071beb2.imgdist.com/pub/bfra/ai5ijq1c/o7k/fc0/lq1/Brid%20and%20Bridesmaids.png" style="display: block; height: auto; border: 0; width: 100%;" width="680" alt="An open email illustration" title="An open email illustration" height="auto"></div>
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
					<table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fbf3e0; border-radius: 0; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-bottom: 48px; padding-left: 48px; padding-right: 48px; vertical-align: top;">
													<table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding-top:12px;text-align:${textAlign};width:100%;">
																<h3 style="margin: 0; color: #d32333; direction: ${dir}; font-family: ${fontFamily}; font-size: 24px; font-weight: 700; letter-spacing: normal; line-height: 1.3; text-align: ${textAlign}; margin-top: 0; margin-bottom: 0;">${greeting}</h3>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-top:10px;">
																<div style="color:#d32333;direction:${dir};font-family:${fontFamily};font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.5;text-align:${textAlign};">
																	<p style="margin: 0;">${p1}</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#d32333;direction:${dir};font-family:${fontFamily};font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.5;text-align:${textAlign};">
																	<p style="margin: 0;">${p2}</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#d32333;direction:${dir};font-family:${fontFamily};font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.5;text-align:${textAlign};">
																	<p style="margin: 0;">${trackingText}</p>
																	${
																		cart && cart.length > 0
																			? `<p style="margin: 0; margin-top: 10px;"><strong>${bundledTitle}</strong></p>
																				 <ul style="margin: 0; padding-${isAr ? "right" : "left"}: 20px;">
																					 ${cart
																							.map(
																								(item) =>
																									`<li>${item.productName} x ${item.quantity} ${
																										item.variant
																											? `(${item.variant.name}${
																													item.attributes?.name
																														? `: ${item.attributes.name}`
																														: ""
																												})`
																											: ""
																									}</li>`
																							)
																							.join("")}
																				 </ul>`
																			: ""
																	}
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#d32333;direction:${dir};font-family:${fontFamily};font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.5;text-align:${textAlign};">
																	<p style="margin: 0;">${p3}</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#d32333;direction:${dir};font-family:${fontFamily};font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.5;text-align:${textAlign};">
																	<p style="margin: 0;">${signoff}</p>
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
					<table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; border-radius: 0; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top;">
													<table class="empty_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div></div>
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

</html>`;
}

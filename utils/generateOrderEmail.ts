export function generateEmailBody(
	items: any[],
	firstName: string,
	lastName: string,
	phone: string,
	email: string,
	total: number,
	subTotal: number,
	shipping: number,
	currency: string,
	address: string,
	orderNumber: string,
	paymentMethod: string,
	country: string,
	state: string,
	city: string,
	postalZip: string,
	appartment: string,
	lang: 'en' | 'ar' = 'en'
) {
	const isAr = lang === 'ar';
	const dir = isAr ? 'rtl' : 'ltr';
	const textAlign = isAr ? 'right' : 'left';
	const oppositeAlign = isAr ? 'left' : 'right';
	const fontFamily = isAr
		? "'Cairo', 'Tajawal', 'Montserrat', Trebuchet MS, Lucida Grande, sans-serif"
		: "'Montserrat', Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif";

	const t = isAr
		? {
				thankYou: 'شكراً لطلبكِ!',
				thankYouDesc: 'شكراً لاختياركِ Wifey For Lifey! نقدّر ثقتكِ الغالية بمنتجاتنا ويسعدنا دائماً مرافقتكِ في هذه الرحلة الجميلة.',
				personalDetails: 'البيانات الشخصية',
				name: 'الاسم',
				email: 'البريد الإلكتروني',
				phone: 'رقم الهاتف',
				orderNumber: 'رقم الطلب',
				productsOrdered: 'المنتجات المطلوبة',
				quantity: 'الكمية',
				orderDetails: 'تفاصيل الطلب',
				subtotal: 'المجموع الفرعي',
				shipping: 'الشحن',
				total: 'الإجمالي',
				trackOrder: 'تتبعي طلبكِ',
				trackDesc: 'يمكنكِ متابعة حالة شحنتكِ وطلبكِ في أي وقت بالضغط على الزر أدناه:',
				trackButton: 'تتبعي طلبكِ الآن 📦',
				shippingAddress: 'عنوان الشحن',
				apartment: 'رقم الشقة / الدور',
				postalZip: 'الرمز البريدي',
		  }
		: {
				thankYou: 'Thank you for the order',
				thankYouDesc: 'Thank you for choosing Wifey For Lifey! We sincerely appreciate your trust in our products.',
				personalDetails: 'PERSONAL DETAILS',
				name: 'name',
				email: 'email',
				phone: 'phone',
				orderNumber: 'ORDER NUMBER',
				productsOrdered: 'PRODUCTS ORDERED',
				quantity: 'Quantity',
				orderDetails: 'ORDER DETAILS',
				subtotal: 'Subtotal',
				shipping: 'Shipping',
				total: 'Total',
				trackOrder: 'TRACK YOUR ORDER',
				trackDesc: 'You can track your order status anytime by clicking the button below:',
				trackButton: 'Track Your Order',
				shippingAddress: 'SHIPPING ADDRESS',
				apartment: 'apartment',
				postalZip: 'zip/postal',
		  };

	let productsHTML = items
		.map(
			(item) => `
      <table class="row row-8" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; padding-bottom: 20px; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-${isAr ? 'right' : 'left'}: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="${textAlign}" style="line-height:10px">
																	<div style="max-width: 260px;"><img src="${item.imageUrl || ''}" style="display: block; height: auto; border: 0; width: 100%; border-radius: 8px;" width="260" alt="${item.productName || 'Product'}" title="${item.productName || 'Product'}" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-2" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-left: 30px; padding-right: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block desktop_hide block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; mso-hide: all; display: none; max-height: 0; overflow: hidden;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; mso-hide: all; display: none; max-height: 0; overflow: hidden;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px solid #BBBBBB;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#555555;font-family:${fontFamily};font-size:18px;line-height:150%;text-align:${textAlign};mso-line-height-alt:27px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${item.productName || ''} <br>${item.price} ${currency}</strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-top:16px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:14px;line-height:150%;text-align:${textAlign};mso-line-height-alt:21px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #808389;">${t.quantity}: ${item.quantity}</span></p>
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
    `
		)
		.join('');

	return `
 <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${lang}" dir="${dir}">

<head>
	<title>${t.thankYou}</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
			direction: ${dir};
			text-align: ${textAlign};
			font-family: ${fontFamily};
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

		@media (max-width:660px) {
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
		}
	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>

<body class="body" style="background-color: #f8f8f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none; direction: ${dir};">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8f8f9;" dir="${dir}">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1aa19c;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; background-color: #1aa19c; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 4px solid #1AA19C;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
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
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; color: #000000; background-color: #fff; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;padding-top:20px;">
																<div class="alignment" align="center" style="line-height:10px">
																	<div style="max-width: 140px;"><img src="https://www.shopwifeyforlifey.com/logo/WifeyforLifeyPrimaryLogoRed.png" style="display: block; height: auto; border: 0; width: 100%;" width="140" alt="Wifey for Lifey" title="Wifey for Lifey" height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:15px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:28px;line-height:130%;text-align:center;mso-line-height-alt:36px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${t.thankYou}</strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:15px;padding-left:40px;padding-right:40px;padding-top:5px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:15px;line-height:160%;text-align:center;mso-line-height-alt:24px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #666e7a;">${t.thankYouDesc}</span></p>
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; background-color: #f8f8f9; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 4px solid #D32333;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
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
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-left: 30px; padding-right: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-top:30px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:12px;line-height:150%;text-align:${textAlign};mso-line-height-alt:18px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #aaacb0;"><strong><span style="word-break: break-word;">${t.personalDetails}</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:13px;line-height:180%;text-align:${textAlign};mso-line-height-alt:23.4px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${t.name}:</strong> ${firstName} ${lastName}</span></p>
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${t.email}:</strong> ${email}</span></p>
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${t.phone}:</strong> ${phone}</span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #F0F0F0;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
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
					<table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-left: 30px; padding-right: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-top:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:12px;line-height:150%;text-align:${textAlign};mso-line-height-alt:18px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #aaacb0;"><strong><span style="word-break: break-word;">${t.orderNumber}</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:20px;line-height:150%;text-align:${textAlign};mso-line-height-alt:30px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a; font-family: monospace;"><strong>${orderNumber}</strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #F0F0F0;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:20px;padding-top:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:12px;line-height:150%;text-align:${textAlign};mso-line-height-alt:18px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #aaacb0;"><strong><span style="word-break: break-word;">${t.productsOrdered} (${items.length})</span></strong></span></p>
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
	${productsHTML}
					<table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0" cellpadding="12" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px solid #BBBBBB;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
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
					
					<table class="row row-8" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-left: 30px; padding-right: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:15px;padding-top:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:12px;line-height:150%;text-align:${textAlign};mso-line-height-alt:18px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #aaacb0;"><strong><span style="word-break: break-word;">${t.orderDetails}</span></strong></span></p>
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
					<table class="row row-9" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="60%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-${isAr ? 'right' : 'left'}: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#555555;font-family:${fontFamily};font-size:13px;line-height:180%;text-align:${textAlign};mso-line-height-alt:23.4px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${t.subtotal}</span></p>
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${t.shipping}</span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-top:15px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:18px;line-height:180%;text-align:${textAlign};mso-line-height-alt:32px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word;"><strong><span style="word-break: break-word; color: #2b303a;">${t.total}</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-2" width="40%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${oppositeAlign}; padding-${isAr ? 'left' : 'right'}: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#555555;font-family:${fontFamily};font-size:13px;line-height:180%;text-align:${oppositeAlign}; white-space: nowrap;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${subTotal} ${currency}</span></p>
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${shipping} ${currency}</span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-top:15px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:18px;line-height:180%;text-align:${oppositeAlign};mso-line-height-alt:32px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word;"><strong><span style="word-break: break-word; color: #D32333;">${total} ${currency}</span></strong></span></p>
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
					<table class="row row-track" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-left: 30px; padding-right: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding-top:25px;">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #F0F0F0;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-top:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:12px;line-height:150%;text-align:${textAlign};mso-line-height-alt:18px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #aaacb0;"><strong><span style="word-break: break-word;">${t.trackOrder}</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#555555;font-family:${fontFamily};font-size:13px;line-height:180%;text-align:${textAlign};mso-line-height-alt:23.4px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${t.trackDesc}</span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="button_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding-bottom:30px;padding-top:15px;text-align:${textAlign};">
																<div class="alignment" align="${textAlign}"><a href="https://www.shopwifeyforlifey.com/track-order?orderId=${orderNumber}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#D32333;border-radius:6px;width:auto;padding-top:10px;padding-bottom:10px;font-family:${fontFamily};font-size:15px;font-weight:600;text-align:center;word-break:keep-all;"><span style="padding-left:24px;padding-right:24px;display:inline-block;letter-spacing:normal;">${t.trackButton}</span></a></div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #F0F0F0;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
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
					<table class="row row-10" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: ${textAlign}; padding-left: 30px; padding-right: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:15px;padding-top:25px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:12px;line-height:150%;text-align:${textAlign};mso-line-height-alt:18px;">
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #aaacb0;"><strong><span style="word-break: break-word;">${t.shippingAddress}</span></strong></span></p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:30px;">
																<div style="color:#555555;font-family:${fontFamily};font-size:13px;line-height:180%;text-align:${textAlign};mso-line-height-alt:23.4px;">
																	${appartment ? `<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${t.apartment}:</strong> ${appartment}</span></p>` : ''}
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${address}</span></p>
																	<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">${country}${state ? `, ${state}` : ''}${city ? `, ${city}` : ''}</span></p>
																	${postalZip ? `<p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${t.postalZip}:</strong> ${postalZip}</span></p>` : ''}
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
</body>

</html>
    `;
}

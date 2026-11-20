/**
 * Wedding Timeline PDF Export Utility
 * Generates a branded, publication-ready A4 PDF document matching the original Wifey for Lifey design,
 * with full Arabic & English typography, RTL/LTR layout, table pills, tips, watermark, and dynamic pagination.
 */

import { formatTimelineTimeLabel } from "./wedding-timeline-localization";

export interface TimelineExportEvent {
  id: string;
  timeLabel?: string;
  duration?: number;
  brideActivity: string;
  groomActivity: string;
  bridesmaidsActivity: string;
  groomsmenActivity: string;
  isBreak?: boolean;
}

export interface ExportTimelinePDFOptions {
  events: TimelineExportEvent[];
  locale: string;
  brideFirstName?: string;
  groomFirstName?: string;
}

const escapeHtml = (str: string) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

export async function exportTimelinePDF({
  events,
  locale,
  brideFirstName,
  groomFirstName,
}: ExportTimelinePDFOptions): Promise<void> {
  const isArabic = locale === "ar";

  // Preload brand assets
  const logoUrl = "/logo/Wifey for Lifey Primary Logo with Slogan Red.png";
  const subHeaderUrl = "/timeline/timelineSubHeader.jpg";

  await Promise.all([preloadImage(logoUrl), preloadImage(subHeaderUrl)]);

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // Ignore font readiness errors
    }
  }

  // Headers & Tips localized
  const headers = isArabic
    ? ["الوقت", "العروسة", "العريس", "وصيفات العروس", "أصدقاء العريس"]
    : ["TIME", "BRIDE", "GROOM", "BRIDESMAIDS", "GROOMSMEN"];

  const tipsEnglish = [
    "The photographer and videographer should arrive during the last 30-40 minutes of the makeup session.",
    "If a photo booth, audio booth, or live painter is hired, it's recommended that they arrive and complete setup 1-2 hours before the wedding begins.",
    "Zaffa is recommended to start after Katb El Ketab.",
    "If additional entertainers are hired (tabla show, violinist, etc.), we recommend that they begin after dinner.",
    `for bridesmaids coming to photoshoot but getting ready at home : 
- Consider 90 mins for hair styling at the salon. 
- 60 mins for makeup and dress. 
- Please leave early to arrive on time for photoshoot.`
  ];

  const tipsArabic = [
    "يُفضل وصول مصور الفوتوغراف وفريق الفيديو خلال آخر 30-40 دقيقة من جلسة الميكب.",
    "في حال حجز فوتوبوث، أو أوديو بوث، أو رسام مباشر، يُنصح بوصولهم وتجهيز كل شيء قبل بداية الفرح بـ 1-2 ساعة.",
    "يُنصح ببدء الزفة بعد كتب الكتاب مباشرة.",
    "في حال وجود فقرات فنية أو استعراضية (طبلة، عازف كمان، إلخ)، يُفضل أن تبدأ بعد بوفيه العشاء.",
    `لوصيفات العروسة القادمات لجلسة التصوير بعد التجهيز في المنزل:
- تخصيص 90 دقيقة لتصفيف الشعر بالصالون.
- 60 دقيقة للميكب وارتداء الفستان.
- التحرك مبكراً للوصول في الموعد المحدد للسيشن.`
  ];

  const tips = isArabic ? tipsArabic : tipsEnglish;
  const tipsTitle = isArabic ? "نصائح:" : "Tips:";
  const footerText = isArabic
    ? "تم إنشاء هذا الجدول بواسطة "
    : "This timeline was created by ";

  const fontStack = isArabic
    ? 'var(--font-arabic), "Segoe UI", Tahoma, Arial, sans-serif'
    : 'var(--font-inter), "Helvetica Neue", Helvetica, Arial, sans-serif';

  // Helper to build a row's HTML
  const buildRowHtml = (event: TimelineExportEvent) => {
    const brideAct = event.brideActivity?.trim() || "";
    const groomAct = event.groomActivity?.trim() || "";
    const bmaidsAct = event.bridesmaidsActivity?.trim() || "";
    const groomsAct = event.groomsmenActivity?.trim() || "";

    const allSame =
      brideAct === groomAct &&
      brideAct === bmaidsAct &&
      brideAct === groomsAct &&
      brideAct.length > 0;

    const isPinkEvent =
      event.id === "entrance" ||
      event.id === "church" ||
      event.id === "Grand_Entrance" ||
      event.id === "zaffa";

    const formatCellText = (act: string) => {
      if (!act || act === "_") return "—";
      return escapeHtml(act);
    };

    const formattedTime = formatTimelineTimeLabel(event.timeLabel, locale);

    if (allSame) {
      const bgColor = isPinkEvent ? "#FFB6C7" : "#FBF3E0";
      return `
        <div class="timeline-pdf-row" style="display: flex; gap: 4px; margin-bottom: 3.5px; align-items: stretch;">
          <div style="width: 18%; background-color: #FFB6C7; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-weight: bold; font-size: 11.5px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 4px; box-sizing: border-box; min-height: 28px;">
            ${escapeHtml(formattedTime)}
          </div>
          <div style="width: 82%; background-color: ${bgColor}; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-size: 11.5px; font-weight: ${
        isPinkEvent ? "bold" : "normal"
      }; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 8px; box-sizing: border-box; min-height: 28px;">
            ${escapeHtml(brideAct)}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="timeline-pdf-row" style="display: flex; gap: 4px; margin-bottom: 3.5px; align-items: stretch;">
          <div style="width: 18%; background-color: #FFB6C7; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-weight: bold; font-size: 11.5px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 4px; box-sizing: border-box; min-height: 28px;">
            ${escapeHtml(formattedTime)}
          </div>
          <div style="width: 20.5%; background-color: #FBF3E0; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-size: 11px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 4px; box-sizing: border-box; min-height: 28px; word-break: break-word; line-height: 1.3;">
            ${formatCellText(brideAct)}
          </div>
          <div style="width: 20.5%; background-color: #FBF3E0; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-size: 11px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 4px; box-sizing: border-box; min-height: 28px; word-break: break-word; line-height: 1.3;">
            ${formatCellText(groomAct)}
          </div>
          <div style="width: 20.5%; background-color: #FBF3E0; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-size: 11px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 4px; box-sizing: border-box; min-height: 28px; word-break: break-word; line-height: 1.3;">
            ${formatCellText(bmaidsAct)}
          </div>
          <div style="width: 20.5%; background-color: #FBF3E0; border: 0.8px solid #D32333; border-radius: 4px; color: #D32333; font-size: 11px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 4px; box-sizing: border-box; min-height: 28px; word-break: break-word; line-height: 1.3;">
            ${formatCellText(groomsAct)}
          </div>
        </div>
      `;
    }
  };

  // Build Tips HTML
  const buildTipsHtml = () => `
    <div class="timeline-pdf-tips" style="margin-top: 10px; padding: 0 2px;">
      <div style="font-size: 12.5px; font-weight: bold; color: #D32333; margin-bottom: 4px;">
        ${escapeHtml(tipsTitle)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        ${tips
          .map(
            (tip) => `
          <div style="display: flex; gap: 6px; font-size: 10.5px; color: #D32333; line-height: 1.35;">
            <span style="font-weight: bold; font-size: 12px; line-height: 1; flex-shrink: 0;">•</span>
            <span style="white-space: pre-line;">${escapeHtml(tip)}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  // Create temporary container placed at top:0, left:0 behind body
  const container = document.createElement("div");
  container.id = "timeline-pdf-temp-export-container";
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.zIndex = "-99999";
  container.style.pointerEvents = "none";
  container.setAttribute("dir", isArabic ? "rtl" : "ltr");

  // Step 1: Accurate DOM Measurement to eliminate artificial page breaks
  const measureWrapper = document.createElement("div");
  measureWrapper.style.width = "794px";
  measureWrapper.style.padding = "20px 32px";
  measureWrapper.style.boxSizing = "border-box";
  measureWrapper.style.fontFamily = fontStack;
  measureWrapper.setAttribute("dir", isArabic ? "rtl" : "ltr");

  const coupleNames =
    brideFirstName?.trim() && groomFirstName?.trim()
      ? `<div style="font-size: 14px; font-weight: bold; color: #D32333; margin-top: 2px;">${escapeHtml(
          brideFirstName.trim()
        )} &amp; ${escapeHtml(groomFirstName.trim())}</div>`
      : "";

  measureWrapper.innerHTML = `
    <div id="measure-header" style="text-align: center; margin-bottom: 4px;">
      <img src="${logoUrl}" style="height: 50px; max-width: 200px; object-fit: contain; margin: 0 auto; display: block;" alt="Logo" />
      <img src="${subHeaderUrl}" style="height: 28px; max-width: 320px; object-fit: contain; margin: 6px auto 0; display: block;" alt="Timeline Subheader" />
      ${coupleNames}
    </div>
    <div id="measure-table-header" style="display: flex; gap: 4px; padding-bottom: 4px; border-bottom: 1.5px solid #D32333; margin-bottom: 6px;">
      <div style="width: 18%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333;">${escapeHtml(headers[0])}</div>
      <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333;">${escapeHtml(headers[1])}</div>
      <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333;">${escapeHtml(headers[2])}</div>
      <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333;">${escapeHtml(headers[3])}</div>
      <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333;">${escapeHtml(headers[4])}</div>
    </div>
    <div id="measure-rows">
      ${events.map((e) => buildRowHtml(e)).join("")}
    </div>
    <div id="measure-tips">
      ${buildTipsHtml()}
    </div>
    <div id="measure-footer" style="text-align: center; font-size: 11px; color: #D32333; padding-top: 6px;">
      ${escapeHtml(footerText)} shopwifeyforlifey.com
    </div>
  `;

  container.appendChild(measureWrapper);
  document.body.appendChild(container);

  // Measure actual pixel heights
  const headerHeight = measureWrapper.querySelector("#measure-header")?.clientHeight || 95;
  const tableHeaderHeight = measureWrapper.querySelector("#measure-table-header")?.clientHeight || 25;
  const tipsHeight = measureWrapper.querySelector("#measure-tips")?.clientHeight || 95;
  const footerHeight = measureWrapper.querySelector("#measure-footer")?.clientHeight || 20;

  const rowElements = Array.from(measureWrapper.querySelectorAll(".timeline-pdf-row"));
  const rowHeights = rowElements.map((el) => (el as HTMLElement).offsetHeight + 3); // 3px margin-bottom

  // Total available height on an A4 page (1123px total)
  // Padding top (20px) + bottom (18px) = 38px
  const pageUsableTotal = 1123 - 38 - footerHeight;

  // Page 1 available content height for (Rows + Tips)
  const page1MaxContentHeight = pageUsableTotal - headerHeight - tableHeaderHeight - 8;

  // Clean dynamic pagination
  const pagesData: { events: TimelineExportEvent[]; isFirstPage: boolean; showTips: boolean }[] = [];
  const totalRowsHeight = rowHeights.reduce((acc, h) => acc + h, 0);

  // Case 1: Everything fits on Page 1 (Most timelines!)
  if (totalRowsHeight + tipsHeight <= page1MaxContentHeight) {
    pagesData.push({
      events,
      isFirstPage: true,
      showTips: true,
    });
  }
  // Case 2: All rows fit on Page 1, but Tips need to go to Page 2
  else if (totalRowsHeight <= page1MaxContentHeight) {
    // If all rows fit on page 1, keep all rows on page 1 and put tips on page 2
    pagesData.push({
      events,
      isFirstPage: true,
      showTips: false,
    });
    pagesData.push({
      events: [],
      isFirstPage: false,
      showTips: true,
    });
  }
  // Case 3: Rows genuinely exceed Page 1 capacity -> Fill Page 1 as much as physically possible
  else {
    let accumulated = 0;
    let splitIndex = 0;
    for (let i = 0; i < rowHeights.length; i++) {
      if (accumulated + rowHeights[i] > page1MaxContentHeight) {
        splitIndex = i;
        break;
      }
      accumulated += rowHeights[i];
    }

    // Ensure at least 1 row on Page 1
    splitIndex = Math.max(1, splitIndex);

    pagesData.push({
      events: events.slice(0, splitIndex),
      isFirstPage: true,
      showTips: false,
    });

    const remainingEvents = events.slice(splitIndex);
    const page2HeaderHeight = 45; // compact header on subsequent pages
    const page2MaxContentHeight = pageUsableTotal - page2HeaderHeight - tableHeaderHeight - 8;

    let page2Accum = 0;
    let page2Split = remainingEvents.length;

    for (let i = 0; i < remainingEvents.length; i++) {
      const h = rowHeights[splitIndex + i] || 28;
      if (page2Accum + h > page2MaxContentHeight - tipsHeight) {
        page2Split = i;
        break;
      }
      page2Accum += h;
    }

    if (page2Split >= remainingEvents.length) {
      pagesData.push({
        events: remainingEvents,
        isFirstPage: false,
        showTips: true,
      });
    } else {
      pagesData.push({
        events: remainingEvents.slice(0, page2Split),
        isFirstPage: false,
        showTips: false,
      });
      pagesData.push({
        events: remainingEvents.slice(page2Split),
        isFirstPage: false,
        showTips: true,
      });
    }
  }

  // Clear measurement wrapper
  container.removeChild(measureWrapper);

  // Step 2: Build the exact production A4 pages
  pagesData.forEach((pageInfo) => {
    const pageEl = document.createElement("div");
    pageEl.className = "timeline-pdf-export-page";
    pageEl.style.width = "794px";
    pageEl.style.height = "1123px";
    pageEl.style.backgroundColor = "#FBF3E0";
    pageEl.style.position = "relative";
    pageEl.style.overflow = "hidden";
    pageEl.style.padding = "20px 32px 18px 32px";
    pageEl.style.boxSizing = "border-box";
    pageEl.style.display = "flex";
    pageEl.style.flexDirection = "column";
    pageEl.style.fontFamily = fontStack;
    pageEl.setAttribute("dir", isArabic ? "rtl" : "ltr");

    // 1. Watermark
    const watermarkHtml = `
      <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); opacity: 0.11; pointer-events: none; z-index: 0; width: 380px;">
        <img src="${logoUrl}" style="width: 100%; height: auto; display: block;" alt="Watermark" />
      </div>
    `;

    // 2. Header
    let headerHtml = "";
    if (pageInfo.isFirstPage) {
      headerHtml = `
        <div style="text-align: center; margin-bottom: 4px;">
          <img src="${logoUrl}" style="height: 50px; max-width: 200px; object-fit: contain; margin: 0 auto; display: block;" alt="Logo" />
        </div>
        <div style="text-align: center; margin-bottom: 8px;">
          <img src="${subHeaderUrl}" style="height: 28px; max-width: 320px; object-fit: contain; margin: 0 auto; display: block;" alt="Timeline Subheader" />
          ${coupleNames}
        </div>
      `;
    } else {
      headerHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(211, 35, 51, 0.2);">
          <img src="${logoUrl}" style="height: 30px; object-fit: contain; display: block;" alt="Logo" />
          <span style="font-size: 13px; font-weight: bold; color: #D32333;">
            ${isArabic ? "جدول يوم الفرح" : "Wedding Day Timeline"}
          </span>
        </div>
      `;
    }

    // 3. Table Header (only if there are events on this page)
    const tableHeaderHtml =
      pageInfo.events.length > 0
        ? `
      <div style="display: flex; gap: 4px; padding-bottom: 4px; border-bottom: 1.5px solid #D32333; margin-bottom: 6px;">
        <div style="width: 18%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333; text-transform: uppercase;">
          ${escapeHtml(headers[0])}
        </div>
        <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333; text-transform: uppercase;">
          ${escapeHtml(headers[1])}
        </div>
        <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333; text-transform: uppercase;">
          ${escapeHtml(headers[2])}
        </div>
        <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333; text-transform: uppercase;">
          ${escapeHtml(headers[3])}
        </div>
        <div style="width: 20.5%; text-align: center; font-size: 12px; font-weight: bold; color: #D32333; text-transform: uppercase;">
          ${escapeHtml(headers[4])}
        </div>
      </div>
    `
        : "";

    // 4. Rows HTML
    const rowsHtml = pageInfo.events.map((e) => buildRowHtml(e)).join("");

    // 5. Tips HTML
    const tipsHtml = pageInfo.showTips ? buildTipsHtml() : "";

    // 6. Footer
    const footerHtml = `
      <div style="position: relative; z-index: 1; text-align: center; font-size: 11px; color: #D32333; padding-top: 6px; margin-top: auto;">
        ${escapeHtml(footerText)}
        <span style="color: #D32333; text-decoration: underline; font-weight: bold;">
          shopwifeyforlifey.com
        </span>
      </div>
    `;

    pageEl.innerHTML = `
      ${watermarkHtml}
      <div style="position: relative; z-index: 1; display: flex; flex-direction: column;">
        ${headerHtml}
        ${tableHeaderHtml}
        ${rowsHtml}
        ${tipsHtml}
      </div>
      ${footerHtml}
    `;

    container.appendChild(pageEl);
  });

  try {
    // Wait for all images in the container to be fully loaded
    const allImages = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      allImages.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    // Short delay for layout to settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    const html2canvas = (await import("html2canvas")).default;
    const { default: jsPDF } = (await import("jspdf")) as any;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageElements = container.querySelectorAll<HTMLElement>(".timeline-pdf-export-page");

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FBF3E0",
        logging: false,
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      if (i > 0) {
        doc.addPage();
      }

      doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }

    const pdfFileName =
      brideFirstName?.trim() && groomFirstName?.trim()
        ? `${brideFirstName.trim()} & ${groomFirstName.trim()} wedding day timeline.pdf`
        : "wedding-timeline.pdf";

    doc.save(pdfFileName);
  } finally {
    // Clean up temporary DOM element
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

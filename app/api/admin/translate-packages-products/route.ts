import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import packageModel from "@/app/modals/packageModel";
import productsModel from "@/app/modals/productsModel";
import categoriesModel from "@/app/modals/categoriesModel";
import subCategoryModel from "@/app/modals/subCategoryModel";

/**
 * Migration Script: Safely adds and updates Arabic translations for packages, products, categories, and subcategories.
 *
 * Guarantees:
 * - 100% backward compatible: never modifies or removes any original English field.
 * - Only sets `translations.ar` fields.
 * - Idempotent and safe to run multiple times.
 *
 * Call: GET /api/admin/translate-packages-products
 */
export async function GET() {
  try {
    await ConnectDB();

    let updatedPackages = 0;
    let updatedProducts = 0;
    let updatedCategories = 0;
    let updatedSubcategories = 0;

    // 1. Localize Packages
    const packages = await packageModel.find({});

    for (const pkg of packages) {
      const isWedding = Boolean(
        pkg.slug?.toLowerCase().includes("wedding") ||
        pkg.name?.toLowerCase().includes("wedding") ||
        pkg.partOf?.toLowerCase().includes("wedding") ||
        pkg.duration === 6
      );

      const isMini = Boolean(
        pkg.tier === "mini" ||
        pkg.slug?.toLowerCase().includes("mini") ||
        pkg.name?.toLowerCase().includes("mini") ||
        pkg.price < 2000
      );

      // Prepare translations.ar
      const existingAr = pkg.translations?.ar || {};

      const arName = existingAr.name || (
        isWedding
          ? (isMini ? "تجربة تنظيم الفرح المصغرة" : "تجربة تنظيم الفرح الكاملة")
          : (isMini ? "تجربة وايفي المصغرة (بلانر الجهاز)" : "تجربة وايفي الكاملة (بلانر الجهاز)")
      );

      const arPartOf = existingAr.partOf || (
        isWedding ? "بلانر تنظيم الفرح" : "بلانر رفيقة الجهاز"
      );

      const arBadgeLabel = existingAr.badgeLabel || (
        isWedding
          ? (isMini ? "تجربة الفرح المصغرة" : "تجربة الفرح الكاملة")
          : (isMini ? "تجربة الجهاز المصغرة" : "تجربة الجهاز الكاملة")
      );

      const arCalloutTitle = existingAr.calloutTitle || (
        isWedding
          ? "ليه أغلب العرايس بيختاروا التجربة الكاملة 💕"
          : "ليه أغلب العرايس بيختاروا التجربة الكاملة 💕"
      );

      const arCalloutBadge = existingAr.calloutBadge || arCalloutTitle;

      const arCalloutDescription = existingAr.calloutDescription || (
        isWedding
          ? "بـ 1000 جنيه زيادة بس، هتاخدي 11 قائمة تشغيل إضافية، بالإضافة إلى 6 شهور في مجتمع وايفي، واستشارات الخبراء، وخصومات الشركاء وقائمة قاعات وموردي الأفراح."
          : "بـ 1000 جنيه زيادة بس، هتاخدي 11 قائمة تشغيل إضافية، بالإضافة إلى سنة كاملة في مجتمع وايفي، واستشارات الخبراء، وخصومات الشركاء والأجهزة."
      );

      const arNotes = (existingAr.notes && existingAr.notes.length > 0)
        ? existingAr.notes
        : [
            isWedding
              ? "بلانر تنظيم الفرح هيوصلك خلال 5 أيام عمل حسب منطقة الشحن."
              : "بلانر رفيقة الجهاز هيوصلك خلال 5 أيام عمل حسب منطقة الشحن."
          ];

      const arHeroTitle = existingAr.heroTitle || "كل اللي محتاجاه لمرحلة فرحك — في مكان واحد 🎀";
      const arHeroSubtitle = existingAr.heroSubtitle || "بلانرات، أدوات ودعم حقيقي معمول مخصوص للعروسة المصرية. أياً كانت مرحلتك، في رفيقة ليكي 💕";

      // Translate items safely
      const updatedItems = (pkg.items || []).map((item: any) => {
        const itemVal = item.value || "";
        let arVal = item.translations?.ar?.value;

        if (!arVal) {
          if (itemVal.toLowerCase().includes("planner delivered")) {
            arVal = isWedding ? "بلانرات تنظيم الفرح واصلة لحد باب بيتك 💍" : "بلانر رفيقة الجهاز واصل لحد باب بيتك 🎀";
          } else if (itemVal.toLowerCase().includes("playlist") || itemVal.toLowerCase().includes("playlists")) {
            arVal = "وصول لقوائم تشغيل تفصيلية بتشرحلك كل خطوة وكل قرار";
          } else if (itemVal.toLowerCase().includes("community") || itemVal.toLowerCase().includes("whatsapp")) {
            arVal = "مجتمع عرايس وايفي، دائرة دعم واتساب ومتابعة مستمرة وخصومات على جلسات الخبراء";
          } else if (itemVal.toLowerCase().includes("discount") || itemVal.toLowerCase().includes("partner")) {
            arVal = "خصومات حصرية لعرايس وايفي✨ وفري على كل متطلبات وتجهيزات الفرح والجهاز";
          } else if (itemVal.toLowerCase().includes("bride planner")) {
            arVal = "الدليل الشامل لتنظيم الفرح (بلانر العروسة)";
          } else if (itemVal.toLowerCase().includes("groom planner")) {
            arVal = "الدليل الشامل للعريس (بلانر العريس)";
          } else {
            arVal = itemVal;
          }
        }

        return {
          _id: item._id,
          value: item.value,
          included: item.included,
          translations: {
            ar: {
              value: arVal,
            },
          },
        };
      });

      // Translate comparisonFeatures safely
      const updatedFeatures = (pkg.comparisonFeatures || []).map((feat: any) => {
        const fText = feat.feature || "";
        let arFeature = feat.translations?.ar?.feature;

        if (!arFeature) {
          if (fText.toLowerCase().includes("planner")) {
            arFeature = isWedding ? "بلانر تنظيم الفرح — كتاب مطبوع واصل لحد بيتك" : "بلانر رفيقة الجهاز — كتاب مطبوع واصل لحد بيتك";
          } else if (fText.toLowerCase().includes("video guide") || fText.toLowerCase().includes("playlist")) {
            arFeature = "فيديوهات إرشادية لكل عملية شراء وقرار";
          } else if (fText.toLowerCase().includes("whatsapp") || fText.toLowerCase().includes("support")) {
            arFeature = "دائرة دعم واتساب 24/7 للعرايس فقط";
          } else if (fText.toLowerCase().includes("discount") && !fText.toLowerCase().includes("1:1")) {
            arFeature = "خصومات حصرية من الشركاء الموثوقين";
          } else if (fText.toLowerCase().includes("1:1") || fText.toLowerCase().includes("consultation")) {
            arFeature = "خصم 10–20% على استشارات الخبراء الفردية";
          } else if (fText.toLowerCase().includes("vendor") || fText.toLowerCase().includes("venue")) {
            arFeature = "قائمة أكثر من 800 قاعة ومورد فرح مع الأسعار وتفاصيل التواصل";
          } else {
            arFeature = fText;
          }
        }

        let arFullValue = feat.translations?.ar?.fullValue;
        if (!arFullValue) {
          if (feat.fullValue === "12 playlists") arFullValue = "12 قائمة تشغيل";
          else if (feat.fullValue === "1 playlist") arFullValue = "قائمة تشغيل واحدة";
          else arFullValue = feat.fullValue;
        }

        let arMiniValue = feat.translations?.ar?.miniValue;
        if (!arMiniValue) {
          if (feat.miniValue === "12 playlists") arMiniValue = "12 قائمة تشغيل";
          else if (feat.miniValue === "1 playlist") arMiniValue = "قائمة تشغيل واحدة";
          else arMiniValue = feat.miniValue;
        }

        return {
          _id: feat._id,
          feature: feat.feature,
          fullValue: feat.fullValue,
          miniValue: feat.miniValue,
          translations: {
            ar: {
              feature: arFeature,
              fullValue: arFullValue,
              miniValue: arMiniValue,
            },
          },
        };
      });

      // Translate supportCards safely
      const updatedSupportCards = (pkg.supportCards || []).map((sc: any) => {
        let arTitle = sc.translations?.ar?.title;
        let arDesc = sc.translations?.ar?.description;

        const titleLower = (sc.title || "").toLowerCase();
        if (!arTitle) {
          if (titleLower.includes("gehaz bestie")) arTitle = "بلانر رفيقة الجهاز";
          else if (titleLower.includes("wedding planning")) arTitle = "بلانر تنظيم الفرح";
          else if (titleLower.includes("video guide")) arTitle = "فيديوهات إرشادية لمرحلة الفرح";
          else if (titleLower.includes("discount") && titleLower.includes("partner")) arTitle = "خصومات وشراكات موثوقة";
          else if (titleLower.includes("favorite product")) arTitle = "منتجات وايفي المفضلة";
          else if (titleLower.includes("inspo")) arTitle = "أفكار وإلهام العروسة";
          else if (titleLower.includes("whatsapp")) arTitle = "دائرة دعم واتساب";
          else if (titleLower.includes("webinar")) arTitle = "ويبينارات تفاعلية مع الخبراء";
          else if (titleLower.includes("consultation")) arTitle = "خصومات على الاستشارات الفردية";
          else if (titleLower.includes("vendor")) arTitle = "دليل وموردي الأفراح";
          else arTitle = sc.title;
        }

        return {
          _id: sc._id,
          id: sc.id,
          title: sc.title,
          description: sc.description,
          imagePath: sc.imagePath,
          enable: sc.enable,
          translations: {
            ar: {
              title: arTitle,
              description: arDesc || sc.description,
            },
          },
        };
      });

      // Translate cards safely
      const updatedCards = (pkg.cards || []).map((card: any) => ({
        _id: card._id,
        image: card.image,
        points: card.points,
        translations: {
          ar: {
            points: card.translations?.ar?.points || card.points,
          },
        },
      }));

      // Update package using $set to guarantee non-destructive update
      await packageModel.findByIdAndUpdate(pkg._id, {
        $set: {
          "translations.ar": {
            name: arName,
            partOf: arPartOf,
            saving: existingAr.saving || pkg.saving || "",
            notes: arNotes,
            badgeLabel: arBadgeLabel,
            calloutBadge: arCalloutBadge,
            calloutTitle: arCalloutTitle,
            calloutDescription: arCalloutDescription,
            heroTitle: arHeroTitle,
            heroSubtitle: arHeroSubtitle,
          },
          items: updatedItems,
          comparisonFeatures: updatedFeatures,
          supportCards: updatedSupportCards,
          cards: updatedCards,
        },
      });

      updatedPackages++;
    }

    // 2. Localize Categories safely
    const categories = await categoriesModel.find({});
    for (const cat of categories) {
      const existingAr = cat.translations?.ar || {};
      const catNameEn = (cat.categoryName || "").trim();

      let arCategoryName = existingAr.categoryName;
      let arCatDescription = existingAr.description;

      if (!arCategoryName) {
        if (catNameEn.toLowerCase().includes("bridal") || catNameEn.toLowerCase().includes("accessories")) {
          arCategoryName = "إكسسوارات العروسة";
          arCatDescription = arCatDescription || "أرقى إكسسوارات العروسة ليومك المميز ومناسبات ما قبل الفرح";
        } else if (catNameEn.toLowerCase().includes("stationary") || catNameEn.toLowerCase().includes("stationery")) {
          arCategoryName = "أدوات مكتبية ونوت بوكس";
          arCatDescription = arCatDescription || "نوت بوكس، كروت هدايا، واستيكرز لكل مرحلة!";
        } else {
          arCategoryName = cat.categoryName;
        }
      }

      await categoriesModel.findByIdAndUpdate(cat._id, {
        $set: {
          "translations.ar": {
            categoryName: arCategoryName,
            description: arCatDescription || cat.description || "",
          },
        },
      });
      updatedCategories++;
    }

    // 3. Localize Subcategories safely
    const subcategories = await subCategoryModel.find({});
    for (const sub of subcategories) {
      const existingAr = sub.translations?.ar || {};
      const subNameEn = (sub.subCategoryName || "").trim();

      let arSubName = existingAr.subCategoryName;
      let arSubDesc = existingAr.description;

      if (!arSubName) {
        if (subNameEn.toLowerCase().includes("accessories")) {
          arSubName = "إكسسوارات العروسة";
          arSubDesc = arSubDesc || "إكسسوارات ومستلزمات مميزة للعروسة لمناسبات ما قبل الفرح ويوم الفرح";
        } else if (subNameEn.toLowerCase().includes("gift card")) {
          arSubName = "كروت هدايا ومباركة";
          arSubDesc = arSubDesc || "كروت إهداء ومعايدة بعبارات رقيقة ومميزة للعروسة وصاحباتها";
        } else if (subNameEn.toLowerCase().includes("notebook")) {
          arSubName = "نوت بوكس ودفاتر";
          arSubDesc = arSubDesc || "نوت بوكس بتصميمات أنيقة لتدوين الخطط والأفكار والذكريات";
        } else if (subNameEn.toLowerCase().includes("tote") || subNameEn.toLowerCase().includes("bag")) {
          arSubName = "شنط وتوت باج";
          arSubDesc = arSubDesc || "شنط قماشية عصرية لمشاوير العروسة وتجهيزاتها";
        } else if (subNameEn.toLowerCase().includes("sticker")) {
          arSubName = "ستيكرز وملصقات";
          arSubDesc = arSubDesc || "ستيكرز مبهجة لتزيين دفاتر التخطيط والأغراض الشخصية";
        } else {
          arSubName = sub.subCategoryName;
        }
      }

      await subCategoryModel.findByIdAndUpdate(sub._id, {
        $set: {
          "translations.ar": {
            subCategoryName: arSubName,
            description: arSubDesc || sub.description || "",
          },
        },
      });
      updatedSubcategories++;
    }

    // 4. Localize Products safely
    const products = await productsModel.find({});

    const productTranslationsMap: Record<
      string,
      { title: string; desc: string; details?: string[] }
    > = {
      "I’m just a bride - Tote Bag": {
        title: "توت باج: أنا مجرد عروسة",
        desc: "شنطة قماشية عملية وعصرية لحمل مستلزمات العروسة في كل مشاويرها وتجهيزاتها",
        details: [
          "💖 تفاصيل هتحبيها:",
          "قماش كانفاس متين عالي الجودة يتحمل الاستخدام اليومي",
          "تصميم أنيق وعصري بعبارة I’m just a bride",
          "مساحة واسعة تناسب البلانر، اللابتوب وكل مشاوير الجهاز",
          "أيادي قوية ومريحة للحمل على الكتف",
        ],
      },
      "Girls do it better - NOTEBOOK": {
        title: "نوت بوك: البنات بتعملها أحسن",
        desc: "نوت بوك ملهم ومميز لتدوين أفكارك وخططك اليومية",
        details: [
          "🌸 تفاصيل هتحبيها:",
          "ورق أبيض ناعم عالي الجودة لتدوين مريح",
          "غلاف مقوى أنيق بتصميم مميز وعصري",
          "حجم مثالي للحمل في شنطتك اليومية",
          "مناسب لتدوين الأفكار والملاحظات اليومية",
        ],
      },
      "Girls don’t wait, they create - Notebook": {
        title: "نوت بوك: البنات مش بتستنى.. البنات بتبتكر",
        desc: "نوت بوك تحفيزي للبنات الطموحات لتدوين أحلامهن وإنجازاتهن",
        details: [
          "✨ تفاصيل هتحبيها:",
          "غلاف قوي وأنيق بعبارة ملهمة للبنات",
          "ورق فاخر مقاوم لتسرب الحبر",
          "تقسيم مريح للكتابة وتدوين الأهداف والخطط",
        ],
      },
      "Bride Sunglasses": {
        title: "نظارة شمس العروسة",
        desc: "نظارة شمس أنيقة للعروسة بتصميم عصري وفريد لمناسبات ما قبل الفرح وشهر العسل",
        details: [
          "🕶️ تفاصيل هتحبيها:",
          "تصميم عصري وجذاب ومثالي لجلسات التصوير وشهر العسل",
          "حماية من أشعة الشمس مع إطلالة أنيقة ولافتة",
          "خفيفة ومريحة للارتداء",
        ],
      },
      "BRIDE Pearl Headband": {
        title: "طوق شعر لؤلؤي للعروسة",
        desc: "طوق شعر مرصع باللؤلؤ وحروف BRIDE لإطلالة عروسة ملكية ساحرة في حفلات ما قبل الفرح ويومك الكبير",
        details: [
          "💖 تفاصيل هتحبيها:",
          "مرصع بالكامل بلآلئ صناعية وستراس لإعطاء لمسة بريق خاصة للعروسة",
          "حروف BRIDE بارزة ومميزة للصور والذكريات",
          "خفيف الوزن ومريح للارتداء طوال اليوم",
          "المقاس: حوالي 16 سم عرض × 18 سم ارتفاع",
          "💌 ملحوظة وايفي: في حالة وجود أي ملاحظة على المنتج يسعدنا تعويضك بنقاط ولاء وايفي لتقدري تستخدميها في منتجاتنا القادمة",
        ],
      },
      "Bride Bucket Hat": {
        title: "قبعة باكت للعروسة",
        desc: "قبعة باكت كاجوال وأنيقة بحروف لؤلؤية للعروسة، مثالية لشهر العسل ومشاوير التجهيزات",
        details: [
          "💕 ليه هتحبيها:",
          "قبعة بيضاء ناعمة مزينة بحروف BRIDE اللؤلؤية",
          "خفيفة وقابلة للطي — سهلة الحمل في السفر أو على البحر",
          "مقاس موحد يناسب الجميع",
          "💌 ملحوظة وايفي: في حالة وجود أي ملاحظة على المنتج يسعدنا تعويضك بنقاط ولاء وايفي لتقدري تستخدميها في منتجاتنا القادمة",
        ],
      },
      "The Birthday Gift Card": {
        title: "كارت إهداء عيد الميلاد",
        desc: "كارت معايدة مميز بألوان دافئة وكلمات رقيقة لمشاركة أحلى اللحظات",
        details: [
          "🎁 تفاصيل الكارت:",
          "تصميم لطيف ومبهج بعبارة Born to Shine",
          "ورق مقوى فاخر وملمس ناعم",
          "مساحة داخلية لكتابة رسالتك الخاصة من القلب",
        ],
      },
      "I Love You More Than Words - Gift Card": {
        title: "كارت إهداء: بحبك أكتر من الكلام",
        desc: "كارت إهداء بعبارة رومانسية دافئة لمفاجأة شريكك أو التعبير عن مشاعرك",
        details: [
          "💌 تفاصيل الكارت:",
          "تصميم رومانسي دافئ وأنيق",
          "ورق مقوى عالي الجودة مع مظروف لطيف",
          "مناسب للإهداء في المناسبات السعيدة وكتب الكتاب",
        ],
      },
      "Wifey Sticker Sheet": {
        title: "شيت ستيكرز وايفي",
        desc: "ملصقات ملونة ومبهجة لتزيين دفاتر التخطيط والأكواب واللابتوب",
        details: [
          "✨ تفاصيل الستيكرز:",
          "مجموعة ستيكرز حصرية بتصميمات العروسة ووايفي",
          "خامة مقاومة ومقاومة للماء وسهلة اللصق",
          "مثالية لتزيين البلانر، اللابتوب، أو المج",
        ],
      },
    };

    for (const prod of products) {
      const existingAr = prod.translations?.ar || {};
      const mapped = productTranslationsMap[prod.title];

      const arTitle = existingAr.title || mapped?.title || prod.title;
      const arDesc = existingAr.description || mapped?.desc || prod.description;
      const arDetails = (existingAr.productDetails && existingAr.productDetails.length > 0)
        ? existingAr.productDetails
        : mapped?.details || prod.productDetails || [];

      // Localize variations & attributes if not yet localized
      const updatedVariations = (prod.variations || []).map((v: any) => {
        let vArName = v.translations?.ar?.name;
        let vArAttrName = v.translations?.ar?.attributeName;

        const vNameLower = (v.name || "").toLowerCase();
        if (!vArName) {
          if (vNameLower.includes("notebook only")) vArName = "النوت بوك فقط";
          else if (vNameLower.includes("sticker")) vArName = "نوت بوك + 15 ستيكر";
          else if (vNameLower.includes("tote bag")) vArName = "توت باج";
          else if (vNameLower.includes("one size") || vNameLower.includes("onesize")) vArName = "مقاس موحد";
          else if (vNameLower.includes("card")) vArName = "كارت إهداء";
          else if (vNameLower.includes("default")) vArName = "افتراضي";
          else vArName = v.name;
        }

        const vAttrLower = (v.attributeName || "").toLowerCase();
        if (!vArAttrName) {
          if (vAttrLower.includes("color")) vArAttrName = "اللون";
          else if (vAttrLower.includes("size")) vArAttrName = "المقاس";
          else if (vAttrLower.includes("notebook")) vArAttrName = "نوع العرض";
          else if (vAttrLower.includes("tote")) vArAttrName = "المنتج";
          else if (vAttrLower.includes("card")) vArAttrName = "نوع الكارت";
          else vArAttrName = v.attributeName;
        }

        const updatedAttrs = (v.attributes || []).map((attr: any) => {
          let attrArName = attr.translations?.ar?.name;
          const attrLower = (attr.name || "").toLowerCase();
          if (!attrArName) {
            if (attrLower.includes("white")) attrArName = "أبيض";
            else if (attrLower.includes("pink")) attrArName = "بينك";
            else if (attrLower.includes("black")) attrArName = "أسود";
            else if (attrLower.includes("notebook only")) attrArName = "النوت بوك فقط";
            else if (attrLower.includes("sticker")) attrArName = "نوت بوك + 15 ستيكر";
            else if (attrLower.includes("tote bag")) attrArName = "توت باج";
            else if (attrLower.includes("card")) attrArName = "كارت إهداء";
            else if (attrLower.includes("stock")) attrArName = "متوفر";
            else if (attrLower.includes("default")) attrArName = "افتراضي";
            else attrArName = attr.name;
          }

          return {
            _id: attr._id,
            name: attr.name,
            stock: attr.stock,
            price: attr.price,
            translations: {
              ar: {
                name: attrArName,
              },
            },
          };
        });

        return {
          _id: v._id,
          name: v.name,
          attributeName: v.attributeName,
          price: v.price,
          attributes: updatedAttrs,
          images: v.images,
          mobImages: v.mobImages,
          translations: {
            ar: {
              name: vArName,
              attributeName: vArAttrName,
            },
          },
        };
      });

      await productsModel.findByIdAndUpdate(prod._id, {
        $set: {
          "translations.ar": {
            title: arTitle,
            description: arDesc,
            productDimensions: existingAr.productDimensions || prod.productDimensions || [],
            productDetails: arDetails,
            productCare: existingAr.productCare || prod.productCare || [],
            season: existingAr.season || prod.season || "all",
          },
          variations: updatedVariations,
        },
      });

      updatedProducts++;
    }

    return NextResponse.json({
      success: true,
      message: "Packages, products, categories, and subcategories translations updated safely without modifying existing fields.",
      updatedPackages,
      updatedProducts,
      updatedCategories,
      updatedSubcategories,
    });
  } catch (error: any) {
    console.error("Translation Migration Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred during translation migration.",
      },
      { status: 500 }
    );
  }
}

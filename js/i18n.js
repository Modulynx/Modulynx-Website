/* ═══════════════════════════════════════════════════════════
   MODULYNX — bilingual EN/AR toggle
   English is captured live from the authored DOM (single source
   of truth); Arabic is a professionally adapted translation, not
   a literal one. Persists choice in localStorage.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var STORAGE_KEY = "modulynx-lang";
  var FONT_HREF = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap";

  /* ── Arabic dictionary — adapted, not literal ── */
  var AR = {
    "nav.brandAria": "الصفحة الرئيسية لـ Modulynx",
    "nav.toggleAria": "فتح القائمة",
    "nav.way": "منهج الوشق",
    "nav.capabilities": "الخدمات",
    "nav.work": "أعمالنا",
    "nav.track": "إنجازاتنا",
    "nav.cta": "ابدأ مشروعك",

    "hero.lynxAria": "شعار الوشق — Modulynx",
    "hero.eyebrow": "استوديو رقمي معياري",
    "hero.line1": "نبني بعينٍ",
    "hero.line2": "ثاقبة كعين الوشق.",
    "hero.sub": "تصمم Modulynx أنظمة معيارية وواجهات سينمائية وحركة نابضة بالحياة — منتجات تراقب وتتفاعل وتتحرك وكأنها كائن حي.",
    "hero.ctaPrimary": "ابدأ مشروعك",
    "hero.ctaSecondary": "شاهد أسلوبنا",
    "hero.scrollAria": "مرر للأسفل",
    "hero.scrollLabel": "مرر",

    "marquee.precision": "دقة",
    "marquee.modularity": "معيارية",
    "marquee.motion": "حركة",
    "marquee.instinct": "غريزة",

    "about.eyebrow": "01 — منهج الوشق",
    "about.title1": "الوشق يرى ما يغفل عنه غيره.",
    "about.title2": "ونحن كذلك.",
    "about.lead": "يتحرك الوشق بصبرٍ ودقة — يدرس محيطه جيداً، ولا يتحرك إلا حين يستحق الأمر، ولا يهدر حركة واحدة بلا طائل. نبني البرمجيات بالطريقة ذاتها: أجزاء معيارية، حركة مدروسة، ولا شيء زائد.",
    "about.item1.title": "رؤية ثاقبة",
    "about.item1.body": "ندرس قبل أن نبني. كل وحدة تكتسب مكانها في النظام باستحقاق.",
    "about.item2.title": "سرعة صامتة",
    "about.item2.body": "نضبط الأداء منذ اليوم الأول — واجهات تنقضّ بسرعة، ولا تتلكأ أبداً.",
    "about.item3.title": "حركة نابضة",
    "about.item3.body": "فيزياء حركة طبيعية وتوقيت سينمائي يجعلان كل شاشة تنبض بالحياة.",

    "services.eyebrow": "02 — الخدمات",
    "services.title1": "كل شيء معياري.",
    "services.title2": "كل شيء نابض بالحياة.",
    "services.card1.title": "بنية معيارية",
    "services.card1.body": "أنظمة تصميم ومكتبات مكوّنات قابلة للتوسع — تُركَّب كالفقرات، لا تُلصق كالطوب.",
    "services.card2.title": "تصميم الواجهات",
    "services.card2.body": "تطبيقات ويب بجودة إنتاجية، باهتمام دقيق بالحالة وإمكانية الوصول والتفاصيل.",
    "services.card3.title": "الحركة والتفاعل",
    "services.card3.body": "حركات مبنية على الفيزياء، وتناسق في التمرير، وتفاعلات دقيقة بتوقيت سينمائي.",
    "services.card4.title": "أنظمة الهوية",
    "services.card4.body": "هويات مبنية كأنظمة متكاملة — شعار وخط ولون ولغة حركية تتكيّف مع كل وسيط.",
    "services.card5.title": "الأداء",
    "services.card5.body": "مؤشرات الأداء الأساسية دائماً في المنطقة الخضراء. نحلّل ونهذّب ونخزّن مؤقتاً حتى تُحمَّل الصفحات كردّة فعل.",
    "services.card6.title": "رعاية مستمرة",
    "services.card6.body": "مراقبة وصيانة وتطوير مستمر بعد الإطلاق — نبقى قريبين مما نبنيه.",

    "work.eyebrow": "03 — أعمال مختارة",
    "work.title1": "أعمال قليلة.",
    "work.title2": "كل واحدة مدروسة.",
    "work.reelflow.body": "محرك تسويق شبه مستقل — مصنع محتوى مدعوم بالذكاء الاصطناعي يرصد الترندات، يكتب النصوص، وينتج فيديوهات قصيرة، ثم ينشرها وفق جدول زمني، ويعيد استثمار الجهد في كل ما يحقق عائداً. من الفكرة إلى الإنتاج إلى الربح، بأقل تدخل بشري ممكن.",
    "work.safe.body": "منصة لإدارة الاستثمار مصممة أولاً للمستخدم العربي — محافظ استثمارية، تحليلات لحظية، ولوحات تحكم بتنسيق RTL مبنية لتمنح وضوحاً حتى في أوقات الضغط.",
    "work.delivery.body": "نظام لوجستي متكامل لإدارة الشحنات من طرف إلى طرف على نواة معيارية واحدة — لوحة تحكم إدارية، وتطبيق سائق PWA، وبوابة موردين، كلها تعمل بتناغم.",
    "work.note": "Reelflow هو مشروعنا الرائد حالياً — المقال التعريفي قريباً. أما البقية فتعمل فعلياً ومتاحة الآن.",
    "badge.inProduction": "قيد الإنتاج",
    "badge.live": "متاح الآن",
    "project.visit": "زيارة المشروع ↗",
    "project.code": "عرض الكود ↗",

    "stats.products": "منتجات تم تسليمها",
    "stats.processes": "عمليات تمت أتمتتها",
    "stats.vitals": "مؤشرات أداء ممتازة",
    "stats.hunt": "في الميدان",
    "stats.yrsSuffix": "سنوات",

    "founder.eyebrow": "خلف تلك العينين",
    "founder.role": "المؤسس — مطوّر برمجيات متكامل",
    "founder.bio": "يبني أنظمة متكاملة منذ عام 2022 — واجهات أمامية بحسٍ فني، وأنظمة خلفية قابلة للتوسع. يقيم في عمّان، الأردن.",
    "founder.github": "GitHub ↗",
    "founder.linkedin": "LinkedIn ↗",
    "founder.orgGithub": "Modulynx على GitHub ↗",
    "founder.photoAlt": "محمود برجوس، مؤسس Modulynx",
    "scrollLynx.aria": "العودة للأعلى",

    "contact.eyebrow": "04 — ابدأ مشروعك",
    "contact.title1": "جاهزون",
    "contact.title2": "حين تكون جاهزاً.",
    "contact.sub": "أخبرنا بما تبنيه. سنرد خلال 24 ساعة.",
    "contact.directPrefix": "أو راسلنا مباشرة:",
    "contact.nameLabel": "الاسم",
    "contact.namePh": "اسمك الكامل",
    "contact.emailLabel": "البريد الإلكتروني",
    "contact.projectLabel": "المشروع",
    "contact.projectPh": "ما الذي نبنيه معاً؟",
    "contact.send": "أرسل الرسالة",

    "footer.tag": "أنظمة معيارية. دقة الوشق.",
    "footer.rights": "جميع الحقوق محفوظة.",

    "meta.title": "Modulynx — أنظمة معيارية",

    "form.invalid": "يرجى تعبئة كل الحقول ببريد إلكتروني صحيح.",
    "form.sending": "جارٍ الإرسال…",
    "form.success": "تم استلام رسالتك — نحن نعمل عليها. سنرد خلال 24 ساعة.",
    "form.error": "تعذّر الإرسال الآن — راسلنا مباشرة على " +
      '<a href="mailto:modulynx.project@gmail.com" style="color:#8fc7dd">modulynx.project@gmail.com</a>.'
  };

  /* ── English originals not present as static DOM text ── */
  var EN_MANUAL = {
    "form.invalid": "Please fill every field with a valid email.",
    "form.sending": "Sending…",
    "form.success": "Message received — we're on it. We'll reply within 24h.",
    "form.error": "Could not send right now — email us directly at " +
      '<a href="mailto:modulynx.project@gmail.com" style="color:#8fc7dd">modulynx.project@gmail.com</a>.'
  };

  var EN = Object.assign({}, EN_MANUAL);
  var current = "en";

  /* Capture the authored English text as the source of truth, once. */
  function captureEnglish() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!(key in EN)) EN[key] = el.textContent.replace(/\s+/g, " ").trim();
    });
    document.querySelectorAll("*").forEach(function (el) {
      for (var i = 0; i < el.attributes.length; i++) {
        var attr = el.attributes[i];
        if (attr.name.indexOf("data-i18n-") === 0) {
          var targetAttr = attr.name.slice("data-i18n-".length);
          var key = attr.value;
          var existing = el.getAttribute(targetAttr);
          if (existing && !(key in EN)) EN[key] = existing;
        }
      }
    });
  }

  function loadArabicFont() {
    if (document.getElementById("ar-font-link")) return;
    var link = document.createElement("link");
    link.id = "ar-font-link";
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }

  function swapDom(lang) {
    var dict = lang === "ar" ? AR : EN;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("*").forEach(function (el) {
      for (var i = 0; i < el.attributes.length; i++) {
        var attr = el.attributes[i];
        if (attr.name.indexOf("data-i18n-") === 0) {
          var targetAttr = attr.name.slice("data-i18n-".length);
          var key = attr.value;
          if (dict[key] != null) el.setAttribute(targetAttr, dict[key]);
        }
      }
    });

    document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.body.classList.toggle("lang-ar", lang === "ar");

    var btn = document.getElementById("langToggle");
    if (btn) btn.textContent = lang === "ar" ? "English" : "العربية";

    if (lang === "ar") loadArabicFont();
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  /* animate = true for user-triggered toggles; the initial page-load
     call skips the fade so there's no flash before anything is visible */
  function apply(lang, animate) {
    if (!animate || !document.body) { swapDom(lang); return; }
    document.body.style.opacity = "0.35";
    setTimeout(function () {
      swapDom(lang);
      document.body.style.opacity = "1";
    }, 150);
  }

  window.modulynxI18n = {
    t: function (key) { return (current === "ar" ? AR[key] : EN[key]) || key; },
    setLang: function (lang) { apply(lang, true); },
    getLang: function () { return current; }
  };

  captureEnglish();
  var saved = "en";
  try { saved = localStorage.getItem(STORAGE_KEY) || "en"; } catch (e) {}
  apply(saved, false);

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("langToggle");
    if (btn) {
      btn.addEventListener("click", function () {
        apply(current === "ar" ? "en" : "ar", true);
      });
    }
  });
})();

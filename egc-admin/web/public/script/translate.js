const translations = {
    "home": { "en": "Home", "ar": "الرئيسية" },
    "staffs": { "en": "Staff", "ar": "الموظفين" },
    "students": { "en": "Students", "ar": "الطلاب" },
    "departments": { "en": "Departments", "ar": "الاقسام" },
    "news": { "en": "News", "ar": "اخبار" },
    "events": { "en": "Events", "ar": "فعاليات" },
    "about": { "en": "About", "ar": "عن الكلية" },
    "login": { "en": "Login", "ar": "الدخول" },
    "dashboard": { "en": "Dashboard", "ar": "اللوحة" },
    "headline": { "en": "Egyptian Germany College ", "ar": "الكلية المصرية الالمانية" },
    "title1": { "en": "Welcome to Egyptian Germany College", "ar": "مرحبا بكم في الكلية المصرية الالمانية" },
    "about-egc": { "en": "About<span style='color:  rgb(42, 165, 232);' > EGC", "ar": "عن الكلية المصرية الالمانية " },
    "text1": { "en": "An Egyptian public college affiliated with Misr International Technological University was established according to the decision of the Minister of Higher Education No. 5701 dated 28/9/2021. It accepts students of both sexes who have a high school diploma and technical diplomas according to the coordination of public universities.", "ar": "كلية مصرية حكومية تابعة لجامعة مصر الدولية التكنولوجية، تم إنشاؤها بموجب قرار وزير التعليم العالي رقم 5701 بتاريخ 28/9/2021. تقبل الطلاب من كلا الجنسين الحاصلين على شهادة الثانوية العامة والدبلومات الفنية وفقًا لتنسيق الجامعات الحكومية" },
    "info": { "en": "Information Technology", "ar": "تكنولوجيا المعلومات" },
    "elec": { "en": "Electrical Technology", "ar": "تكنولوجيا الكهرباء" },
    "mech": { "en": "Mechanical Technology", "ar": "تكنولوجيا الميكانيكا" },
    "titel3": { "en": " Dean's <span style='color:  rgb(42, 165, 232);' >Speech", "ar": "كلمة العميد" },
    "text2": { "en": " Achieving comprehensive and sustainable development in the field of technical and technological education for a better industrial and technological future led by Egypt's distinguished youth with the highest professional and international standards in the local and international labor markets.", "ar": "تحقيق التنمية الشاملة والمستدامة في مجال التعليم الفني والتكنولوجي من أجل مستقبل صناعي وتكنولوجي أفضل يقوده شباب مصر المتميزون بأعلى المعايير المهنية والدولية في أسواق العمل المحلية والدولية. " },
    "titel4": { "en": "Latest<span style='color:  rgb(42, 165, 232);' > News ", "ar": "أحدث الأخبار " },
    "text3": { "en": " The sixth season of the Geniuses program, the match between Misr Technological University and Tanta University", "ar": "الموسم السادس من برنامج العباقرة، المباراة بين جامعة مصر الدولية التكنولوجية وجامعة طنطا " },
    "text4": { "en": " Professor Dr. Ahmad Hosni Al-Haywy and his talk about the Technologists Syndicate Law", "ar": "الأستاذ الدكتور أحمد حسني الحوي، وحديثه عن قانون نقابة التكنولوجيين" },
    "read": { "en": "Read More", "ar": "قراءة المزيد " },
    "titel5": { "en": " International Partnerships", "ar": "الشراكات الدولية" },
    "staff": { "en": "+419<br>Staff", "ar": "٩١٤+<br>موظف" },
    "student": { "en": "+15,000<br>Student", "ar": "١٥,٠٠٠+<br>طالب" },
    "graduated": { "en": "+9,345<br>Graduated", "ar": "٩,٣٤٥+<br>متخرج" },
    "text6": { "en": "It was established accordingto<br> the decisionof the Ministerof<br> Higher Education No. 5701<br>Dated 28-9-2021", "ar": "تم إنشاؤها بموجب قرار وزير التعليم العالي<br> رقم ٥٧٠١ بتاريخ ٢٨-٩-٢٠٢١." },
    "titel6": { "en": "  Egyptian Germany College", "ar": "الكلية المصرية الالمانية " },
    "add": { "en": "  Our Address", "ar": "العنوان " },
    "add1": { "en": " <img src='/img/circle.png' alt='' class='icon'> Al-Qasr Al-Ainy Street, Assiut", "ar": "<img src='/img/circle.png' alt='' class='icon'>شارع القصر العيني، أسيوط " },
    "add2": { "en": "<img src='/img/phone-call.png' alt='' class='icon' > 088 2350809 ", "ar": "<img src='/img/phone-call.png' alt='' class='icon' >٢٣٥٠٨٠٩ ٠٨٨ " },
    "add3": { "en": " <img src='/img/message.png' alt='' class='icon'>egcasyut@outlook.com ", "ar": " <img src='/img/message.png' alt='' class='icon'>egcasyut@outlook.com " },
    "date": { "en": "January 1, 2024", "ar": "١ يناير , ٢٠٢٤" },
    "date2": { "en": "March 1, 2024", "ar": "١ مارس , ٢٠٢٤" },
    "date3": { "en": "June 1, 2024", "ar": "١ يونيو , ٢٠٢٤" },
    "new": { "en": "News", "ar": "الأخبار" }
};

function toggleLanguage() {
    const elements = document.querySelectorAll('[data-translate]');
    const currentLang = document.documentElement.getAttribute('lang');
    const newLang = currentLang === 'en' ? 'ar' : 'en';

    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.innerHTML = translations[key][newLang];
            element.setAttribute('data-lang', newLang);

        } else {
            console.warn(`No translation found for key: ${key}`);
        }
    });

    const newDirection = newLang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.setAttribute('dir', newDirection);
    document.documentElement.setAttribute('lang', newLang);

    updateStylesForDirection(newDirection);

    // تخزين اللغة الجديدة في Local Storage
    localStorage.setItem('selectedLanguage', newLang);
}

// وظيفة لتحديث اللغة
function updateLanguage(language) {

    const elements = document.querySelectorAll('[data-translate]');

    elements.forEach(element => {
        const key = element.getAttribute('data-translate');

        if (translations[key]) {
            element.innerHTML = translations[key][language];
            element.setAttribute('data-lang', language);







        } else {
            console.warn(`No translation found for key: ${key}`);
        }
    });
    const newDirection = language === 'en' ? 'ltr' : 'rtl';
    document.documentElement.setAttribute('dir', newDirection);
    document.documentElement.setAttribute('lang', language);

    updateStylesForDirection(newDirection);
}

// عند تحميل الصفحة، افحص إذا كان هناك لغة محفوظة مسبقًا
document.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
        updateLanguage(savedLanguage);
    }
});

// الاستماع لتغييرات Local Storage لتحديث اللغة في الصفحات الأخرى
window.addEventListener("storage", (event) => {
    if (event.key === "selectedLanguage") {
        updateLanguage(event.newValue);
    }
});

function updateStylesForDirection(direction) {
    const elementsToAdjust = document.querySelectorAll('.some-class');
    elementsToAdjust.forEach(element => {
        if (direction === 'rtl') {
            element.style.float = 'right';
        } else {
            element.style.float = 'left';
        }
    });
}


document.getElementById('translate-btn').addEventListener('click', toggleLanguage);

document.querySelectorAll('[data-translate]').forEach(element => {
    element.setAttribute('data-lang', 'en');
});

document.documentElement.setAttribute('lang', 'en');
document.documentElement.setAttribute('dir', 'ltr');
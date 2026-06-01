(function () {
    const supportedLanguages = ["ru", "kz", "en"];
    let translations = {};
    let activeLanguage = "ru";

    function normalizeLanguage(lang) {
        const normalized = String(lang || "").trim().toLowerCase();

        if (normalized === "kk") {
            return "kz";
        }

        return supportedLanguages.includes(normalized) ? normalized : "ru";
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? decodeURIComponent(match[2]) : "";
    }

    function rememberLanguage(lang) {
        localStorage.setItem("preferredLang", lang);
        document.cookie = `preferredLang=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax`;
    }

    function setUrlLanguage(lang) {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    function readLanguage() {
        const params = new URLSearchParams(window.location.search);

        return normalizeLanguage(
            params.get("lang")
            || localStorage.getItem("preferredLang")
            || getCookie("preferredLang")
            || document.documentElement.dataset.lang
        );
    }

    function htmlLanguage(lang) {
        return lang === "kz" ? "kk" : lang;
    }

    function applyStaticText() {
        document.documentElement.lang = htmlLanguage(activeLanguage);
        document.documentElement.dataset.lang = activeLanguage;

        if (translations.course_page_title) {
            document.title = translations.course_page_title;
        }

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.dataset.i18n;

            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        document.querySelectorAll("[data-i18n-pair]").forEach((element) => {
            const [labelKey, textKey] = element.dataset.i18nPair.split("|");
            const label = translations[labelKey];
            const text = translations[textKey];

            if (!label || !text) return;

            const strong = element.querySelector("strong");

            if (!strong) {
                element.textContent = `${label} ${text}`;
                return;
            }

            strong.textContent = label;

            let textNode = Array.from(element.childNodes).find((node) => (
                node.nodeType === Node.TEXT_NODE
                && Array.prototype.indexOf.call(element.childNodes, node) > Array.prototype.indexOf.call(element.childNodes, strong)
            ));

            if (!textNode) {
                textNode = document.createTextNode("");
                strong.after(textNode);
            }

            textNode.nodeValue = ` ${text}`;
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
            const key = element.dataset.i18nPlaceholder;

            if (translations[key]) {
                element.setAttribute("placeholder", translations[key]);
            }
        });

        document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
            const key = element.dataset.i18nAlt;

            if (translations[key]) {
                element.setAttribute("alt", translations[key]);
            }
        });

        const pageTitle = document.getElementById("page-title");
        const activeNav = document.querySelector(".sidebar-nav .nav-item.active span[data-i18n]");

        if (pageTitle && activeNav) {
            pageTitle.textContent = activeNav.textContent;
        }
    }

    async function load(lang) {
        activeLanguage = normalizeLanguage(lang);

        const response = await fetch("/static/Diploma/course-ui-i18n.json");

        if (!response.ok) {
            throw new Error("Course language file was not found.");
        }

        const data = await response.json();
        translations = data[activeLanguage] || data.ru || {};
        rememberLanguage(activeLanguage);
        setUrlLanguage(activeLanguage);
        applyStaticText();

        const switcher = document.getElementById("course-lang-switcher");

        if (switcher) {
            switcher.value = activeLanguage;
        }

        return translations;
    }

    function t(key, fallback) {
        return translations[key] || fallback || key;
    }

    window.KTZCourseI18n = {
        load,
        t,
        getLang: () => activeLanguage,
        getTranslations: () => translations,
    };

    document.addEventListener("DOMContentLoaded", () => {
        const switcher = document.getElementById("course-lang-switcher");
        const lang = readLanguage();

        if (switcher) {
            switcher.value = lang;
            switcher.addEventListener("change", (event) => {
                load(event.target.value).catch((error) => {
                    console.error("Course translation error:", error);
                });
            });
        }

        load(lang).catch((error) => {
            console.error("Course translation error:", error);
        });
    });
})();

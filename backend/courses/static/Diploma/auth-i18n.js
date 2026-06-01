(function () {
    const supportedLanguages = ["ru", "kz", "en"];
    const html = document.documentElement;
    const page = html.dataset.authPage || "login";
    const switcher = document.getElementById("auth-lang-switcher");
    const languageDropdown = document.querySelector("[data-auth-language]");
    const languageButton = languageDropdown?.querySelector(".auth-language__button");
    const languageCurrent = languageDropdown?.querySelector("[data-auth-language-current]");
    const languageOptions = Array.from(document.querySelectorAll("[data-auth-language-option]"));

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

    function initialLanguage() {
        const params = new URLSearchParams(window.location.search);

        return normalizeLanguage(
            params.get("lang")
            || html.dataset.lang
            || localStorage.getItem("preferredLang")
            || getCookie("preferredLang")
        );
    }

    function htmlLanguage(lang) {
        return lang === "kz" ? "kk" : lang;
    }

    function rememberLanguage(lang) {
        localStorage.setItem("preferredLang", lang);
        document.cookie = `preferredLang=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax`;
    }

    function urlWithLanguage(value, lang) {
        const url = new URL(value, window.location.href);
        url.searchParams.set("lang", lang);
        return url.pathname + url.search + url.hash;
    }

    function syncLanguageTargets(lang) {
        document.querySelectorAll("input[name='lang']").forEach((input) => {
            input.value = lang;
        });

        document.querySelectorAll("[data-preserve-lang]").forEach((link) => {
            link.setAttribute("href", urlWithLanguage(link.getAttribute("href"), lang));
        });

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("lang", lang);
        window.history.replaceState({}, "", currentUrl.pathname + currentUrl.search + currentUrl.hash);
    }

    function languageLabel(lang) {
        return normalizeLanguage(lang).toUpperCase();
    }

    function closeLanguageDropdown() {
        if (!languageDropdown || !languageButton) {
            return;
        }

        languageDropdown.classList.remove("is-open");
        languageButton.setAttribute("aria-expanded", "false");
    }

    function toggleLanguageDropdown() {
        if (!languageDropdown || !languageButton) {
            return;
        }

        const willOpen = !languageDropdown.classList.contains("is-open");
        languageDropdown.classList.toggle("is-open", willOpen);
        languageButton.setAttribute("aria-expanded", String(willOpen));
    }

    function updateLanguageDropdown(lang) {
        const selectedLang = normalizeLanguage(lang);

        if (languageCurrent) {
            languageCurrent.textContent = languageLabel(selectedLang);
        }

        languageOptions.forEach((option) => {
            const isActive = option.dataset.authLanguageOption === selectedLang;
            option.classList.toggle("is-active", isActive);
            option.setAttribute("aria-selected", String(isActive));
        });
    }

    function applyPlaceholders(translations) {
        const fieldMap = {
            username: "placeholder_username",
            email: "placeholder_email",
            password: "placeholder_password",
            password1: "placeholder_password",
            password2: "placeholder_password_confirm",
        };

        Object.entries(fieldMap).forEach(([name, key]) => {
            const input = document.querySelector(`[name="${name}"]`);

            if (input && translations[key]) {
                input.setAttribute("placeholder", translations[key]);
            }
        });
    }

    function applyTranslations(translations, lang) {
        html.lang = htmlLanguage(lang);
        html.dataset.lang = lang;

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.dataset.i18n;

            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        const pageTitleKey = `${page}_page_title`;

        if (translations[pageTitleKey]) {
            document.title = translations[pageTitleKey];
        }

        applyPlaceholders(translations);
        syncLanguageTargets(lang);
    }

    async function loadLanguage(lang) {
        const selectedLang = normalizeLanguage(lang);

        try {
            const response = await fetch("/static/Diploma/auth-i18n.json");

            if (!response.ok) {
                throw new Error("Auth language file was not found.");
            }

            const allTranslations = await response.json();
            const translations = allTranslations[selectedLang] || allTranslations.ru;

            rememberLanguage(selectedLang);
            applyTranslations(translations, selectedLang);

            if (switcher) {
                switcher.value = selectedLang;
            }

            updateLanguageDropdown(selectedLang);
        } catch (error) {
            console.error("Auth translation error:", error);
        }
    }

    const lang = initialLanguage();

    if (switcher) {
        switcher.value = lang;
        switcher.addEventListener("change", (event) => loadLanguage(event.target.value));
    }

    updateLanguageDropdown(lang);

    if (languageButton) {
        languageButton.addEventListener("click", toggleLanguageDropdown);
    }

    languageOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const selectedLang = normalizeLanguage(option.dataset.authLanguageOption);

            if (switcher) {
                switcher.value = selectedLang;
            }

            closeLanguageDropdown();
            loadLanguage(selectedLang);
        });
    });

    document.addEventListener("mousedown", (event) => {
        if (languageDropdown && !languageDropdown.contains(event.target)) {
            closeLanguageDropdown();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeLanguageDropdown();
        }
    });

    loadLanguage(lang);
})();

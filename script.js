const demoMode = true;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const namePattern = /^[\p{L}\s'.-]+$/u;
const phonePattern = /^\+?[0-9]{9,15}$/;

const normalizeDigits = (text) =>
    text.replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632));

const getErrorBox = (input) => {
    let box = document.getElementById(input.id + "-error");
    if (!box) {
        box = document.createElement("p");
        box.id = input.id + "-error";
        box.className = "field-error";
        box.setAttribute("role", "alert");
        box.hidden = true;
        input.insertAdjacentElement("afterend", box);
        input.setAttribute("aria-describedby", box.id);
    }
    return box;
};

const showFieldError = (input, message) => {
    const box = getErrorBox(input);
    box.textContent = message;
    box.hidden = !message;
    input.classList.toggle("input-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
};

const clearFieldError = (input) => {
    if (document.getElementById(input.id + "-error")) {
        showFieldError(input, "");
    }
};

const getFormMessageBox = (form) => {
    let box = form.querySelector(".form-message");
    if (!box) {
        box = document.createElement("p");
        box.className = "form-message";
        box.setAttribute("role", "status");
        box.hidden = true;
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.insertAdjacentElement("beforebegin", box);
        } else {
            form.appendChild(box);
        }
    }
    return box;
};

const showFormMessage = (form, text, type) => {
    const box = getFormMessageBox(form);
    box.textContent = text;
    box.className = "form-message form-message-" + type;
    box.hidden = false;
};

const clearFormMessage = (form) => {
    const box = form.querySelector(".form-message");
    if (box) {
        box.hidden = true;
    }
};

const validateField = (form, rules, id) => {
    const input = form.querySelector("#" + id);
    if (!input) {
        return true;
    }
    const message = rules[id](input.value, form);
    showFieldError(input, message);
    return message === "";
};

const setupForm = (form, rules, successText, onSuccess) => {
    form.noValidate = true;
    const ids = Object.keys(rules);
    const touched = {};

    ids.forEach((id) => {
        const input = form.querySelector("#" + id);
        if (!input) {
            return;
        }
        input.addEventListener("blur", () => {
            touched[id] = true;
            validateField(form, rules, id);
        });
        input.addEventListener("input", () => {
            clearFormMessage(form);
            ids.forEach((otherId) => {
                if (touched[otherId]) {
                    validateField(form, rules, otherId);
                }
            });
        });
        input.addEventListener("change", () => {
            if (touched[id] || input.type === "file") {
                touched[id] = true;
                validateField(form, rules, id);
            }
        });
    });

    form.addEventListener("reset", () => {
        setTimeout(() => {
            ids.forEach((id) => {
                const input = form.querySelector("#" + id);
                touched[id] = false;
                if (input) {
                    clearFieldError(input);
                }
            });
            clearFormMessage(form);
        }, 0);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let firstInvalid = null;

        ids.forEach((id) => {
            touched[id] = true;
            const valid = validateField(form, rules, id);
            if (!valid && !firstInvalid) {
                firstInvalid = form.querySelector("#" + id);
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            showFormMessage(form, "يرجى تصحيح الحقول المحددة ثم المحاولة مرة أخرى.", "error");
            return;
        }

        if (!demoMode) {
            form.submit();
            return;
        }

        const customText = onSuccess ? onSuccess(form) : "";
        showFormMessage(form, customText || successText, "success");
    });
};

const validateEmail = (value) => {
    const email = value.trim();
    if (!email) {
        return "يرجى إدخال البريد الإلكتروني.";
    }
    if (!emailPattern.test(email)) {
        return "صيغة البريد الإلكتروني غير صحيحة.";
    }
    return "";
};

const validatePhone = (value) => {
    const phone = normalizeDigits(value).replace(/[\s-]/g, "");
    if (!phone) {
        return "يرجى إدخال رقم الهاتف.";
    }
    if (!phonePattern.test(phone)) {
        return "رقم الهاتف غير صحيح، أدخل من 9 إلى 15 رقمًا.";
    }
    return "";
};

const validateFullName = (value) => {
    const name = value.trim();
    if (!name) {
        return "يرجى إدخال الاسم الكامل.";
    }
    if (!namePattern.test(name)) {
        return "يجب أن يحتوي الاسم على حروف فقط.";
    }
    if (name.split(/\s+/).length < 2) {
        return "يرجى إدخال الاسم الأول والأخير على الأقل.";
    }
    return "";
};

const validateNewPassword = (value) => {
    if (!value) {
        return "يرجى إدخال كلمة المرور.";
    }
    if (value.length < 8) {
        return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
    }
    if (!/\p{L}/u.test(value) || !/[0-9\u0660-\u0669]/.test(value)) {
        return "يجب أن تحتوي كلمة المرور على حروف وأرقام.";
    }
    return "";
};

const validateConfirmPassword = (value, form) => {
    if (!value) {
        return "يرجى تأكيد كلمة المرور.";
    }
    if (value !== form.querySelector("#password").value) {
        return "كلمتا المرور غير متطابقتين.";
    }
    return "";
};

const validateLoginPassword = (value) => {
    if (!value) {
        return "يرجى إدخال كلمة المرور.";
    }
    return "";
};

const confirmPasswordInput = document.getElementById("confirmPassword");
const registerForm = confirmPasswordInput ? confirmPasswordInput.closest("form") : null;

if (registerForm) {
    setupForm(
        registerForm,
        {
            fullName: validateFullName,
            email: validateEmail,
            phone: validatePhone,
            password: validateNewPassword,
            confirmPassword: validateConfirmPassword
        },
        "تم التحقق من البيانات بنجاح. إنشاء الحساب وحفظه سيُنفذان لاحقًا عند ربط النظام بالخادم."
    );
}

const userTypeInput = document.getElementById("userType");
const loginForm = userTypeInput ? userTypeInput.closest("form") : null;

if (loginForm) {
    setupForm(
        loginForm,
        {
            email: validateEmail,
            password: validateLoginPassword
        },
        "تم التحقق من البيانات بنجاح. تسجيل الدخول الفعلي سيُنفذ لاحقًا عند ربط النظام بالخادم."
    );
}

const zakatConfig = {
    nisabYear: 2025,
    nisabMoneySdg: 35700000,
    nisabGoldGrams: 85,
    nisabSilverGrams: 595,
    nisabCropsKg: 653,
    zakatRate: 0.025,
    hawlMonths: 12,
    goldSpotUsdPerGram24: 134.63,
    goldSpotDate: "12 أكتوبر 2026",
    goldMarketSdgPerGram21: 1075000,
    goldMarketDate: "20 أكتوبر 2026"
};

const goldSdgPerGram21 = zakatConfig.nisabMoneySdg / zakatConfig.nisabGoldGrams;
const goldUsdPerGram21 = zakatConfig.goldSpotUsdPerGram24 * 21 / 24;
const nisabMoneyUsd = goldUsdPerGram21 * zakatConfig.nisabGoldGrams;

const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

const currencyName = (currency) => (currency === "usd" ? "دولار أمريكي" : "جنيه سوداني");

const nisabFor = (currency) => (currency === "usd" ? nisabMoneyUsd : zakatConfig.nisabMoneySdg);

const nisabNote = (currency) => {
    if (currency === "usd") {
        return "النصاب بالدولار تقدير يعادل 85 جرامًا من الذهب عيار 21 بحسب سعر الذهب العالمي بتاريخ " +
            zakatConfig.goldSpotDate + " (نحو " + formatNumber(nisabMoneyUsd) + " دولار)، ولا ينشره الديوان رسميًا بالدولار.";
    }
    return "النصاب المعتمد " + formatNumber(zakatConfig.nisabMoneySdg) +
        " جنيه سوداني، وهو نصاب زكاة المال للعام " + zakatConfig.nisabYear + " المنشور في موقع ديوان الزكاة السوداني.";
};

const marketNisabSdg = zakatConfig.goldMarketSdgPerGram21 * zakatConfig.nisabGoldGrams;

const marketGapNote = (amount, currency) => {
    if (currency !== "sdg" || amount < zakatConfig.nisabMoneySdg || amount >= marketNisabSdg) {
        return null;
    }
    return "تنبيه: المبلغ بلغ نصاب الديوان المنشور (" + formatNumber(zakatConfig.nisabMoneySdg) +
        " جنيه للعام " + zakatConfig.nisabYear + ") لكنه أقل من قيمة 85 جرامًا من الذهب عيار 21 بسعر السوق التأشيري الحالي (نحو " +
        formatNumber(marketNisabSdg) + " جنيه بتاريخ " + zakatConfig.goldMarketDate +
        ")، وهو سعر غير رسمي. فإن كان الحكم عندك بسعر اليوم فقد لا تجب الزكاة، فراجع ديوان الزكاة قبل الإخراج.";
};

const withMarketGap = (notes, amount, currency) => {
    const gap = marketGapNote(amount, currency);
    return gap ? [gap].concat(notes) : notes;
};

const generalNote = "هذه الحاسبة إرشادية ولا تغني عن سؤال أهل العلم أو مراجعة ديوان الزكاة.";

const noHawlResult = () => ({
    headline: "لا زكاة عليك الآن؛ لأن الحول لم يكتمل بعد.",
    notes: ["تجب الزكاة في هذا النوع بعد مرور حول هجري كامل (12 شهرًا هجريًا) على بلوغ النصاب.", generalNote]
});

const countPhrase = (count, forms) => {
    if (count === 1) {
        return forms[0];
    }
    if (count === 2) {
        return forms[1];
    }
    if (count <= 10) {
        return count + " " + forms[2];
    }
    return count + " " + forms[3];
};

const animalForms = {
    sheep: ["شاة واحدة", "شاتان", "شياه", "شاة"],
    bintMakhad: ["بنت مخاض", "بنتا مخاض", "بنات مخاض", "بنت مخاض"],
    bintLabun: ["بنت لبون", "بنتا لبون", "بنات لبون", "بنت لبون"],
    hiqqa: ["حقة", "حقتان", "حقات", "حقة"],
    jadha: ["جذعة", "جذعتان", "جذعات", "جذعة"],
    tabi: ["تبيع", "تبيعان", "أتبعة", "تبيع"],
    musinna: ["مسنة", "مسنتان", "مسنات", "مسنة"]
};

const describeParts = (parts) =>
    parts
        .filter((part) => part.count > 0)
        .map((part) => countPhrase(part.count, animalForms[part.kind]))
        .join(" و");

const bestCombinations = (count, sizeA, sizeB, kindA, kindB) => {
    let best = 0;
    let found = [];
    for (let a = 0; a * sizeA <= count; a += 1) {
        const b = Math.floor((count - a * sizeA) / sizeB);
        const total = a * sizeA + b * sizeB;
        if (total > best) {
            best = total;
            found = [[a, b]];
        } else if (total === best) {
            found.push([a, b]);
        }
    }
    return found.map(([a, b]) =>
        describeParts([
            { kind: kindA, count: a },
            { kind: kindB, count: b }
        ])
    );
};

const camelDue = (count) => {
    if (count < 5) {
        return "";
    }
    if (count <= 9) {
        return describeParts([{ kind: "sheep", count: 1 }]);
    }
    if (count <= 14) {
        return describeParts([{ kind: "sheep", count: 2 }]);
    }
    if (count <= 19) {
        return describeParts([{ kind: "sheep", count: 3 }]);
    }
    if (count <= 24) {
        return describeParts([{ kind: "sheep", count: 4 }]);
    }
    if (count <= 35) {
        return describeParts([{ kind: "bintMakhad", count: 1 }]);
    }
    if (count <= 45) {
        return describeParts([{ kind: "bintLabun", count: 1 }]);
    }
    if (count <= 60) {
        return describeParts([{ kind: "hiqqa", count: 1 }]);
    }
    if (count <= 75) {
        return describeParts([{ kind: "jadha", count: 1 }]);
    }
    if (count <= 90) {
        return describeParts([{ kind: "bintLabun", count: 2 }]);
    }
    if (count <= 120) {
        return describeParts([{ kind: "hiqqa", count: 2 }]);
    }
    return bestCombinations(count, 50, 40, "hiqqa", "bintLabun").join(" أو ");
};

const cattleDue = (count) => {
    if (count < 30) {
        return "";
    }
    return bestCombinations(count, 30, 40, "tabi", "musinna").join(" أو ");
};

const sheepDue = (count) => {
    if (count < 40) {
        return "";
    }
    let sheep = 1;
    if (count > 120) {
        sheep = 2;
    }
    if (count > 200) {
        sheep = 3;
    }
    if (count >= 400) {
        sheep = Math.floor(count / 100);
    }
    return describeParts([{ kind: "sheep", count: sheep }]);
};

const livestockNisab = { camels: 5, cattle: 30, sheep: 40 };
const livestockDue = { camels: camelDue, cattle: cattleDue, sheep: sheepDue };
const livestockName = { camels: "الإبل", cattle: "الأبقار", sheep: "الغنم" };

const calcMoney = (values) => {
    if (values.months < zakatConfig.hawlMonths) {
        return noHawlResult();
    }
    const nisab = nisabFor(values.currency);
    if (values.amount < nisab) {
        return {
            headline: "لا زكاة عليك؛ لأن المال لم يبلغ النصاب.",
            notes: [nisabNote(values.currency), generalNote]
        };
    }
    const zakat = values.amount * zakatConfig.zakatRate;
    return {
        headline: formatNumber(zakat) + " " + currencyName(values.currency) + " (2.5% من " + formatNumber(values.amount) + ").",
        notes: withMarketGap([nisabNote(values.currency), generalNote], values.amount, values.currency)
    };
};

const calcTrade = (values) => {
    if (values.hawl !== "yes") {
        return noHawlResult();
    }
    const base = values.goods + values.cash + values.debts;
    const nisab = nisabFor(values.currency);
    const notes = [
        "الوعاء المحسوب: البضائع + النقد + الديون المستحقة لك = " + formatNumber(base) + " " + currencyName(values.currency) + ".",
        "تُحتسب الديون المستحقة لك إذا كان تحصيلها مرجوًا، وتُخصم الالتزامات التي عليك وفق لوائح الديوان، وهذه الحاسبة لا تخصمها.",
        nisabNote(values.currency),
        generalNote
    ];
    if (base < nisab) {
        return { headline: "لا زكاة عليك؛ لأن المجموع لم يبلغ النصاب.", notes };
    }
    return {
        headline: formatNumber(base * zakatConfig.zakatRate) + " " + currencyName(values.currency) + " (2.5% من الوعاء).",
        notes: withMarketGap(notes, base, values.currency)
    };
};

const calcStocks = (values) => {
    if (values.hawl !== "yes") {
        return noHawlResult();
    }
    const nisab = nisabFor(values.currency);
    const notes = [
        "تُعامل الأوراق المالية ذات القيمة النقدية معاملة النقود في قانون الزكاة السوداني، والمحسوب هنا على قيمة الاستثمار الكلية دون النظر لعدد الأسهم.",
        nisabNote(values.currency),
        "إن كان الاستثمار أصلًا ثابتًا يدرّ دخلًا ولا يُتاجر فيه فقد يُزكّى صافي دخله بدل أصله، فراجع الديوان في ذلك.",
        generalNote
    ];
    if (values.value < nisab) {
        return { headline: "لا زكاة عليك؛ لأن القيمة لم تبلغ النصاب.", notes };
    }
    return {
        headline: formatNumber(values.value * zakatConfig.zakatRate) + " " + currencyName(values.currency) + " (2.5% من القيمة).",
        notes: withMarketGap(notes, values.value, values.currency)
    };
};

const calcMetal = (values) => {
    if (values.use === "jewelry") {
        return {
            headline: "لا زكاة في الحلي المباح المعد للاستعمال الشخصي بحسب قانون الزكاة السوداني.",
            notes: [
                "المادة 20 من قانون الزكاة لسنة 2001 توجب الزكاة في الذهب والفضة من غير الحلي.",
                "من العلماء من يوجبها في الحلي، فإن أردت الاحتياط فاسأل أهل العلم أو الديوان.",
                generalNote
            ]
        };
    }
    if (values.hawl !== "yes") {
        return noHawlResult();
    }
    if (values.type === "gold") {
        const equivalent21 = values.weight * values.purity / 21;
        if (equivalent21 < zakatConfig.nisabGoldGrams) {
            return {
                headline: "لا زكاة عليك؛ لأن الذهب لم يبلغ النصاب.",
                notes: [
                    "وزنك يعادل " + formatNumber(equivalent21) + " جرام عيار 21، والنصاب " + zakatConfig.nisabGoldGrams + " جرامًا عيار 21 بحسب اعتماد الديوان.",
                    generalNote
                ]
            };
        }
        const zakatGrams = values.weight * zakatConfig.zakatRate;
        const zakat21 = equivalent21 * zakatConfig.zakatRate;
        return {
            headline: formatNumber(zakatGrams) + " جرام من الذهب عيار " + formatNumber(values.purity) + " (2.5% من وزنه).",
            notes: [
                "قيمتها التقريبية " + formatNumber(zakat21 * goldSdgPerGram21) + " جنيه سوداني، محسوبة من سعر جرام عيار 21 المشتق من نصاب الديوان (" + formatNumber(goldSdgPerGram21) + " جنيه)، أو نحو " + formatNumber(zakat21 * goldUsdPerGram21) + " دولار بسعر الذهب العالمي.",
                "النصاب 85 جرامًا من الذهب عيار 21 كما يعتمده الديوان في تقدير نصاب المال.",
                generalNote
            ]
        };
    }
    const pureSilver = values.weight * values.purity / 1000;
    if (pureSilver < zakatConfig.nisabSilverGrams) {
        return {
            headline: "لا زكاة عليك؛ لأن الفضة لم تبلغ النصاب.",
            notes: [
                "الفضة الخالصة في وزنك " + formatNumber(pureSilver) + " جرام، والنصاب " + zakatConfig.nisabSilverGrams + " جرامًا.",
                generalNote
            ]
        };
    }
    return {
        headline: formatNumber(values.weight * zakatConfig.zakatRate) + " جرام من الفضة (2.5% من وزنها).",
        notes: [
            "النصاب 595 جرامًا من الفضة الخالصة، وقد حُسب العيار بالألف.",
            generalNote
        ]
    };
};

const computeCrops = (values) => {
    if (values.quantity < zakatConfig.nisabCropsKg) {
        return {
            headline: "لا زكاة عليك؛ لأن المحصول لم يبلغ النصاب.",
            notes: [
                "نصاب الزروع والثمار 653 كجم بحسب المادة 24 من قانون الزكاة، ويُحسب بعد التنقية والجفاف.",
                generalNote
            ]
        };
    }
    const rates = { natural: 0.1, artificial: 0.05, mixed: 0.075 };
    const rate = rates[values.irrigation];
    const notes = [
        "الزكاة تجب عند الحصاد ولا يشترط لها الحول، وتؤخذ من أوسط المحصول.",
        "لا تُحسب فيها الكمية التي أكلها أهل الزرع وما أكلته الدواب العاملة وما وُهب للآكل أو أكله العابرون.",
        generalNote
    ];
    if (values.irrigation === "mixed") {
        notes.unshift("الري المختلط حُسب بـ 7.5% عند تساوي الري الطبيعي والصناعي، فإن غلب أحدهما فالواجب نسبة الغالب (10% أو 5%).");
    }
    return {
        headline: formatNumber(values.quantity * rate) + " كجم (" + formatNumber(rate * 100) + "% من " + formatNumber(values.quantity) + " كجم).",
        notes
    };
};

const calcLivestock = (values) => {
    if (values.hawl !== "yes") {
        return noHawlResult();
    }
    const name = livestockName[values.animal];
    const due = livestockDue[values.animal](values.count);
    const notes = [
        "تجب الزكاة في الأنعام السائمة التي ترعى من مرعاها، وتُعفى الأنعام العاملة في حرث الأرض.",
        "تُضم الذكور والإناث ويُحسب الصغار مع الكبار، لذلك لا تؤثر الفئة العمرية في وجوب الزكاة.",
        generalNote
    ];
    if (!due) {
        return {
            headline: "لا زكاة عليك؛ لأن عدد " + name + " لم يبلغ النصاب (" + livestockNisab[values.animal] + ").",
            notes
        };
    }
    return { headline: "الواجب في " + formatNumber(values.count) + " من " + name + ": " + due + ".", notes };
};

const processedProductPattern = /دقيق|طحين|خبز|عجين|زيت|سميد|نشا|رغيف|مطحون|معلب|مصنع|عصير|مربى|معجنات/;

const calcCrops = (values) => {
    const result = computeCrops(values);
    const extra = [];
    if (values.cropName) {
        if (processedProductPattern.test(values.cropName)) {
            extra.push("تنبيه: «" + values.cropName + "» منتج مصنّع، والزكاة تجب على الحب أو الثمر عند الحصاد. أدخل كمية المحصول قبل الطحن أو التصنيع، فوزن المنتج يختلف عن وزن الحب.");
        }
        extra.push("المحصول المُدخل: " + values.cropName + ". نوع المحصول لا يغيّر النصاب ولا النسبة، فالحساب يعتمد على الكمية وطريقة الري فقط.");
    }
    extra.push("تُضم الأصناف من الجنس الواحد وزروع السنة الواحدة بعضها إلى بعض لبلوغ النصاب (المادة 25).");
    result.notes = extra.concat(result.notes);
    return result;
};

const calcRules = {
    money: {
        moneyAmount: (value) => positiveNumberMessage(value, "قيمة المال"),
        moneyCurrency: (value) => selectMessage(value, "يرجى اختيار العملة."),
        moneyPeriod: (value) => nonNegativeMessage(value, "مدة امتلاك المال بالأشهر", true)
    },
    "gold-silver": {
        metalType: (value) => selectMessage(value, "يرجى اختيار نوع المعدن."),
        metalWeight: (value) => positiveNumberMessage(value, "الوزن"),
        metalPurity: (value, form) => {
            const base = positiveNumberMessage(value, "العيار");
            if (base) {
                return base;
            }
            const type = form.querySelector("#metalType").value;
            const purity = Number(value);
            if (type === "gold" && purity > 24) {
                return "عيار الذهب لا يزيد على 24.";
            }
            if (type === "silver" && purity > 1000) {
                return "عيار الفضة يُدخل بالألف ولا يزيد على 1000، مثل 925.";
            }
            return "";
        },
        metalUse: (value) => selectMessage(value, "يرجى اختيار طبيعة الاستعمال."),
        metalHawl: (value) => selectMessage(value, "يرجى تحديد هل مرّ حول كامل.")
    },
    crops: {
        cropType: (value) => {
            const name = value.trim();
            if (!name) {
                return "";
            }
            if (!/^[\p{L}\s'.-]+$/u.test(name)) {
                return "يجب أن يحتوي اسم المحصول على حروف فقط.";
            }
            return name.length > 40 ? "اسم المحصول لا يزيد على 40 حرفًا." : "";
        },
        cropQuantity: (value) => positiveNumberMessage(value, "كمية المحصول"),
        irrigationType: (value) => selectMessage(value, "يرجى اختيار طريقة الري.")
    },
    livestock: {
        animalType: (value) => selectMessage(value, "يرجى اختيار نوع الحيوان."),
        animalCount: (value) => {
            const base = positiveNumberMessage(value, "عدد الحيوانات");
            if (base) {
                return base;
            }
            return Number.isInteger(Number(value)) ? "" : "يجب أن يكون العدد عددًا صحيحًا.";
        },
        animalHawl: (value) => selectMessage(value, "يرجى تحديد هل مرّ حول كامل.")
    },
    trade: {
        goodsValue: (value, form) => {
            const base = nonNegativeMessage(value, "قيمة البضائع", true);
            if (base) {
                return base;
            }
            const total = ["goodsValue", "tradeCash", "tradeDebts"].reduce(
                (sum, id) => sum + Number(form.querySelector("#" + id).value || 0),
                0
            );
            return total > 0 ? "" : "يجب أن يكون مجموع البضائع والنقد والديون أكبر من صفر.";
        },
        tradeCash: (value) => nonNegativeMessage(value, "قيمة النقد", false),
        tradeDebts: (value) => nonNegativeMessage(value, "قيمة الديون", false),
        tradeCurrency: (value) => selectMessage(value, "يرجى اختيار العملة."),
        tradeHawl: (value) => selectMessage(value, "يرجى تحديد هل مرّ حول كامل.")
    },
    stocks: {
        investmentType: (value) => selectMessage(value, "يرجى اختيار نوع الاستثمار."),
        investmentValue: (value) => positiveNumberMessage(value, "قيمة الاستثمار"),
        shareCount: (value) => nonNegativeMessage(value, "عدد الأسهم", false),
        investmentCurrency: (value) => selectMessage(value, "يرجى اختيار العملة."),
        investmentHawl: (value) => selectMessage(value, "يرجى تحديد هل مرّ حول كامل.")
    }
};

function positiveNumberMessage(value, label) {
    if (value.trim() === "") {
        return "يرجى إدخال " + label + ".";
    }
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
        return "يجب أن تكون " + label + " أكبر من صفر.";
    }
    return "";
}

function nonNegativeMessage(value, label, required) {
    if (value.trim() === "") {
        return required ? "يرجى إدخال " + label + "." : "";
    }
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
        return "لا يمكن أن تكون " + label + " سالبة.";
    }
    return "";
}

function selectMessage(value, message) {
    return value ? "" : message;
}

const calcTypeAnchors = {
    money: "moneyAmount",
    "gold-silver": "metalType",
    crops: "cropType",
    livestock: "animalType",
    trade: "goodsValue",
    stocks: "investmentType"
};

const readValues = (type) => {
    const text = (id) => document.getElementById(id).value;
    const number = (id) => Number(text(id) || 0);
    if (type === "money") {
        return { amount: number("moneyAmount"), currency: text("moneyCurrency"), months: number("moneyPeriod") };
    }
    if (type === "gold-silver") {
        return {
            type: text("metalType"),
            weight: number("metalWeight"),
            purity: number("metalPurity"),
            use: text("metalUse"),
            hawl: text("metalHawl")
        };
    }
    if (type === "crops") {
        return {
            cropName: text("cropType").trim(),
            quantity: number("cropQuantity"),
            irrigation: text("irrigationType")
        };
    }
    if (type === "livestock") {
        return { animal: text("animalType"), count: number("animalCount"), hawl: text("animalHawl") };
    }
    if (type === "trade") {
        return {
            goods: number("goodsValue"),
            cash: number("tradeCash"),
            debts: number("tradeDebts"),
            currency: text("tradeCurrency"),
            hawl: text("tradeHawl")
        };
    }
    return {
        value: number("investmentValue"),
        currency: text("investmentCurrency"),
        hawl: text("investmentHawl")
    };
};

const calculators = {
    money: calcMoney,
    "gold-silver": calcMetal,
    crops: calcCrops,
    livestock: calcLivestock,
    trade: calcTrade,
    stocks: calcStocks
};

const zakatTypeSelect = document.getElementById("zakatType");
const zakatResult = document.getElementById("zakatResult");
const calculatorForm = zakatTypeSelect ? zakatTypeSelect.closest("form") : null;

if (calculatorForm && zakatResult) {
    calculatorForm.noValidate = true;
    zakatResult.setAttribute("aria-live", "polite");

    const sectionOf = (id) => document.getElementById(id).closest("section");

    const renderResult = (headline, notes) => {
        zakatResult.textContent = "";
        const label = document.createElement("strong");
        label.textContent = "قيمة الزكاة:";
        zakatResult.appendChild(label);
        zakatResult.appendChild(document.createTextNode(" " + headline));

        let notesBox = document.getElementById("zakatNotes");
        if (!notesBox) {
            notesBox = document.createElement("div");
            notesBox.id = "zakatNotes";
            zakatResult.insertAdjacentElement("afterend", notesBox);
        }
        notesBox.textContent = "";
        notes.forEach((text) => {
            const note = document.createElement("p");
            note.className = "result-note";
            note.textContent = text;
            notesBox.appendChild(note);
        });
    };

    const resetResult = () => {
        renderResult("سيتم حسابها لاحقًا.", []);
    };

    const updateVisibility = () => {
        Object.keys(calcTypeAnchors).forEach((type) => {
            const section = sectionOf(calcTypeAnchors[type]);
            const divider = section.previousElementSibling;
            const visible = zakatTypeSelect.value === type;
            section.hidden = !visible;
            if (divider && divider.tagName === "HR") {
                divider.hidden = !visible;
            }
            if (!visible) {
                section.querySelectorAll("input, select").forEach(clearFieldError);
            }
        });
    };

    const currentRules = () => calcRules[zakatTypeSelect.value] || {};

    zakatTypeSelect.addEventListener("change", () => {
        clearFieldError(zakatTypeSelect);
        clearFormMessage(calculatorForm);
        updateVisibility();
    });

    calculatorForm.addEventListener("input", (event) => {
        const rules = currentRules();
        const id = event.target.id;
        clearFormMessage(calculatorForm);
        if (rules[id] && event.target.classList.contains("input-error")) {
            validateField(calculatorForm, rules, id);
        }
        if (id === "metalType" && document.getElementById("metalPurity").classList.contains("input-error")) {
            validateField(calculatorForm, rules, "metalPurity");
        }
    });

    calculatorForm.addEventListener("change", (event) => {
        const rules = currentRules();
        const id = event.target.id;
        if (rules[id] && event.target.classList.contains("input-error")) {
            validateField(calculatorForm, rules, id);
        }
    });

    calculatorForm.addEventListener("reset", () => {
        setTimeout(() => {
            calculatorForm.querySelectorAll("input, select").forEach(clearFieldError);
            clearFormMessage(calculatorForm);
            updateVisibility();
            resetResult();
        }, 0);
    });

    calculatorForm.addEventListener("submit", (event) => {
        event.preventDefault();
        clearFormMessage(calculatorForm);

        const type = zakatTypeSelect.value;
        if (!type) {
            showFieldError(zakatTypeSelect, "يرجى اختيار نوع الزكاة.");
            zakatTypeSelect.focus();
            showFormMessage(calculatorForm, "يرجى اختيار نوع الزكاة أولًا.", "error");
            return;
        }

        const rules = calcRules[type];
        let firstInvalid = null;
        Object.keys(rules).forEach((id) => {
            const valid = validateField(calculatorForm, rules, id);
            if (!valid && !firstInvalid) {
                firstInvalid = document.getElementById(id);
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            showFormMessage(calculatorForm, "يرجى تصحيح الحقول المحددة ثم المحاولة مرة أخرى.", "error");
            return;
        }

        const outcome = calculators[type](readValues(type));
        renderResult(outcome.headline, outcome.notes);
        showFormMessage(calculatorForm, "تم الحساب، وتجد النتيجة في قسم «نتيجة الحساب».", "success");
        zakatResult.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    updateVisibility();
}

const normalizeArabic = (text) =>
    normalizeDigits(text)
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ")
        .trim();

const validateRequestNumber = (value) => {
    const number = normalizeDigits(value.trim());
    if (!number) {
        return "يرجى إدخال رقم الطلب.";
    }
    if (!/^[A-Za-z0-9-]{3,20}$/.test(number)) {
        return "رقم الطلب غير صحيح، استخدم أرقامًا أو حروفًا إنجليزية فقط.";
    }
    return "";
};

const longTextRule = (label, min, max) => (value) => {
    const text = value.trim();
    if (!text) {
        return "يرجى إدخال " + label + ".";
    }
    if (text.length < min) {
        return "يجب ألا يقل " + label + " عن " + min + " أحرف.";
    }
    if (text.length > max) {
        return "يجب ألا يزيد " + label + " على " + max + " حرف.";
    }
    return "";
};

const validateDocument = (value, form) => {
    const input = form.querySelector("#document");
    if (!input || !input.files || input.files.length === 0) {
        return "";
    }
    const file = input.files[0];
    const extension = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "jpg", "jpeg", "png"].includes(extension)) {
        return "نوع الملف غير مدعوم، المسموح: PDF أو JPG أو PNG.";
    }
    if (file.size > 5 * 1024 * 1024) {
        return "حجم الملف يجب ألا يزيد على 5 ميجابايت.";
    }
    return "";
};

const findDataTable = (input) => {
    const section = input.closest("section");
    const local = section ? section.querySelector("table:has(thead)") : null;
    return local || document.querySelector("main table:has(thead)");
};

const showTableMessage = (table, text) => {
    let box = table.previousElementSibling;
    if (!box || !box.classList.contains("table-message")) {
        box = document.createElement("p");
        box.className = "form-message form-message-success table-message";
        box.setAttribute("role", "status");
        table.insertAdjacentElement("beforebegin", box);
    }
    box.textContent = text;
    box.hidden = false;
    clearTimeout(box.hideTimer);
    box.hideTimer = setTimeout(() => {
        box.hidden = true;
    }, 7000);
};

const filterTable = (table, query) => {
    const text = normalizeArabic(query);
    const rows = Array.from(table.querySelectorAll("tbody tr:not(.no-results)"));
    let visible = 0;
    rows.forEach((row) => {
        const rowText = Array.from(row.cells)
            .filter((cell) => !cell.querySelector("button"))
            .map((cell) => cell.textContent)
            .join(" ");
        const match = !text || normalizeArabic(rowText).includes(text);
        row.hidden = !match;
        if (match) {
            visible += 1;
        }
    });

    let empty = table.querySelector("tbody tr.no-results");
    if (!empty) {
        empty = document.createElement("tr");
        empty.className = "no-results";
        const cell = document.createElement("td");
        cell.colSpan = table.querySelectorAll("thead th").length || 1;
        cell.textContent = "لا توجد نتائج مطابقة للبحث.";
        empty.appendChild(cell);
        table.tBodies[0].appendChild(empty);
    }
    empty.hidden = visible > 0;
};

const setupTableSearch = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) {
        return;
    }
    const form = input.closest("form");
    const table = findDataTable(input);
    if (!table) {
        return;
    }
    input.addEventListener("input", () => filterTable(table, input.value));
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            filterTable(table, input.value);
        });
        form.addEventListener("reset", () => {
            setTimeout(() => filterTable(table, ""), 0);
        });
    }
};

const addEmployeeRow = (form) => {
    const table = document.querySelector("main table:has(thead)");
    if (!table) {
        return "";
    }
    const read = (id) => form.querySelector("#" + id).value.trim();
    const labelOf = (id) => {
        const select = form.querySelector("#" + id);
        return select.options[select.selectedIndex].textContent.replace(/\s+/g, " ").trim();
    };
    const active = read("employeeStatus") !== "inactive";

    const row = document.createElement("tr");
    [
        normalizeDigits(read("employeeId")),
        read("employeeName"),
        normalizeDigits(read("employeePhone")),
        labelOf("jobTitle"),
        labelOf("department"),
        labelOf("permission")
    ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "status " + (active ? "status-active" : "status-inactive");
    badge.textContent = active ? "نشط" : "غير نشط";
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    const actionsCell = document.createElement("td");
    [
        ["عرض", ""],
        ["تعديل", ""],
        [active ? "تعطيل" : "تفعيل", "btn-warning"],
        ["حذف", "btn-danger"]
    ].forEach(([label, className]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        if (className) {
            button.className = className;
        }
        actionsCell.appendChild(button);
    });
    row.appendChild(actionsCell);

    table.tBodies[0].appendChild(row);
    return "تمت إضافة الموظف إلى القائمة في العرض التجريبي، وسيُحفظ نهائيًا عند ربط النظام بقاعدة البيانات.";
};

const requestSearchInput = document.getElementById("requestNumber");
const requestSearchForm = requestSearchInput ? requestSearchInput.closest("form") : null;

if (requestSearchForm) {
    setupForm(
        requestSearchForm,
        { requestNumber: validateRequestNumber },
        "تم التحقق من رقم الطلب. عرض حالة الطلب سيُنفذ لاحقًا عند ربط النظام بقاعدة البيانات."
    );
}

const updateRequestInput = document.getElementById("updateRequestNumber");
const updateStatusForm = updateRequestInput ? updateRequestInput.closest("form") : null;

if (updateStatusForm) {
    setupForm(
        updateStatusForm,
        {
            updateRequestNumber: validateRequestNumber,
            newStatus: (value) => selectMessage(value, "يرجى اختيار الحالة الجديدة."),
            statusNote: (value, form) => {
                const note = value.trim();
                if (form.querySelector("#newStatus").value === "rejected" && note.length < 10) {
                    return "يلزم توضيح سبب الرفض (10 أحرف على الأقل).";
                }
                return note.length > 500 ? "الملاحظة لا تزيد على 500 حرف." : "";
            }
        },
        "تم التحقق من البيانات. حفظ تحديث الحالة سيُنفذ لاحقًا عند ربط النظام بقاعدة البيانات."
    );
}

const helpTypeInput = document.getElementById("helpType");
const assistanceForm = helpTypeInput ? helpTypeInput.closest("form") : null;

if (assistanceForm) {
    setupForm(
        assistanceForm,
        {
            fullName: validateFullName,
            phone: validatePhone,
            helpType: (value) => selectMessage(value, "يرجى اختيار نوع المساعدة."),
            socialStatus: (value) => selectMessage(value, "يرجى اختيار الحالة الاجتماعية."),
            familyMembers: (value) => {
                const base = positiveNumberMessage(value, "عدد أفراد الأسرة");
                if (base) {
                    return base;
                }
                const members = Number(value);
                return Number.isInteger(members) && members <= 50 ? "" : "أدخل عددًا صحيحًا لا يزيد على 50.";
            },
            income: (value) => nonNegativeMessage(value, "الدخل الشهري", true),
            description: longTextRule("وصف الحالة", 15, 1000),
            document: validateDocument
        },
        "تم التحقق من بيانات الطلب بنجاح. تقديم الطلب وحفظه سيُنفذان لاحقًا عند ربط النظام بقاعدة البيانات."
    );
}

const commentInput = document.getElementById("comment");
const contactForm = commentInput ? commentInput.closest("form") : null;

if (contactForm) {
    setupForm(
        contactForm,
        {
            fullName: validateFullName,
            email: validateEmail,
            comment: longTextRule("التعليق", 10, 1000)
        },
        "تم التحقق من رسالتك بنجاح. إرسالها سيُنفذ لاحقًا عند ربط النظام بالخادم."
    );
}

setupTableSearch("searchBeneficiary");
setupTableSearch("searchEmployee");

const employeeIdInput = document.getElementById("employeeId");
const employeeForm = employeeIdInput ? employeeIdInput.closest("form") : null;

if (employeeForm) {
    const todayText = () => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return now.getFullYear() + "-" + month + "-" + day;
    };

    setupForm(
        employeeForm,
        {
            employeeId: (value) => {
                const id = normalizeDigits(value.trim());
                if (!id) {
                    return "يرجى إدخال رقم الموظف.";
                }
                if (!/^[A-Za-z0-9-]{3,20}$/.test(id)) {
                    return "رقم الموظف غير صحيح، استخدم أرقامًا أو حروفًا إنجليزية فقط.";
                }
                const table = document.querySelector("main table:has(thead)");
                const exists = table && Array.from(table.querySelectorAll("tbody tr td:first-child"))
                    .some((cell) => normalizeDigits(cell.textContent.trim()) === id);
                return exists ? "رقم الموظف مستخدم مسبقًا." : "";
            },
            employeeName: validateFullName,
            employeePhone: validatePhone,
            employeeEmail: validateEmail,
            jobTitle: (value) => selectMessage(value, "يرجى اختيار المسمى الوظيفي."),
            department: (value) => selectMessage(value, "يرجى اختيار القسم."),
            permission: (value) => selectMessage(value, "يرجى اختيار الصلاحية."),
            hireDate: (value) => {
                if (!value) {
                    return "يرجى إدخال تاريخ التعيين.";
                }
                return value > todayText() ? "لا يمكن أن يكون تاريخ التعيين في المستقبل." : "";
            }
        },
        "تم التحقق من بيانات الموظف بنجاح.",
        addEmployeeRow
    );
}

document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !button.closest("td")) {
        return;
    }
    const row = button.closest("tr");
    const table = button.closest("table");

    if (button.classList.contains("btn-danger")) {
        if (!window.confirm("هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن العملية.")) {
            return;
        }
        row.remove();
        showTableMessage(table, "تم حذف السجل من العرض التجريبي، وسيصبح الحذف دائمًا عند ربط النظام بقاعدة البيانات.");
        return;
    }

    if (button.classList.contains("btn-warning")) {
        const badge = row.querySelector(".status");
        if (!badge) {
            return;
        }
        const active = badge.classList.contains("status-active");
        const question = active ? "هل تريد تعطيل هذا الموظف؟" : "هل تريد تفعيل هذا الموظف؟";
        if (!window.confirm(question)) {
            return;
        }
        badge.classList.toggle("status-active", !active);
        badge.classList.toggle("status-inactive", active);
        badge.textContent = active ? "غير نشط" : "نشط";
        button.textContent = active ? "تفعيل" : "تعطيل";
    }
});

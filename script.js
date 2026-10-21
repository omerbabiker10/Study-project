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

const setupForm = (form, rules, successText) => {
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

        showFormMessage(form, successText, "success");
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

const calcCrops = (values) => {
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
        return { quantity: number("cropQuantity"), irrigation: text("irrigationType") };
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

    const clearFieldError = (input) => {
        if (document.getElementById(input.id + "-error")) {
            showFieldError(input, "");
        }
    };

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

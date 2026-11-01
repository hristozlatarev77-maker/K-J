(function () {
  "use strict";

  var USERS_KEY = "kj_art_users";
  var SESSION_KEY = "kj_art_session";
  var PROMO_CODE = "KJ15";
  var PROMO_PERCENT = 15;
  var BASE_CARICATURE_PRICE = 80;

  function readUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: user.email,
        name: user.name,
        firstOrderPromo: !!user.firstOrderPromo,
        firstOrderUsed: !!user.firstOrderUsed,
        at: Date.now()
      })
    );
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function findUser(email) {
    email = (email || "").trim().toLowerCase();
    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        return users[i];
      }
    }
    return null;
  }

  function updateUser(email, patch) {
    var users = readUsers();
    email = (email || "").trim().toLowerCase();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        for (var key in patch) {
          if (Object.prototype.hasOwnProperty.call(patch, key)) {
            users[i][key] = patch[key];
          }
        }
        writeUsers(users);
        var session = getSession();
        if (session && session.email === email) {
          setSession(users[i]);
        }
        return users[i];
      }
    }
    return null;
  }

  function hashPassword(password) {
    var str = "kj|" + password + "|art";
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function clearFieldErrors(form) {
    var groups = form.querySelectorAll(".form-group");
    for (var i = 0; i < groups.length; i++) {
      groups[i].classList.remove("is-invalid");
      var err = groups[i].querySelector(".error-msg");
      if (err) {
        err.textContent = "";
      }
    }
  }

  function setFieldError(form, fieldName, message) {
    var field = form.elements.namedItem(fieldName);
    if (!field) {
      return;
    }
    var group = field.closest(".form-group");
    if (!group) {
      return;
    }
    group.classList.add("is-invalid");
    var err = group.querySelector(".error-msg");
    if (err) {
      err.textContent = message;
    }
  }

  function register(name, email, password, passwordConfirm) {
    var errors = {};
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    password = password || "";
    passwordConfirm = passwordConfirm || "";

    if (!name) {
      errors.name = "Моля, въведете име.";
    } else if (name.length < 2) {
      errors.name = "Името трябва да е поне 2 символа.";
    }

    if (!email) {
      errors.email = "Моля, въведете имейл.";
    } else if (!validateEmail(email)) {
      errors.email = "Въведете валиден имейл (напр. ime@example.com).";
    }

    if (!password) {
      errors.password = "Моля, въведете парола.";
    } else if (password.length < 6) {
      errors.password = "Паролата трябва да е поне 6 символа.";
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = "Моля, повторете паролата.";
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = "Паролите не съвпадат.";
    }

    if (Object.keys(errors).length) {
      return { ok: false, errors: errors };
    }

    if (findUser(email)) {
      return {
        ok: false,
        errors: {
          email: "Този имейл вече е регистриран. Моля, влезте с този профил или използвайте друг имейл."
        }
      };
    }

    var user = {
      name: name,
      email: email,
      password: hashPassword(password),
      firstOrderPromo: true,
      firstOrderUsed: false,
      promoCode: PROMO_CODE
    };
    var users = readUsers();
    users.push(user);
    writeUsers(users);
    /* Do not auto-login — user continues to login after seeing KJ15 */
    return { ok: true, user: user, promoCode: PROMO_CODE };
  }

  function login(email, password) {
    var errors = {};
    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!email) {
      errors.email = "Моля, въведете имейл.";
    } else if (!validateEmail(email)) {
      errors.email = "Невалиден формат на имейла.";
    }

    if (!password) {
      errors.password = "Моля, въведете парола.";
    }

    if (Object.keys(errors).length) {
      return { ok: false, errors: errors };
    }

    var user = findUser(email);
    if (!user || user.password !== hashPassword(password)) {
      return {
        ok: false,
        errors: { password: "Грешен имейл или парола." },
        message: "Грешен имейл или парола."
      };
    }

    setSession(user);
    return { ok: true, user: user };
  }

  function logout() {
    clearSession();
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function canUseFirstOrderPromo() {
    var session = getSession();
    if (!session) {
      return false;
    }
    var user = findUser(session.email);
    if (!user) {
      return false;
    }
    return !!user.firstOrderPromo && !user.firstOrderUsed;
  }

  function validatePromoCode(code, topic) {
    code = (code || "").trim().toUpperCase();
    if (!code) {
      return { ok: false, message: "Въведете промо код." };
    }
    if (!isLoggedIn()) {
      return { ok: false, message: "Влезте в профила си, за да използвате промо код." };
    }
    if (code !== PROMO_CODE) {
      return { ok: false, message: "Невалиден промо код." };
    }
    if (!canUseFirstOrderPromo()) {
      return {
        ok: false,
        message: "Кодът KJ15 е само за първа поръчка и вече е използван или не е наличен."
      };
    }
    if (topic !== "caricature") {
      return {
        ok: false,
        message: "KJ15 важи само за поръчка с тема „Карикатура“."
      };
    }
    var discounted = Math.round(BASE_CARICATURE_PRICE * (1 - PROMO_PERCENT / 100) * 100) / 100;
    return {
      ok: true,
      code: PROMO_CODE,
      percent: PROMO_PERCENT,
      basePrice: BASE_CARICATURE_PRICE,
      finalPrice: discounted,
      message:
        "Приложен KJ15 (−15%). Базова цена " +
        BASE_CARICATURE_PRICE +
        " лв → " +
        discounted +
        " лв за първа карикатура."
    };
  }

  function markPromoUsed() {
    var session = getSession();
    if (!session) {
      return;
    }
    updateUser(session.email, { firstOrderUsed: true, firstOrderPromo: false });
  }

  function openAuthModal(tab) {
    var overlay = document.getElementById("auth-overlay");
    if (!overlay) {
      return;
    }
    closePromoModal(true);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    switchTab(tab || "login");
  }

  function closeAuthModal() {
    var overlay = document.getElementById("auth-overlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (!isPromoOpen()) {
      document.body.style.overflow = "";
    }
  }

  function switchTab(tab) {
    var loginPanel = document.getElementById("auth-panel-login");
    var registerPanel = document.getElementById("auth-panel-register");
    var loginTab = document.getElementById("auth-tab-login");
    var registerTab = document.getElementById("auth-tab-register");
    if (!loginPanel || !registerPanel) {
      return;
    }
    var isLogin = tab !== "register";
    loginPanel.hidden = !isLogin;
    registerPanel.hidden = isLogin;
    if (loginTab) {
      loginTab.classList.toggle("is-active", isLogin);
      loginTab.setAttribute("aria-selected", isLogin ? "true" : "false");
    }
    if (registerTab) {
      registerTab.classList.toggle("is-active", !isLogin);
      registerTab.setAttribute("aria-selected", !isLogin ? "true" : "false");
    }
  }

  var pendingLoginEmail = "";

  function isPromoOpen() {
    var overlay = document.getElementById("promo-overlay");
    return !!(overlay && overlay.classList.contains("is-open"));
  }

  function showPromoModal(promoCode, email) {
    var overlay = document.getElementById("promo-overlay");
    var codeEl = document.getElementById("promo-code-value");
    var codeField = document.getElementById("promo-code-field");
    pendingLoginEmail = email || "";
    closeAuthModal();
    if (!overlay) {
      return;
    }
    if (codeEl) {
      codeEl.textContent = promoCode || PROMO_CODE;
    }
    if (codeField) {
      codeField.value = promoCode || PROMO_CODE;
    }
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setCopyStatus("");
    var continueBtn = document.getElementById("promo-continue");
    if (continueBtn) {
      continueBtn.focus();
    }
  }

  function closePromoModal(keepBodyLock) {
    var overlay = document.getElementById("promo-overlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (!keepBodyLock) {
      var auth = document.getElementById("auth-overlay");
      if (!(auth && auth.classList.contains("is-open"))) {
        document.body.style.overflow = "";
      }
    }
  }

  function continueToLogin() {
    closePromoModal(true);
    openAuthModal("login");
    var loginForm = document.getElementById("login-form");
    if (loginForm) {
      clearFieldErrors(loginForm);
      if (pendingLoginEmail && loginForm.email) {
        loginForm.email.value = pendingLoginEmail;
      }
      if (loginForm.password) {
        loginForm.password.value = "";
        loginForm.password.focus();
      }
    }
  }

  var copyStatusTimer = null;

  function setCopyStatus(message) {
    var status = document.getElementById("promo-copy-status");
    var btn = document.getElementById("promo-copy-btn");
    if (status) {
      status.textContent = message || "";
    }
    if (btn) {
      btn.classList.toggle("is-copied", !!message);
    }
    if (copyStatusTimer) {
      clearTimeout(copyStatusTimer);
      copyStatusTimer = null;
    }
    if (message) {
      copyStatusTimer = setTimeout(function () {
        if (status) {
          status.textContent = "";
        }
        if (btn) {
          btn.classList.remove("is-copied");
        }
        copyStatusTimer = null;
      }, 1600);
    }
  }

  function copyPromoCode() {
    var codeField = document.getElementById("promo-code-field");
    var code = (codeField && codeField.value ? codeField.value : PROMO_CODE).trim() || PROMO_CODE;

    function onSuccess() {
      setCopyStatus("Копирано");
    }

    function fallbackCopy() {
      var input = codeField;
      var created = false;
      if (!input) {
        input = document.createElement("input");
        input.value = code;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        created = true;
      }
      input.focus();
      input.select();
      try {
        input.setSelectionRange(0, code.length);
      } catch (err) {
        /* ignore */
      }
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err2) {
        ok = false;
      }
      if (created && input.parentNode) {
        input.parentNode.removeChild(input);
      }
      if (ok) {
        onSuccess();
      } else {
        setCopyStatus("Копирането не успя");
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(onSuccess).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function updatePromoUI() {
    var box = document.getElementById("promo-box");
    var note = document.getElementById("promo-eligibility");
    if (!box) {
      return;
    }
    var session = getSession();
    if (!session) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    if (note) {
      if (canUseFirstOrderPromo()) {
        note.textContent =
          "Имате наличен код KJ15 (−15% за първа карикатура). Базова цена: " +
          BASE_CARICATURE_PRICE +
          " лв.";
      } else {
        note.textContent = "Промо кодът за първа поръчка вече е използван или не е наличен.";
      }
    }
    var result = document.getElementById("promo-result");
    if (result && !canUseFirstOrderPromo()) {
      result.textContent = "";
      result.classList.remove("is-ok", "is-bad");
    }
  }

  function updateAuthUI() {
    var session = getSession();
    var guest = document.querySelectorAll("[data-auth-guest]");
    var userBlocks = document.querySelectorAll("[data-auth-user]");
    var nameEls = document.querySelectorAll("[data-auth-name]");
    var i;

    for (i = 0; i < guest.length; i++) {
      guest[i].hidden = !!session;
    }
    for (i = 0; i < userBlocks.length; i++) {
      userBlocks[i].hidden = !session;
    }
    for (i = 0; i < nameEls.length; i++) {
      nameEls[i].textContent = session ? session.name : "";
    }

    var gate = document.getElementById("order-auth-gate");
    var form = document.getElementById("contact-form");
    if (gate) {
      gate.hidden = !!session;
    }
    if (form) {
      form.classList.toggle("is-locked", !session);
      if (session) {
        var nameInput = form.elements.namedItem("name");
        var emailInput = form.elements.namedItem("email");
        if (nameInput && !nameInput.value) {
          nameInput.value = session.name;
        }
        if (emailInput && !emailInput.value) {
          emailInput.value = session.email;
        }
      }
    }
    updatePromoUI();
  }

  window.KJAuth = {
    PROMO_CODE: PROMO_CODE,
    BASE_CARICATURE_PRICE: BASE_CARICATURE_PRICE,
    register: register,
    login: login,
    logout: logout,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    canUseFirstOrderPromo: canUseFirstOrderPromo,
    validatePromoCode: validatePromoCode,
    markPromoUsed: markPromoUsed,
    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,
    switchTab: switchTab,
    updateAuthUI: updateAuthUI,
    updatePromoUI: updatePromoUI,
    clearFieldErrors: clearFieldErrors,
    setFieldError: setFieldError
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateAuthUI();

    var overlay = document.getElementById("auth-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          closeAuthModal();
        }
      });
    }

    var closeBtn = document.getElementById("auth-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeAuthModal);
    }

    var promoDoneBtn = document.getElementById("promo-continue");
    if (promoDoneBtn) {
      promoDoneBtn.addEventListener("click", function () {
        continueToLogin();
      });
    }

    var promoCopyBtn = document.getElementById("promo-copy-btn");
    if (promoCopyBtn) {
      promoCopyBtn.addEventListener("click", function () {
        copyPromoCode();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (isPromoOpen()) {
          continueToLogin();
          return;
        }
        closeAuthModal();
      }
    });

    var loginTab = document.getElementById("auth-tab-login");
    var registerTab = document.getElementById("auth-tab-register");
    if (loginTab) {
      loginTab.addEventListener("click", function () {
        switchTab("login");
      });
    }
    if (registerTab) {
      registerTab.addEventListener("click", function () {
        switchTab("register");
      });
    }

    document.querySelectorAll("[data-open-auth]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openAuthModal(btn.getAttribute("data-open-auth") || "login");
      });
    });

    var logoutBtn = document.getElementById("auth-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        logout();
        updateAuthUI();
      });
    }

    var loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearFieldErrors(loginForm);
        var result = login(loginForm.email.value, loginForm.password.value);
        if (!result.ok) {
          if (result.errors) {
            Object.keys(result.errors).forEach(function (key) {
              setFieldError(loginForm, key, result.errors[key]);
            });
          }
          return;
        }
        loginForm.reset();
        closeAuthModal();
        updateAuthUI();
      });
    }

    var registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearFieldErrors(registerForm);
        var result = register(
          registerForm.name.value,
          registerForm.email.value,
          registerForm.password.value,
          registerForm.passwordConfirm ? registerForm.passwordConfirm.value : ""
        );
        if (!result.ok) {
          if (result.errors) {
            Object.keys(result.errors).forEach(function (key) {
              setFieldError(registerForm, key, result.errors[key]);
            });
            var firstKey = Object.keys(result.errors)[0];
            var firstField = registerForm.elements.namedItem(firstKey);
            if (firstField && firstField.focus) {
              firstField.focus();
            }
          }
          return;
        }
        var registeredEmail = result.user.email;
        registerForm.reset();
        showPromoModal(result.promoCode, registeredEmail);
      });
    }

    var applyPromoBtn = document.getElementById("apply-promo");
    var promoInput = document.getElementById("promo-code");
    var promoResult = document.getElementById("promo-result");
    var topicSelect = document.getElementById("topic");

    function refreshPromoPreview() {
      if (!promoInput || !promoResult) {
        return;
      }
      var code = promoInput.value.trim();
      if (!code) {
        promoResult.textContent = "";
        promoResult.classList.remove("is-ok", "is-bad");
        promoInput.dataset.applied = "";
        return;
      }
      var topic = topicSelect ? topicSelect.value : "";
      var check = validatePromoCode(code, topic);
      promoResult.textContent = check.message;
      promoResult.classList.toggle("is-ok", !!check.ok);
      promoResult.classList.toggle("is-bad", !check.ok);
      promoInput.dataset.applied = check.ok ? PROMO_CODE : "";
      if (check.ok) {
        promoInput.dataset.finalPrice = String(check.finalPrice);
        promoInput.dataset.basePrice = String(check.basePrice);
      } else {
        delete promoInput.dataset.finalPrice;
        delete promoInput.dataset.basePrice;
      }
    }

    if (applyPromoBtn) {
      applyPromoBtn.addEventListener("click", function () {
        refreshPromoPreview();
      });
    }
    if (promoInput) {
      promoInput.addEventListener("input", function () {
        promoInput.dataset.applied = "";
        if (promoResult) {
          promoResult.textContent = "";
          promoResult.classList.remove("is-ok", "is-bad");
        }
      });
    }
    if (topicSelect) {
      topicSelect.addEventListener("change", function () {
        if (promoInput && promoInput.value.trim()) {
          refreshPromoPreview();
        }
      });
    }
  });
})();

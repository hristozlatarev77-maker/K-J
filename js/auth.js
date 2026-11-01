(function () {
  "use strict";

  var USERS_KEY = "kj_art_users";
  var SESSION_KEY = "kj_art_session";

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
      JSON.stringify({ email: user.email, name: user.name, at: Date.now() })
    );
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /* Lightweight demo hash — coursework only, not real security */
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

  function register(name, email, password) {
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (name.length < 2) {
      return { ok: false, message: "Името трябва да е поне 2 символа." };
    }
    if (!validateEmail(email)) {
      return { ok: false, message: "Въведете валиден имейл." };
    }
    if (password.length < 6) {
      return { ok: false, message: "Паролата трябва да е поне 6 символа." };
    }

    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        return { ok: false, message: "Този имейл вече е регистриран." };
      }
    }

    var user = { name: name, email: email, password: hashPassword(password) };
    users.push(user);
    writeUsers(users);
    setSession(user);
    return { ok: true, user: user };
  }

  function login(email, password) {
    email = (email || "").trim().toLowerCase();
    password = password || "";
    if (!validateEmail(email) || password.length < 6) {
      return { ok: false, message: "Невалиден имейл или парола." };
    }
    var users = readUsers();
    var hashed = hashPassword(password);
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email && users[i].password === hashed) {
        setSession(users[i]);
        return { ok: true, user: users[i] };
      }
    }
    return { ok: false, message: "Грешен имейл или парола." };
  }

  function logout() {
    clearSession();
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function openAuthModal(tab) {
    var overlay = document.getElementById("auth-overlay");
    if (!overlay) {
      return;
    }
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
    document.body.style.overflow = "";
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
  }

  window.KJAuth = {
    register: register,
    login: login,
    logout: logout,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,
    switchTab: switchTab,
    updateAuthUI: updateAuthUI
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

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
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
        var err = document.getElementById("login-error");
        var result = login(loginForm.email.value, loginForm.password.value);
        if (!result.ok) {
          if (err) {
            err.textContent = result.message;
            err.parentElement.classList.add("is-invalid");
          }
          return;
        }
        if (err) {
          err.textContent = "";
          err.parentElement.classList.remove("is-invalid");
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
        var err = document.getElementById("register-error");
        var result = register(
          registerForm.name.value,
          registerForm.email.value,
          registerForm.password.value
        );
        if (!result.ok) {
          if (err) {
            err.textContent = result.message;
            err.parentElement.classList.add("is-invalid");
          }
          return;
        }
        if (err) {
          err.textContent = "";
          err.parentElement.classList.remove("is-invalid");
        }
        registerForm.reset();
        closeAuthModal();
        updateAuthUI();
      });
    }
  });
})();

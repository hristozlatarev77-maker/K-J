(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) {
    return;
  }

  var success = document.getElementById("form-success");

  function setError(group, message) {
    group.classList.add("is-invalid");
    var err = group.querySelector(".error-msg");
    if (err) {
      err.textContent = message;
    }
  }

  function clearError(group) {
    group.classList.remove("is-invalid");
    var err = group.querySelector(".error-msg");
    if (err) {
      err.textContent = "";
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function validatePhone(value) {
    if (!value) {
      return true;
    }
    return /^[+0-9\s()-]{7,20}$/.test(value);
  }

  form.addEventListener("input", function (event) {
    var field = event.target;
    var group = field.closest(".form-group, fieldset");
    if (group && group.classList.contains("is-invalid")) {
      clearError(group);
    }
    if (success) {
      success.classList.remove("is-visible");
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!window.KJAuth || !window.KJAuth.isLoggedIn()) {
      if (window.KJAuth && window.KJAuth.openAuthModal) {
        window.KJAuth.openAuthModal("login");
      }
      var gateMsg = document.getElementById("order-auth-message");
      if (gateMsg) {
        gateMsg.innerHTML =
          'Моля, <button type="button" class="btn-auth btn-auth-solid" data-open-auth="login">влезте</button> или <button type="button" class="btn-auth" data-open-auth="register">се регистрирайте</button>, за да изпратите поръчка.';
        document.querySelectorAll("#order-auth-gate [data-open-auth]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            window.KJAuth.openAuthModal(btn.getAttribute("data-open-auth") || "login");
          });
        });
      }
      return;
    }

    var valid = true;
    var groups = form.querySelectorAll(".form-group, fieldset.requires-choice");

    for (var i = 0; i < groups.length; i++) {
      clearError(groups[i]);
    }

    var name = form.elements.namedItem("name");
    var email = form.elements.namedItem("email");
    var phone = form.elements.namedItem("phone");
    var topic = form.elements.namedItem("topic");
    var message = form.elements.namedItem("message");
    var age = form.elements.namedItem("age");
    var website = form.elements.namedItem("website");
    var consent = form.elements.namedItem("consent");
    var promoInput = document.getElementById("promo-code");
    var promoGroup = promoInput ? promoInput.closest(".form-group") : null;

    if (!name.value || name.value.trim().length < 2) {
      setError(name.closest(".form-group"), "Моля, въведете име с поне 2 символа.");
      valid = false;
    }

    if (!email.value || !validateEmail(email.value.trim())) {
      setError(email.closest(".form-group"), "Въведете валиден имейл адрес.");
      valid = false;
    }

    if (!validatePhone(phone.value.trim())) {
      setError(phone.closest(".form-group"), "Телефонът съдържа невалидни символи.");
      valid = false;
    }

    if (!topic.value) {
      setError(topic.closest(".form-group"), "Изберете тема на запитването.");
      valid = false;
    }

    if (!message.value || message.value.trim().length < 10) {
      setError(message.closest(".form-group"), "Съобщението трябва да е поне 10 символа.");
      valid = false;
    }

    if (age.value !== "") {
      var ageNum = Number(age.value);
      if (isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
        setError(age.closest(".form-group"), "Възрастта трябва да е между 12 и 120.");
        valid = false;
      }
    }

    if (website.value && !/^https?:\/\/.+\..+/.test(website.value.trim())) {
      setError(website.closest(".form-group"), "URL адресът трябва да започва с http:// или https://");
      valid = false;
    }

    var styleChecked = form.querySelectorAll('input[name="style"]:checked');
    var styleFieldset = form.querySelector("fieldset.requires-choice");
    if (styleFieldset && styleChecked.length === 0) {
      setError(styleFieldset, "Изберете поне един предпочитан стил.");
      valid = false;
    }

    if (!consent.checked) {
      setError(consent.closest(".form-group"), "Нужно е съгласие за обработка на данните.");
      valid = false;
    }

    var promoApplied = false;
    var promoNote = "";
    if (promoInput && promoInput.value.trim()) {
      var promoCheck = window.KJAuth.validatePromoCode(promoInput.value, topic.value);
      if (!promoCheck.ok) {
        if (promoGroup) {
          setError(promoGroup, promoCheck.message);
        }
        valid = false;
      } else if (promoInput.dataset.applied !== window.KJAuth.PROMO_CODE) {
        if (promoGroup) {
          setError(promoGroup, "Натиснете „Приложи“, за да потвърдите промо кода преди изпращане.");
        }
        valid = false;
      } else {
        promoApplied = true;
        promoNote =
          " Промо KJ15: " +
          promoCheck.basePrice +
          " лв → " +
          promoCheck.finalPrice +
          " лв (−15%).";
      }
    }

    if (!valid) {
      var firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector("input, select, textarea");
        if (focusable) {
          focusable.focus();
        }
      }
      return;
    }

    if (promoApplied) {
      window.KJAuth.markPromoUsed();
    }

    if (success) {
      success.textContent =
        "Благодарим! Поръчката е приета (демо)." +
        (promoApplied ? promoNote : "") +
        " Няма сървърно изпращане.";
      success.classList.add("is-visible");
      success.focus();
    }
    form.reset();
    if (promoInput) {
      promoInput.dataset.applied = "";
      delete promoInput.dataset.finalPrice;
    }
    var promoResult = document.getElementById("promo-result");
    if (promoResult) {
      promoResult.textContent = "";
      promoResult.classList.remove("is-ok", "is-bad");
    }
    if (window.KJAuth.updateAuthUI) {
      window.KJAuth.updateAuthUI();
    }
  });
})();

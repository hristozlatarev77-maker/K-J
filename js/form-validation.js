(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) {
    return;
  }

  var success = document.getElementById("form-success");
  var dateInput = document.getElementById("date");
  var MAX_REFERENCE_FILES = 10;
  var ALLOWED_IMAGE_TYPES = {
    "image/jpeg": true,
    "image/png": true,
    "image/gif": true,
    "image/webp": true
  };
  var ALLOWED_IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;

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
    return /^[+0-9\s()-]{7,20}$/.test(value);
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDateISO(date) {
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate())
    );
  }

  function minReadyDate() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3);
    return d;
  }

  function applyDateMin() {
    if (!dateInput) {
      return;
    }
    dateInput.min = formatDateISO(minReadyDate());
  }

  function parseISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
      return null;
    }
    var parts = value.split("-");
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var day = Number(parts[2]);
    var d = new Date(y, m - 1, day);
    if (
      d.getFullYear() !== y ||
      d.getMonth() !== m - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isAllowedImageFile(file) {
    if (!file) {
      return false;
    }
    if (file.type && ALLOWED_IMAGE_TYPES[file.type]) {
      return true;
    }
    if (!file.type && ALLOWED_IMAGE_EXT.test(file.name || "")) {
      return true;
    }
    return ALLOWED_IMAGE_TYPES[file.type] === true;
  }

  var referencesInput = document.getElementById("references");
  var referencesPreview = document.getElementById("references-preview");
  var previewObjectUrls = [];

  function clearReferencePreview() {
    for (var i = 0; i < previewObjectUrls.length; i++) {
      try {
        URL.revokeObjectURL(previewObjectUrls[i]);
      } catch (err) {
        /* ignore */
      }
    }
    previewObjectUrls = [];
    if (referencesPreview) {
      referencesPreview.innerHTML = "";
      referencesPreview.hidden = true;
    }
  }

  function renderReferencePreview(fileList) {
    clearReferencePreview();
    if (!referencesPreview) {
      return;
    }
    var files = fileList ? Array.prototype.slice.call(fileList, 0) : [];
    if (!files.length) {
      return;
    }

    var shown = files.slice(0, MAX_REFERENCE_FILES);
    var countText =
      files.length > MAX_REFERENCE_FILES
        ? "Избрани: " +
          files.length +
          " файла (ще се приемат най-много " +
          MAX_REFERENCE_FILES +
          ")"
        : "Избрани: " + files.length + (files.length === 1 ? " файл" : " файла");

    var countEl = document.createElement("p");
    countEl.className = "file-preview-count";
    countEl.textContent = countText;
    referencesPreview.appendChild(countEl);

    var list = document.createElement("ul");
    list.className = "file-preview-list";

    for (var i = 0; i < shown.length; i++) {
      var file = shown[i];
      var item = document.createElement("li");
      item.className = "file-preview-item";

      var thumb = document.createElement("img");
      thumb.className = "file-preview-thumb";
      thumb.alt = "";
      thumb.width = 96;
      thumb.height = 96;

      if (isAllowedImageFile(file)) {
        var url = URL.createObjectURL(file);
        previewObjectUrls.push(url);
        thumb.src = url;
      } else {
        thumb.className += " is-invalid-file";
        thumb.removeAttribute("src");
        thumb.alt = "Невалиден файл";
      }

      var nameEl = document.createElement("span");
      nameEl.className = "file-preview-name";
      nameEl.textContent = file.name || "файл";
      nameEl.title = file.name || "";

      item.appendChild(thumb);
      item.appendChild(nameEl);
      list.appendChild(item);
    }

    if (files.length > MAX_REFERENCE_FILES) {
      var more = document.createElement("li");
      more.className = "file-preview-item";
      more.innerHTML =
        '<span class="file-preview-name">+ още ' +
        (files.length - MAX_REFERENCE_FILES) +
        " (над лимита)</span>";
      list.appendChild(more);
    }

    referencesPreview.appendChild(list);
    referencesPreview.hidden = false;
  }

  applyDateMin();

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

  form.addEventListener("change", function (event) {
    var field = event.target;
    if (field && field.id === "references") {
      var group = field.closest(".form-group");
      if (group && group.classList.contains("is-invalid")) {
        clearError(group);
      }
      renderReferencePreview(field.files);
    } else if (field && field.type === "file") {
      var groupFile = field.closest(".form-group");
      if (groupFile && groupFile.classList.contains("is-invalid")) {
        clearError(groupFile);
      }
    }
  });

  if (referencesInput) {
    renderReferencePreview(referencesInput.files);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    applyDateMin();

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
    var people = form.elements.namedItem("people");
    var date = form.elements.namedItem("date");
    var references = form.elements.namedItem("references");
    var topic = form.elements.namedItem("topic");
    var theme = form.elements.namedItem("theme");
    var message = form.elements.namedItem("message");
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

    if (!phone.value || !phone.value.trim()) {
      setError(phone.closest(".form-group"), "Моля, въведете телефонен номер.");
      valid = false;
    } else if (!validatePhone(phone.value.trim())) {
      setError(
        phone.closest(".form-group"),
        "Телефонът трябва да е 7–20 символа (цифри, интервали, +, -, ())."
      );
      valid = false;
    }

    if (people && people.value !== "") {
      var peopleNum = Number(people.value);
      if (isNaN(peopleNum) || peopleNum < 1 || peopleNum > 20) {
        setError(people.closest(".form-group"), "Броят хора трябва да е между 1 и 20.");
        valid = false;
      }
    }

    if (!date.value) {
      setError(date.closest(".form-group"), "Моля, изберете желана дата за готовност.");
      valid = false;
    } else {
      var chosen = parseISODate(date.value);
      var minDate = minReadyDate();
      if (!chosen) {
        setError(date.closest(".form-group"), "Невалидна дата.");
        valid = false;
      } else if (chosen.getTime() < minDate.getTime()) {
        setError(
          date.closest(".form-group"),
          "Датата трябва да е най-рано " + formatDateISO(minDate) + " (днес + 3 дни)."
        );
        valid = false;
      }
    }

    if (references && references.files && references.files.length) {
      var files = references.files;
      if (files.length > MAX_REFERENCE_FILES) {
        setError(
          references.closest(".form-group"),
          "Можете да качите най-много " + MAX_REFERENCE_FILES + " изображения."
        );
        valid = false;
      } else {
        var badNames = [];
        for (var f = 0; f < files.length; f++) {
          if (!isAllowedImageFile(files[f])) {
            badNames.push(files[f].name || "файл");
          }
        }
        if (badNames.length) {
          setError(
            references.closest(".form-group"),
            "Позволени са само JPG, PNG, GIF или WebP. Невалидни: " +
              badNames.slice(0, 3).join(", ") +
              (badNames.length > 3 ? "…" : "")
          );
          valid = false;
        }
      }
    }

    if (!topic.value) {
      setError(topic.closest(".form-group"), "Изберете вид на поръчката.");
      valid = false;
    }

    if (!theme.value || theme.value.trim().length < 5) {
      setError(theme.closest(".form-group"), "Опишете темата/повода с поне 5 символа.");
      valid = false;
    }

    if (message.value && message.value.trim().length > 0 && message.value.trim().length < 10) {
      setError(
        message.closest(".form-group"),
        "Ако попълвате допълнителни детайли, въведете поне 10 символа."
      );
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

    var fileCount =
      references && references.files ? references.files.length : 0;
    if (success) {
      success.textContent =
        "Благодарим! Поръчката е приета (демо)." +
        (fileCount ? " Качени референции: " + fileCount + "." : "") +
        (promoApplied ? promoNote : "") +
        " Няма сървърно изпращане.";
      success.classList.add("is-visible");
      success.focus();
    }
    form.reset();
    applyDateMin();
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

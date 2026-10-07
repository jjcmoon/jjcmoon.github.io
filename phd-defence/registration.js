(() => {
  const section = document.querySelector("[data-tally-form-id]");
  if (!section) {
    return;
  }

  const formIds = {
    nl: section.dataset.tallyFormId.trim(),
    en: section.dataset.tallyFormIdEn?.trim() || "",
  };
  const container = section.querySelector(".registration-form");
  const note = section.querySelector(".registration-language-note");
  const registrationLinks = document.querySelectorAll("[data-registration-link]");
  let currentFormId;
  let embedScript;

  function updateForm() {
    const language = document.documentElement.lang === "nl" ? "nl" : "en";
    const validId = (id) => /^[a-zA-Z0-9]+$/.test(id);
    const formLanguage = validId(formIds[language]) ? language : (language === "en" ? "nl" : "en");
    const formId = formIds[formLanguage];

    // Keep registration hidden and avoid external requests until configured.
    if (!validId(formId)) {
      section.hidden = true;
      registrationLinks.forEach((link) => { link.hidden = true; });
      return;
    }

    registrationLinks.forEach((link) => { link.hidden = false; });

    note.hidden = language === formLanguage;
    note.textContent = language === "en"
      ? "The registration form is currently available in Dutch."
      : "Het inschrijvingsformulier is momenteel beschikbaar in het Engels.";
    const title = language === "nl"
      ? "Inschrijven voor de doctoraatsverdediging en receptie"
      : "Register for the PhD defence and reception";

    // Re-selecting the active language must not clear a partially filled form.
    if (formId === currentFormId) {
      container.querySelector("iframe").title = title;
      return;
    }

    const frame = document.createElement("iframe");
    frame.src = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
    frame.title = title;
    frame.lang = formLanguage;
    frame.height = "650";
    frame.loading = "lazy";
    container.replaceChildren(frame);
    currentFormId = formId;
    section.hidden = false;

    // Tally adjusts the height after loading and on language changes.
    // The form itself still loads if this optional resizing script is blocked.
    if (window.Tally) {
      window.Tally.loadEmbeds();
    } else if (!embedScript) {
      embedScript = document.createElement("script");
      embedScript.src = "https://tally.so/widgets/embed.js";
      embedScript.async = true;
      document.head.append(embedScript);
    }
  }

  document.addEventListener("defence-language-change", updateForm);
  updateForm();
})();

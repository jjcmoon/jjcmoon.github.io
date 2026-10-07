(() => {
  const storageKey = "phd-defence-language";
  const languages = ["en", "nl"];
  const dutch = {
    invitationEyebrow: "Je bent uitgenodigd",
    invitationMessage: "Ik nodig je graag uit voor mijn doctoraatsverdediging en een drankje achteraf.",
    heading: "Doctoraatsverdediging",
    thesisTitle: "Neuraal-probabilistisch logisch programmeren met circuits en embeddings",
    dateLabel: "Datum",
    date: "1 december 2026",
    defenceTime: "Verdediging · 17.00–19.00 uur",
    receptionTime: "Receptie · vanaf ongeveer 19.00 uur",
    registerAction: "RSVP",
    locationLabel: "Locaties",
    venue: "Verdediging · 200M 00.06",
    receptionVenue: "Receptie · Foyer Computerwetenschappen",
    onlineAttendance: "Je kunt ook online volgen. Na inschrijving ontvang je een link per e-mail.",
    supervisorLabel: "Promotor",
    calendarDownload: "Toevoegen aan agenda",
    registrationHeading: "Kom naar de verdediging",
    registrationIntro: "Laat me weten hoe je de verdediging wilt bijwonen en of je naar de receptie komt.",
    abstractHeading: "Over het proefschrift",
    abstract1: `Moderne artificiële intelligentie blinkt uit in het leren vanuit data.
      Een neuraal netwerk kan bijvoorbeeld verkeerslichten en voetgangers herkennen in beelden.
      Toch moet een veilige zelfrijdende auto ook weten dat het voor een rood licht moet stoppen.
      Dit proefschrift onderzoekt systemen waarin mensen zulke regels kunnen neerschrijven, in plaats van te verwachten dat de computer ze zelf leert.`,
    abstract2: `Neurale netwerken leren uit ruwe data, terwijl symbolische programma's kennis uitdrukken in regels die mensen kunnen lezen.
      In <em>neurosymbolische artificiële intelligentie</em> combineren we beide in één systeem.
      In het voorbeeld van de auto kan het neurale deel inschatten hoe waarschijnlijk het is dat een verkeerslicht rood is.
      Het deel dat de regels toepast, gebruikt die inschatting vervolgens om te beslissen hoe de auto zich moet gedragen.
      Zulke systemen kunnen minder voorbeelden nodig hebben, zijn eenvoudiger aan te passen en zijn vaak betrouwbaarder.`,
    abstract3: `Het eerste deel van het proefschrift behandelt de berekeningen in neurosymbolische systemen.
      Die berekeningen zijn moeilijk omdat er te veel verschillende mogelijkheden zijn om door te rekenen.
      We ontwikkelen één methode die veel verschillende berekeningen op een neurosymbolisch systeem kan uitvoeren.
      Vervolgens analyseren we wanneer antwoorden te duur zijn om exact te berekenen en introduceren we een nieuwe manier om ze te schatten met garanties.
      Tot slot herschikken we regelgebaseerde berekeningen zodat ze op dezelfde computerchips kunnen draaien als neurale netwerken.
      In sommige tests maakt dit de berekeningen tot tienduizend keer sneller.`,
    abstract4: `Het tweede deel van het proefschrift behandelt de betekenis van de regels die we neerschrijven.
      Een regelgebaseerd systeem beschouwt de symbolen <code>stoel</code> en <code>kat</code> als even weinig verwant als <code>kat</code> en <code>kitten</code>.
      Een neuraal netwerk kan daarentegen meten hoe sterk concepten op elkaar lijken.
      Dit proefschrift onderzoekt hoe we deze gelijkenis kunnen gebruiken bij het redeneren aan de hand van regels.
      Samen maken onze bijdragen het eenvoudiger om neurosymbolische systemen op te bouwen en versnellen ze de berekeningen van die systemen.`,
  };
  const metadata = {
    en: {
      title: "PhD defence | Jaron Maene",
      description: "PhD defence of Jaron Maene at KU Leuven.",
    },
    nl: {
      title: "Doctoraatsverdediging | Jaron Maene",
      description: "Doctoraatsverdediging van Jaron Maene aan KU Leuven.",
    },
  };
  const elements = [...document.querySelectorAll("[data-i18n]")];
  // The English HTML also serves as the readable fallback without JavaScript.
  const english = new Map(elements.map((element) => [element, element.innerHTML]));
  const buttons = document.querySelectorAll("[data-language]");

  function preferredLanguage() {
    const requested = new URL(window.location.href).searchParams.get("lang");
    if (languages.includes(requested)) {
      return requested;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (languages.includes(saved)) {
        return saved;
      }
    } catch {
      // Browser preferences still work when storage is unavailable.
    }

    const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const preference of preferences) {
      const language = preference?.toLowerCase().split("-")[0];
      if (languages.includes(language)) {
        return language;
      }
    }
    return "en";
  }

  function setLanguage(language) {
    document.documentElement.lang = language;
    document.title = metadata[language].title;
    document.querySelector('meta[name="description"]').content = metadata[language].description;
    elements.forEach((element) => {
      // Both translations are trusted local content, never URL or visitor input.
      element.innerHTML = language === "nl" ? dutch[element.dataset.i18n] : english.get(element);
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    document.querySelector("#calendar-download").href = `../assets/phd-defence/phd-defence-${language}.ics`;
    document.dispatchEvent(new CustomEvent("defence-language-change", { detail: { language } }));
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.language;
      try {
        localStorage.setItem(storageKey, language);
      } catch {
        // Switching remains available without persistent storage.
      }
      const url = new URL(window.location.href);
      url.searchParams.set("lang", language);
      try {
        window.history.replaceState(null, "", url);
      } catch {
        // Some file previews restrict URL changes; translation still works.
      }
      setLanguage(language);
    });
  });

  setLanguage(preferredLanguage());
  document.querySelector(".language-switch").hidden = false;
})();

# Documentoid

Samostatný lokální toolchain pro dokumentaci. Návod a příkazy jsou v `README.md`.

- Skilly pro tento projekt jsou v `.agents/skills/<název>/SKILL.md`:
  - `solution-architecture`: návrh a dokumentace řešení, alternativy, C4, ADR.
  - `diagram-design`: všechny diagramy v editorial stylu jako HTML/SVG.
  - `documentation-pdf`: Markdown/HTML do PDF a vizuální kontrola výsledku (`npm run pdf:preview`).
  - `documentation-compress`: zkrácení přerostlé dokumentace na rozpočet stran.
- Český text v dokumentaci piš podle `.agents/skills/documentation-compress/references/czech-prose.md`.
- `.agents/skills/diagram-design/` je neupravená kopie [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) (MIT). Neměň v ní soubory; aktualizuje se přes `npm run diagram-design:update`, který lokální změny odmítne. Vlastní styl patří do profilu `~/.diagram-design/profiles/` a markeru `.diagram-design` v cílovém projektu.
- Dokumentace a diagramy jiných projektů patří do jejich repozitářů; Documentoid na ně jen spouští nástroje (absolutní cesty, viz README).
- Udržuj editovatelné zdroje. Generované soubory patří do `output/`.
- Změny toolchainu ověř pomocí `npm run example` a výsledná PDF přes `npm run pdf:preview`; při změně HTML exportu ověř i `npm run html:pdf`.
- Pro npm závislosti udržuj `package-lock.json` a přesné verze. Nezapisuj nic do globálních skillů bez požadavku uživatele.

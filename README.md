# Documentoid

Samostatný lokální toolchain a sada agentních skillů pro technickou dokumentaci: solution architecture, editorial diagramy, export do PDF a zkracování dokumentace, která přerostla svůj účel.

## Rychlý start

Požadavky: Node.js 24.14 nebo novější, npm, Git a Python 3.10+ dostupný příkazem `python` (kontrola a export diagramů). Závislosti jsou lokální a jejich verze fixuje `package-lock.json`. Puppeteer při instalaci stáhne Chrome Headless Shell, který používají všechny exporty i náhledy; volbu řídí `.puppeteerrc.cjs`.

```powershell
git clone https://github.com/deverjak/documentoid.git
cd documentoid
npm ci
npm run example
```

Výsledek: `output/documentation.pdf`, `output/architecture.pdf` a `output/diagrams/architecture.svg`. Ukázka obsahuje editorial diagram z přibalených příkladů diagram-design, diakritiku, tabulku, kód a explicitní zlom strany. Editovatelný zdroj diagramu je `examples/diagrams/architecture.html`; nepopisuje architekturu Documentoid.

Pokud se při instalaci přeskočilo stažení prohlížeče: `npm run browser:install`.

## Struktura repozitáře

| Cesta | Obsah |
| --- | --- |
| `.agents/skills/` | Agentní skilly (viz níže); `diagram-design` je neupravená kopie upstreamu. |
| `scripts/` | Exporty do PDF, náhled PDF, měření rozsahu, kontrola odkazů, aktualizace diagram-design, sestavení ukázky. |
| `config/` | Tiskový styl (`print.css`) a nastavení PDF exportu (`pdf.cjs`). |
| `examples/` | Ukázkový Markdown a editorial diagram pro `npm run example`. |
| `third-party/diagram-design/` | Licence a zdrojový commit převzatého skillu. |
| `AGENTS.md`, `CLAUDE.md` | Pracovní instrukce pro agenty (Codex, Claude Code). |
| `output/` | Generované výstupy, mimo Git. |

## Příkazy

```powershell
# Markdown do PDF; bez výstupu vznikne output/<název>.pdf
npm run pdf -- examples/documentation.md output/documentation.pdf

# Hotové HTML do PDF, včetně HTML z diagram-design
npm run html:pdf -- cesta/diagram.html output/diagram.pdf --landscape

# Náhled skutečného PDF: PNG každé stránky, počet stran a text po stránkách
npm run pdf:preview -- output/documentation.pdf

# Kontrola editorial HTML a export SVG pro vložení do Markdownu
New-Item -ItemType Directory -Force output/diagrams
npm run diagram:check -- examples/diagrams/architecture.html
npm run diagram:svg -- examples/diagrams/architecture.html output/diagrams/architecture.svg --system-fonts

# Rozsah dokumentace (slova, obrázky, odhad stran) a kontrola lokálních odkazů
npm run docs:measure -- C:\repo\docs --pdf=C:\repo\output\kniha.pdf
npm run docs:links -- C:\repo\docs
```

npm spouští skripty v kořeni Documentoid, takže dokumenty z jiného repozitáře zadávej absolutní cestou. Z cílového repozitáře lze skripty volat i přímo (`node C:\…\documentoid\scripts\markdown-to-pdf.mjs docs\navrh.md`); relativní cesty se pak berou od aktuální složky.

`npm run pdf` načítá lokální obrázky z jedné kořenové složky: pro soubory v Documentoid je to Documentoid, jinak Git repozitář dokumentu, případně jeho složka. Jinou určí `--root=<složka>`. Titulek PDF je první nadpis `#`. Parametr `--system-fonts` při exportu SVG vynechává externí fonty.

Tiskový vzhled Markdownu upravuje `config/print.css`, formát a patičky `config/pdf.cjs`. HTML export zachovává styly zdrojového dokumentu; jeho `@page` má přednost před výchozím formátem. Ukázky jsou v `examples/`, výsledky v `output/` (mimo Git).

## Skilly

Projektové skilly jsou v `.agents/skills/`. Codex a další agenti, kteří tuto složku čtou, je načtou při otevření Documentoid jako projektu; pro Claude Code je mapa v `CLAUDE.md`.

| Skill | Účel |
| --- | --- |
| `solution-architecture` | Podklady a hranice řešení, C4 pohledy, data, integrace, provoz, porovnání variant a ADR. Šablona návrhu a ADR je v `assets/`. |
| `diagram-design` | Všechny diagramy v editorial stylu jako HTML s inline SVG. Neupravená kopie upstreamu, viz níže. |
| `documentation-pdf` | Export Markdown/HTML do PDF a kontrola skutečného výsledku po stránkách. |
| `documentation-compress` | Zkrácení přerostlé dokumentace: měření a rozpočet stran, zapracování realizovaných návrhů, odstranění stavových poznámek a duplicit, přepis prózy, kontrola odkazů a PDF. Obsahuje sdílenou příručku české prózy `references/czech-prose.md`. |

Příklady zadání agentovi:

- „Použij solution-architecture a navrhni řešení podle tohoto zadání. Odděl současný stav, návrh a otevřené otázky.“
- „Pomocí diagram-design nakresli editorial sekvenční diagram včetně timeoutu a opakování.“
- „Pomocí documentation-pdf vyexportuj návrh do PDF a zkontroluj všechny stránky.“
- „Použij documentation-compress na `C:\repo\docs\architecture`, cíl je 100 stran.“

## Diagramy: diagram-design

Skill `diagram-design` je převzatý z projektu [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) autorky Cathryn Lavery, pod licencí MIT. Všechny editorial diagramy, šablony, reference, příklady v `.agents/skills/diagram-design/assets/` a Python skripty pro kontrolu, export a import (draw.io, Mermaid, Excalidraw) pocházejí odtud. Licence a licence přibalených ikon a fontů jsou v `third-party/diagram-design/`, přesný zdrojový commit a verze v `third-party/diagram-design/source.json`.

Kopie je záměrně neupravená, aby šla aktualizovat. Upstream se vyvíjí, takže ji je vhodné čas od času obnovit:

```powershell
npm run diagram-design:update -- --check     # vypíše, zda upstream má novější commit a co se změnilo
npm run diagram-design:update                # nahradí kopii posledním stavem výchozí větve
npm run diagram-design:update -- --ref=<tag nebo commit>
npm run example                              # ověření po aktualizaci
```

Skript před nahrazením porovná kopii s commitem zapsaným v `source.json`. Pokud v ní najde lokální změnu, skončí a vypíše dotčené soubory; `--force` je přepíše. Po aktualizaci zapíše nový commit a verzi do `source.json` a obnoví licenční soubory. Výsledek zkontroluj v `git diff` a případné změny příkazů nebo skriptů promítni do tohoto README a do `package.json`.

Vlastní vizuální styl proto nepiš do přibaleného `references/style-guide.md`. diagram-design při prvním diagramu v projektu nabízí přizpůsobení stylu; ulož ho jako profil (`~/.diagram-design/profiles/`) a v kořeni projektu, pro který diagram vzniká, ho vyber souborem `.diagram-design` s obsahem `profile: <název>`. Postup popisuje `references/profiles.md` skillu.

V Claude Code může být diagram-design nainstalovaný i jako globální plugin v jiné verzi. Pro práci v Documentoid platí přibalená kopie, protože na její skripty odkazují npm příkazy.

### Volitelný PNG export diagram-design

Upstream `export_png.py` potřebuje Python Playwright, samostatnou závislost mimo `npm ci`. Pro HTML → PDF, náhled PDF ani export SVG ji nepotřebuješ.

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install playwright
.venv/Scripts/python.exe -m playwright install chromium
.venv/Scripts/python.exe .agents/skills/diagram-design/scripts/export_png.py cesta/diagram.html output/diagram.png 2
```

## Metodické a nástrojové zdroje

- [C4 model](https://c4model.com/diagrams) pro pohledy na strukturu systému.
- [arc42](https://arc42.org/overview/) jako inspirace pro obsah architektonické dokumentace. Přibalené šablony jsou vlastní stručné šablony, nejsou kopií oficiální arc42 šablony.
- [diagram-design](https://github.com/cathrynlavery/diagram-design) pro editorial diagramy.
- [md-to-pdf](https://github.com/simonhaenisch/md-to-pdf), [Puppeteer](https://pptr.dev/) a [pdf.js](https://mozilla.github.io/pdf.js/) pro export a náhled PDF.

# Documentoid

Lokální toolchain pro technickou dokumentaci, diagramy a solution architecture.

## Ukázka editorial diagramu

Text zůstává v Markdownu, editorial diagram v HTML s inline SVG a výsledné PDF slouží ke sdílení. Obrázek níže je přibalený příklad architektury obsahového webu ze skillu diagram-design. Tato ukázka ověřuje českou diakritiku: příliš žluťoučký kůň úpěl ďábelské ódy.

![Editorial diagram architektury obsahového webu](../output/diagrams/architecture.svg)

## Co je připraveno

| Potřeba | Nástroj nebo skill |
| --- | --- |
| Markdown do PDF | md-to-pdf, tiskové CSS a číslování stran |
| HTML do PDF | Puppeteer, také pro výstup diagram-design |
| Editorial diagramy | diagram-design, editovatelné HTML s vloženým SVG |
| Návrh řešení | solution-architecture, šablona dokumentu a ADR |
| Zkrácení dokumentace | documentation-compress, měření rozsahu a kontrola odkazů |

<div class="page-break"></div>

## Reprodukovatelné sestavení

```powershell
npm ci
npm run example
```

## Jak připravit solution architecture

Začni cílem, aktéry, hranicí systému a omezeními. Odděl ověřený současný stav od navrhovaného řešení a předpokladů. Klíčová rozhodnutí porovnej s reálnými alternativami a zaznamenej důsledky.

Popiš vlastnictví dat, integrační kontrakty, runtime scénáře i chování při chybách. Kvalitativní požadavky vyjádři měřitelně; neznámé hodnoty označ jako otevřené otázky.

### Kontrola před sdílením

- Terminologie a názvy komponent odpovídají diagramům.
- Pro významné požadavky existuje návrh ověření.
- Dokument rozlišuje rozhodnutí, návrhy a otevřené otázky.
- PDF bylo vizuálně zkontrolováno včetně tabulek a diakritiky.

Metodické zdroje: [C4 model](https://c4model.com/diagrams) a [arc42](https://arc42.org/overview/).

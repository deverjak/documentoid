---
name: documentation-pdf
description: Exportuj technickou dokumentaci z Markdownu nebo HTML do PDF pomocí lokálního npm toolchainu Documentoid a zkontroluj skutečný výsledek po stránkách. Použij pro sazbu, tiskové styly, obrázky, diagramy, tabulky a vizuální kontrolu finálního PDF; nejde o editaci formulářů ani převod DOCX.
---

# Dokumentace do PDF

Pracuj s editovatelným Markdown nebo HTML zdrojem a zachovej ho vedle výsledku. Zdroj patří do repozitáře, který dokumentaci vlastní; PDF je odvozený soubor.

## Kde příkazy spouštět

`npm run …` spouštěj z kořene Documentoid (tři úrovně nad složkou tohoto skillu). npm mění pracovní složku na kořen Documentoid, takže dokumenty z jiného repozitáře zadávej absolutní cestou. Z cílového repozitáře lze skripty volat i přímo, potom se relativní cesty berou od aktuální složky:

```powershell
node C:\cesta\k\documentoid\scripts\markdown-to-pdf.mjs docs\navrh.md output\navrh.pdf
```

Závislosti obnoví `npm ci`; pokud chybí prohlížeč, `npm run browser:install`.

## Markdown

```powershell
npm run pdf -- C:\repo\docs\solution-architecture.md C:\repo\output\solution-architecture.pdf
```

Skript používá `md-to-pdf`, `config/pdf.cjs` a `config/print.css`: A4, UTF-8, systémové fonty s českou diakritikou, zvýraznění kódu a číslování stran. Titulek PDF je první nadpis `#`. Bez výstupního argumentu zapisuje `output/<název-zdroje>.pdf` v Documentoid.

Lokální obrázky odkazuj relativně k Markdownu. Načítají se jen z jedné kořenové složky: pro soubory uvnitř Documentoid je to Documentoid, jinak Git repozitář dokumentu, a když žádný není, složka dokumentu. Jinou složku určí `--root=<složka>`; dokument musí ležet uvnitř ní. Obrázek mimo kořen se tiše nevykreslí, proto ho hledej v náhledu PDF.

Frontmatter dokumentu umí přepsat konfiguraci exportu (`pdf_options`, `stylesheet`, `launch_options`). Před renderem cizího dokumentu ho zkontroluj stejně jako cizí HTML.

Diagramy připravuj pomocí `diagram-design` jako editorial HTML s inline SVG. Do Markdownu vlož exportované SVG: `npm run diagram:check -- <diagram.html>`, potom `npm run diagram:svg -- <diagram.html> <výstup.svg> --system-fonts` (výstupní složka musí existovat) a odkaz relativní cestou. Explicitní zlom strany je `<div class="page-break"></div>`. Dlouhé tabulky mají opakovanou hlavičku; mimořádně vysoký řádek rozděl v obsahu.

## HTML a diagram-design

```powershell
npm run html:pdf -- C:\repo\docs\diagrams\architecture.html C:\repo\output\architecture.pdf --landscape
```

Použij pro publikovatelné HTML diagramy nebo hotovou HTML sazbu. Skript zachovává CSS, čeká na fonty, u motion diagramu žádá statický rámec a selže na nenačteném obrázku. Tiskové `@page` ve zdroji má přednost před výchozím A4 a okraji 12 mm; diagram přes celou stranu bez bílého rámu potřebuje vlastní `@page { margin: 0 }`. Skryté nebo scrollované části musí být při tisku viditelné a ovládací prvky bez významu na papíře do tisku nepatří.

## Kontrola skutečného PDF

Úspěšný příkaz ani screenshot vstupního HTML nestačí. Vyrenderuj výsledné PDF:

```powershell
npm run pdf:preview -- C:\repo\output\solution-architecture.pdf
```

Skript vypíše počet stran, počet znaků textu na stránku a varování (stránka téměř bez textu, podezřelé kódování) a uloží `page-NN.png` a `report.json` do `output/preview/<název>/`, případně do složky ve druhém argumentu. Šířku náhledu mění `--width=1600`. Funguje bez Poppleru i PyMuPDF; pokud jsou k dispozici, lze použít i `pdfinfo` a `pdftoppm`.

Prohlédni všechny stránky jako obrázky: okraje, nadpisy osamocené na konci strany, zalomení, tabulky, diagramy (čitelnost popisků, nic neořezané), patičky, prázdné stránky a diakritiku. Varování ze skriptu nejsou úplná kontrola, jen upozornění. Chyby oprav ve zdroji nebo v CSS a export zopakuj. U dokumentu o desítkách stran prohlédni všechny stránky po dávkách; pokud to nejde, řekni, které stránky jsi viděl.

Odevzdej cestu k výslednému PDF a stručně uveď, co bylo ověřeno. Neověřenou sazbu nevydávej za zkontrolovanou. Výstupy patří do `output/` (v Documentoid mimo Git) nebo do výstupní složky cílového projektu, nikdy vedle zdrojů do Gitu, pokud to projekt výslovně nechce.

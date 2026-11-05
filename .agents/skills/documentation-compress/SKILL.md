---
name: documentation-compress
description: Zkrať a zhusti existující technickou dokumentaci, která přerostla svůj účel - "zmenši dokumentaci", "PDF má zase 250 stran", "zapracuj hotové návrhy do kapitol", "vyhoď z toho stavové poznámky". Změří rozsah, stanoví rozpočet stran, zapracuje realizované návrhy do kapitol, odstraní sledování stavu, zkratky a duplicity, přepíše prózu a ověří odkazy a výsledné PDF. Nepoužívej pro psaní nové dokumentace (solution-architecture) ani pro opravu věcného obsahu.
---

# Komprese dokumentace

Dokumentace roste sama: návrhy se píšou vedle kapitol, realizují se a zůstanou jako dlouhé zastaralé kopie; každý audit přidá datované počty, čísla PR a kódy úkolů; stejný fakt se objeví v README, kapitole i návrhu. Tento skill ji vrací na rozsah, který čtenář přečte, aniž by se ztratilo cokoli, co potřebuje. Je to zobecnění postupu, kterým se architektonická kniha NaLekci dvakrát zmenšila z asi 250 na 100–120 stran.

Komprese nemění fakta. Pokud při ní narazíš na rozpor mezi dokumentem a kódem nebo mezi dvěma dokumenty, nezvol tiše jednu verzi: zapiš ho do předávací zprávy jako otevřenou otázku.

## Před začátkem

- Zjisti cílový dokument nebo složku, čtenáře a účel (architekt, který se k systému vrací; provozní tým; nový vývojář). Úroveň detailu se odvíjí od čtenáře.
- Přečti pracovní instrukce cílového repozitáře (`AGENTS.md`, `CLAUDE.md`). Mají přednost: mohou určovat, které soubory jsou kontrakt, kam patří návrhy nebo jak se dokumentace sestavuje.
- Ověř, že je cíl v Gitu a že v něm nejsou cizí rozpracované změny. Mazání a přesuny spoléhají na historii Gitu; bez ní nic nemaž a zeptej se.
- Rozpočet: použij ten, který uživatel zadal. Bez zadání změř rozsah a navrhni rozpočet (u přerostlé knihy obvykle polovinu, u architektury kolem 100 stran) a nech si ho potvrdit.

## Úroveň: co zůstává

U architektonické dokumentace zůstává to, co architekt potřebuje k pochopení a změně systému:

- kontext, části systému (moduly, schémata, integrace) a jejich hranice,
- klíčové toky od začátku do konce, stavové automaty, asynchronní svět,
- rozhodnutí a jejich důvody (odkaz na ADR), invarianty a místo, kde se vynucují,
- známá strukturální rizika a směr vývoje.

U jiného typu dokumentace odvoď obdobný seznam z účelu a čtenáře a napiš ho do plánu.

## Co odchází

- **Sledování stavu:** která vlna, úkol nebo část je hotová, nasazená, „čeká“; go/no-go seznamy; deníky změn uvnitř kapitol.
- **Zkratky a kódy z běhu:** označení vln a úkolů, kódy položek runbooku, čísla PR a issue, SHA commitů, ID běhů CI. Odkaz na issue zůstane jen tam, kde čtenář musí jednat, a s větou, o co jde.
- **Seznamy ID požadavků.** Pravidlo řekni slovy a jednou odkaž na kapitolu specifikace.
- **Datované počty**, které se mění s každým commitem (řádky, soubory, endpointy, migrace). Číslo ponech jen tehdy, nese-li argument, zaokrouhli ho („asi 280 RPC“) a jednou, v úvodu dokumentace, uveď datum, ke kterému čísla platí.
- **Detail na úrovni funkcí.** Názvy funkcí a tabulek jsou vstupní body do kódu, ne obsah. Jeden název na myšlenku, ne pět.
- **Generované přílohy** (výpisy tabulek, vlastnické tabulky) a sekce otázek a odpovědí v PDF.

Test každého odstavce: *chyběl by čtenáři, kdyby zmizel, a bude pravdivý i za tři měsíce?* Dvě odpovědi „ne“ znamenají smazat.

## Návrhy

Návrh je dokument napsaný před kódem. Po realizaci je druhou, delší a zastaralou kopií kapitoly. U každého rozhodni:

| Stav | Postup |
| --- | --- |
| Realizovaný (celý nebo jeho podstatná část) | Současný stav zapracuj do kapitoly v přítomném čase, bez „navrhujeme“, kódů kroků a dat rozhodnutí. Důvod („proč takhle, ne jinak“) ponech ve dvou až třech větách nebo odkaž ADR. Soubor návrhu smaž. |
| Stále otevřený | Ponech ho mezi návrhy, zkrácený na rozhodnutí, o které žádá. |
| Zamítnutý nebo překonaný | Smaž ho; historie Gitu ho uchová. Rozhodnutí s trvalou hodnotou patří do ADR. |

Soubor, který kód nebo pracovní instrukce citují jako kontrakt, se nemaže: přesune se ke kapitole, kam patří, a do PDF se nezařazuje. Ověřuj stav realizace v kódu, ne podle textu návrhu.

## Jeden fakt, jeden domov

Stejný fakt v README, v kapitole a v návrhu je hlavní zdroj nárůstu. Zvol jedno místo (obvykle kapitolu), napiš ho tam a z ostatních odkaž jednou větou. README nese jednostránkový přehled a pořadí čtení, nic víc.

## Próza

Přečti [czech-prose.md](references/czech-prose.md) a přepisuj podle něj. Každý přepsaný soubor projde zpětným čtením popsaným tamtéž: nový subagent, ne fork, jeden na soubor. U anglické dokumentace platí stejné zásady obdobně (celé věty, žádný marketing, žádné shrnující věty, jedno slovo pro jednu věc).

## Postup

1. **Změř.** `npm run docs:measure -- <složka nebo soubory>` vypíše slova, obrázky a odhad stran na soubor i celkem; s `--pdf=<poslední sestavení>` doplní skutečný počet stran a kalibrační poměr. Má-li cílový projekt vlastní měření nebo sestavení knihy, použij je. Rozepiš rozpočet po souborech tak, aby součet vyšel na cíl.
2. **Rozhodni strukturu dřív, než kdokoli píše:** které návrhy se zapracují kam, které soubory opustí PDF, které se přesunou, mapování stará cesta → nová cesta, rozpočet každého souboru. Pokud plán maže nebo přesouvá soubory, ukaž ho uživateli a počkej na souhlas.
3. **Přepisuj.** Při větším rozsahu paralelně: jeden subagent na skupinu souborů, na kterou nikdo jiný nesahá, s rozpočtem slov, tímto souborem, `czech-prose.md` a mapováním. Diagramy upravuj přes `diagram-design`; jeden zdroj diagramu edituje vždy jen jeden agent.
4. **Oprav odkazy** mimo zkrácenou dokumentaci podle mapování (`git grep` na staré cesty: instrukce, ADR, ostatní dokumentace, komentáře v kódu, testy). Aplikované migrace a jiné historické záznamy se needitují.
5. **Zkontroluj:** `npm run docs:links -- <složka>` musí skončit s 0 nefunkčními odkazy; sestav PDF (`documentation-pdf` nebo sestavení cílového projektu), prohlédni ho přes `npm run pdf:preview` a znovu změř. Nad rozpočtem škrtej dál; písmo ani okraje nezmenšuj.
6. **Předej:** co se kam přesunulo, co bylo smazáno (zůstává v historii Gitu), rozsah před a po (slova i strany), nalezené rozpory a otevřené otázky. Commit a PR vytvoř, jen pokud o ně uživatel požádal nebo to určují instrukce projektu.

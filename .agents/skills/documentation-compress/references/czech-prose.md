# Česká próza technické dokumentace

Přečti před první napsanou větou a podle tohoto souboru nech každý přepsaný soubor zpětně přečíst (oddíl *Zpětné čtení*). Je to brána, ne doporučení. Platí pro veškerý český text, který Documentoid skilly píší: solution architecture, ADR, provozní dokumentaci i zkrácené kapitoly.

## Proč existuje

Jazykový model píše česky jako anglický marketing: krátké úderné fragmenty, pomlčky místo vět, trojice přídavných jmen, řečnické otázky, nadšený úvod a shrnující závěr. Rytmus i polovina slovníku jsou anglické kalky. Platí to pro Claude Code i Codex. Vědět o tom neznamená to nedělat, proto každý text čte čtenář, který zná jen tento soubor.

Cílem je rejstřík dobře napsaného hesla české Wikipedie: klidný, věcný, celé věty, jedna myšlenka v odstavci, bez emocí a bez prodávání.

## Hlas

- Dokumentace čtenáře neoslovuje. Píše se neosobně nebo popisně: `Služba ukládá události do fronty.`, ne `Vaše služba…` ani `Uložíme…`.
- Návody a runbooky mohou používat rozkazovací způsob v krocích (`Spusťte…` nebo `Spusť…`); v jednom dokumentu se forma nemění.
- Tým nebo produkt o sobě mluví ve třetí osobě, nikdy `náš skvělý tým`.

## Jak vypadá modelová čeština a co psát místo ní

| Nepiš | Piš |
| --- | --- |
| `Škálování? Žádný problém!` | `Služba se škáluje přidáním instancí za load balancer.` |
| `Rychle. Bezpečně. Spolehlivě.` | *(smaž, neříká nic)* |
| `Klíčové je: idempotence.` | `Zpracování je idempotentní, protože…` |
| `Nejde jen o API, ale o celý ekosystém.` | *(smaž)* |
| `V této kapitole se dozvíte, jak…` | *(smaž, říká to nadpis)* |
| `Výsledek: data jsou konzistentní.` | `Data tím zůstanou konzistentní.` |
| `v rámci`, `za účelem`, `z důvodu` | `v`, `aby`, `protože` |
| `dává to smysl`, `udělat rozhodnutí`, `adresovat problém`, `na denní bázi` | `je to rozumné`, `rozhodnout`, `řešit problém`, `denně` |
| `realizovat`, `provést implementaci` | konkrétní sloveso: `zavést`, `naprogramovat`, `nasadit` |
| `robustní`, `bezproblémový`, `klíčový`, `zásadní` | *(smaž přídavné jméno, ukaž to faktem)* |
| `flow`, `feature`, `user`, `deploy` v české větě | `postup`, `funkce`, `uživatel`, `nasazení`, nebo ustálený termín v backticku |

Dva vzorce přežijí každou úpravu:

1. **Pomlčka jako motor věty.** `Požadavek dorazí — ověří se token — a zpráva jde do fronty.` Pomlčka patří tam, kam ji dává čeština (vsuvka, skutečná pauza). Dvě pomlčky v jednom odstavci jsou téměř vždy dvě věty.
2. **Trojice.** `Rychle, bezpečně a přehledně.` Pokud je faktem jen jedno ze tří, ponech to jedno.

## Stavba textu

- **Oddíl začíná pointou.** První věta odpovídá na nadpis, ne na kontext nebo definici.
- **Vysvětlení v odstavcích, ne v odrážkách.** Odrážky jsou pro skutečně souběžné položky a kroky. Tři polověty v odrážkách, které tvoří jednu myšlenku, jsou špatně napsaný odstavec.
- **Jedna myšlenka v odstavci, věty kolem dvaceti slov.** Středník obvykle znamená dvě věty.
- **Výjimky přímo.** `Při výpadku fronty se zpráva zahodí.`, ne `V některých případech může dojít ke ztrátě dat.`
- **Čísla přesně a česky:** `150 Kč`, `24 hodin`, `5. 11. 2026`. Neznámé číslo nevymýšlej; napiš, že je otevřené.
- **Typografie:** „uvozovky“, `–` pro rozsahy a pauzy, `-` jen uvnitř slov, bez emoji, tučně jen to, co čtenář musí najít.
- **Identifikátory** (funkce, tabulky, konfigurační klíče) v backticku, nepřekládat, neskloňovat uvnitř backticku.

## Jedno slovo pro jednu věc

Čtenář i AI předpokládají, že dvě různá slova znamenají dvě různé věci. Zvolený termín se v dokumentu nemění: pokud je to `služba`, není to o odstavec dál `komponenta` ani `modul`. Má-li projekt slovník, drž se ho; když ustálíš nový pojem, doplň ho tam.

## Zpětné čtení

Svůj text zpětně nepřečteš: po celém běhu ti zní anglicismy jako čeština a pomlčka jako interpunkce. Každý přepsaný soubor proto dostane čtenář, který v běhu nebyl: nový subagent (ne fork), jeden na soubor, spuštěné najednou. Nečte nic jiného než tento soubor. Zadání:

    Přečti `<cesta k tomuto souboru>` a nic jiného. Níže je soubor technické dokumentace.
    Přepiš jeho prózu tak, aby se četla jako dobré heslo české encyklopedie: klidně, věcně,
    celými větami, bez oslovování čtenáře. Zachovej přesně každý fakt, číslo, identifikátor,
    odkaz, tabulku, obrázek a nadpisovou strukturu. Měň jen to, jak se text čte.
    Vrať soubor a nic jiného.

    <soubor>

Převezmi jeho verzi. Kde změnil fakt, číslo, identifikátor nebo odkaz, i „pro srozumitelnost“, vrať svůj: fakta pocházejí ze zdrojů, které čtenář neviděl. Pak odpověz:

1. Otevírá každý oddíl pointou?
2. Je tam věta, která sleduje stav práce, prodává nebo shrnuje místo informace?
3. Je tam zkratka nebo kód, kterému mimo tento běh nikdo nerozumí?
4. Je v české větě anglické slovo nebo kalk?
5. Mění se mezi odstavci slovo pro tutéž věc?

„Ne“ u 1 nebo „ano“ u 2–5 znamená přepsat, ne doplnit výhradu. Bez subagentů přečti text sám s těmito pěti otázkami a při předání uveď, že čtení nebylo nezávislé.

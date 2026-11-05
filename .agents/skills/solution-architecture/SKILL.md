---
name: solution-architecture
description: Navrhni nebo aktualizuj solution architecture pro konkrétní systém či změnu. Vytvoř podložený návrh hranic systému, komponent, dat, integrací, provozu a významných rozhodnutí s alternativami. Použij při požadavku na architektonický návrh nebo solution design, nikoli jen na kosmetickou úpravu diagramu.
---

# Solution architecture

Výsledkem je návrh, podle kterého lze řešení posoudit a rozdělit do implementačních kroků. Piš v jazyce uživatele a přizpůsob rozsah čtenářům a velikosti změny. Český text piš podle [czech-prose.md](../documentation-compress/references/czech-prose.md) a před předáním ho nech zpětně přečíst postupem, který tam je popsaný. Kratší a přesný návrh je lepší než úplný: vynech části šablony, které rozhodnutí nemění.

## Podklady a jistota

Nejdřív přečti pracovní instrukce cílového projektu, zadání, relevantní aktuální dokumentaci a konkrétní zdroje řešené oblasti. Existující dokument aktualizuj na jeho obvyklém místě. V novém projektu lze začít souborem `docs/solution-architecture.md` podle [šablony](assets/solution-architecture.md).

Odděluj ověřený současný stav, navržený cílový stav, omezení a předpoklady. Ověřená tvrzení propoj se souborem, API kontraktem nebo zdrojem; neoznačuj domněnky za existující implementaci. Neznámé kapacity, SLA, ceny a povinnosti nevymýšlej. Ptej se, pokud odpověď mění zásadní volbu; jinak pokračuj s viditelným předpokladem a dopadem, pokud se nepotvrdí.

## Obsah návrhu

Vyber části, které pro tento návrh mění rozhodnutí:

- Cíl změny, aktéři, kritické scénáře, rozsah a co zůstává mimo něj.
- Kvalitativní cíle jako ověřitelné scénáře: podmínky, zatížení či porucha, očekávaná odezva, metrika a způsob ověření. Neznámý limit označ k dořešení.
- Hranice systému a okolní služby. Uvnitř komponenty s odpovědností, vlastníkem dat a veřejným rozhraním. C4 container je běžící aplikace nebo úložiště, nemusí být Docker kontejner.
- Toky dat a důležité runtime scénáře včetně zamítnutí přístupu, timeoutu nebo částečného selhání. U asynchronních integrací vysvětli idempotenci, pořadí a opakování, pokud na nich záleží.
- Integrační kontrakty: producent a konzument, formát, autentizace, kompatibilita, chybové odpovědi a odpovědnost za změnu. Podrobné schéma může být odkazem.
- Relevantní bezpečnostní hranice a vynucení autorizace, práce s citlivými údaji a tajemstvími. Neprohlašuj soulad s předpisem bez podkladu.
- Nasazení a provoz: prostředí, konfigurace, observabilita, vlastník podpory, zálohy a obnova nebo dostupnost, pokud jsou součástí rizik návrhu.
- Přechod ze současného stavu: pořadí změn, kompatibilita, migrace dat, ověření a rollback. Nevratné kroky pojmenuj.

Pro významnou volbu porovnej doporučené řešení s reálnou alternativou, případně ponecháním stavu. Uveď kritéria, důsledky a podmínku přehodnocení. Složitější rozhodnutí zaznamenej podle [ADR šablony](assets/adr.md); status `accepted` vyžaduje skutečné rozhodnutí oprávněné osoby, návrh sám jej nepřiděluje. Architektura neurčuje automaticky nové produktové požadavky.

## Diagramy a předání

Začni kontextem nebo pohledem na aplikace a úložiště; další úroveň C4 přidej pouze pro konkrétní otázku. Podle potřeby doplň runtime sekvenci, stavový automat nebo deployment. Nemíchej úrovně abstrakce do jednoho přetíženého obrázku. Pojmenuj vztahy a uveď legendu, pokud význam hranic není zřejmý.

V tomto toolchainu používej sousední skill `diagram-design` pro všechny diagramy v editorial stylu. Editovatelným zdrojem je HTML s inline SVG, které udržuj v Gitu cílového projektu vedle dokumentace (například `docs/diagrams/`), ne v Documentoid. Má-li projekt vlastní vizuální styl, ulož ho jako profil diagram-design a v kořeni cílového projektu ho vyber markerem `.diagram-design`; přibalenou kopii skillu v Documentoid neupravuj, jinak ji nepůjde aktualizovat. Jména komponent a směr vazeb musí souhlasit s textem. Pokud je požadováno PDF, použij `documentation-pdf`. Návrh může být kompletní i bez PDF, pokud jej uživatel nechce.

Nepíšeš stavový deník: do návrhu nepatří čísla PR, kódy úkolů ani poznámky „hotovo / čeká“. Až bude návrh realizovaný, zapracuje se do aktuální dokumentace (skill `documentation-compress`).

Před předáním projdi vazbu cíl → rozhodnutí → dopad → ověření. Uveď hlavní rizika, otevřené otázky s vlastníkem, je-li znám, a další proveditelné kroky. Skutečné chování systému neopravuj jen změnou popisu. Označ, co ještě čeká na rozhodnutí nebo ověření; neprohlašuj návrh za schválený ani nasazený.

Metodické odkazy: [C4](https://c4model.com/diagrams), [arc42](https://arc42.org/overview/). Strukturu přizpůsob účelu; není nutné mechanicky vyplnit všechny jejich pohledy.

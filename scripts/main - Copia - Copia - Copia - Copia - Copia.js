const MODULE_ID = 'coracao-de-trabuco';

Hooks.once('ready', async () => {
    if (game.system.id !== 'daggerheart') return;
    console.log(`${MODULE_ID} | Iniciando injeção individual por classe...`);

    // 1. RANGER
    await injectSubclass("Compendium.daggerheart.classes.Item.S4dTxJcuo1VW8o1E", "Compendium.coracao-de-trabuco.personagem.Item.9KlmFQ3F2HolEEdT");

    // 2. GUARDIÃO (Guardian)
    await injectSubclass("Compendium.daggerheart.classes.Item.DGzNP2ejA3XoGSDR", "Compendium.coracao-de-trabuco.personagem.Item.sBelS9j1tIifS63b");

    // 3. SERAFIM (Seraph)
    await injectSubclass("Compendium.daggerheart.classes.Item.Lê9mO4hIBDnL2RFU", "Compendium.coracao-de-trabuco.personagem.Item.16w12QT3wk2mtJ1u");

    // 4. LADINO (Rogue)
    await injectSubclass("Compendium.daggerheart.classes.Item.7v4rk8aUOc9l81kD", "Compendium.coracao-de-trabuco.personagem.Item.2fYAdKji56qYfcLF");

    // 5. GUERREIRO (Warrior)
    await injectSubclass("Compendium.daggerheart.classes.Item.A7yYfCMQ8NMwDLX1", "Compendium.coracao-de-trabuco.personagem.Item.4la0rGljMtYIV0pX");
});

async function injectSubclass(classUuid, subclassUuid) {
    try {
        // Localiza a Classe e o Compêndio
        const classDoc = await fromUuid(classUuid);
        if (!classDoc) return console.warn(`${MODULE_ID} | Não foi possível encontrar a classe: ${classUuid}`);

        const pack = game.packs.get(classDoc.pack);
        
        // Destranca o compêndio
        const wasLocked = pack.locked;
        await pack.configure({ locked: false });

        // Prepara os dados das subclasses
        let subclasses = [...(classDoc.system.subclasses || [])];
        
        // Limpa e verifica duplicatas (mantendo apenas strings de UUID)
        subclasses = subclasses.map(s => typeof s === "string" ? s : s.uuid).filter(s => !!s);
        
        if (!subclasses.includes(subclassUuid)) {
            subclasses.push(subclassUuid);

            // Usa o método estático para evitar o erro de interface (Sheet) do Daggerheart
            await Item.updateDocuments([{
                _id: classDoc.id,
                "system.subclasses": subclasses
            }], { pack: classDoc.pack });

            console.log(`${MODULE_ID} | Injetado com sucesso na classe: ${classDoc.name}`);
        }

        // Tranca novamente
        await pack.configure({ locked: wasLocked });

    } catch (err) {
        console.error(`${MODULE_ID} | Erro ao processar ${classUuid}:`, err);
    }
}
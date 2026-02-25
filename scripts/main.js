const MODULE_ID = 'coracao-de-trabuco';

const SUBCLASS_MAPPINGS = [
    {
        targetClassName: "Ranger", 
        subclassUuid: "Compendium.coracao-de-trabuco.personagem.Item.9KlmFQ3F2HolEEdT",
        systemPackId: "daggerheart.classes" 
    }
];

Hooks.once('ready', async () => {
    if (game.system.id !== 'daggerheart') return;
    console.log(`${MODULE_ID} | Iniciando injeção técnica...`);

    for (const mapping of SUBCLASS_MAPPINGS) {
        await injectSubclassTechnical(mapping);
    }
});

async function injectSubclassTechnical({ targetClassName, subclassUuid, systemPackId }) {
    const systemPack = game.packs.get(systemPackId);
    if (!systemPack) return;

    // PASSO 1: Desbloquear
    const wasLocked = systemPack.locked;
    await systemPack.configure({ locked: false });

    try {
        const index = await systemPack.getIndex();
        const classEntry = index.find(e => e.name === targetClassName);

        if (!classEntry) return;

        // PASSO 2: Obter dados brutos para evitar o erro de Sheet do sistema
        const classDoc = await systemPack.getDocument(classEntry._id);
        let subclasses = [...(classDoc.system.subclasses || [])];

        // Normalizar a lista para garantir que são apenas strings (UUIDs)
        subclasses = subclasses.map(s => typeof s === "string" ? s : s.uuid).filter(s => !!s);

        if (!subclasses.includes(subclassUuid)) {
            subclasses.push(subclassUuid);

            // PASSO 3: Update via Compêndio (Ignora gatilhos de renderização da Sheet)
            // Isso evita o erro "Cannot set properties of undefined" no daggerheart.js
            await systemPack.updateDocuments([{
                _id: classEntry._id,
                "system.subclasses": subclasses
            }]);
            
            console.log(`${MODULE_ID} | Sucesso: ${subclassName || 'Subclasse'} injetada no ${targetClassName}.`);
        }
    } catch (err) {
        console.error(`${MODULE_ID} | Erro na injeção técnica:`, err);
    } finally {
        // PASSO 4: Bloquear novamente
        await systemPack.configure({ locked: wasLocked });
    }
}
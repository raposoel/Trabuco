Hooks.once('ready', async () => {
    if (game.system.id !== 'daggerheart') return;
    const pack = game.packs.get("daggerheart.classes");
    const index = await pack.getIndex();
    const entry = index.find(e => e.name === "Seraph" || e.name === "Serafim");
    if (entry) {
        const classDoc = await pack.getDocument(entry._id);
        const wasLocked = pack.locked;
        await pack.configure({locked: false});
        let subclasses = [...(classDoc.system.subclasses || [])].map(s => typeof s === "string" ? s : s.uuid);
        const scUuid = "Compendium.coracao-de-trabuco.personagem.Item.16w12QT3wk2mtJ1u";
        if (!subclasses.includes(scUuid)) {
            subclasses.push(scUuid);
            await Item.updateDocuments([{_id: classDoc.id, "system.subclasses": subclasses}], {pack: pack.collection});
            console.log("Coração de Trabuco | Serafim atualizado");
        }
        await pack.configure({locked: wasLocked});
    }
});
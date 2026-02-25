Hooks.once('ready', async () => {
    if (game.system.id !== 'daggerheart') return;
    
    // Pequeno atraso para não colidir com outros scripts rodando ao mesmo tempo
    await new Promise(r => setTimeout(r, 500));

    const pack = game.packs.get("daggerheart.classes");
    const index = await pack.getIndex();
    const entry = index.find(e => e.name === "Guardian" || e.name === "Guardião");
    
    if (entry) {
        const classDoc = await pack.getDocument(entry._id);
        
        // Garante que o compêndio está destrancado
        const wasLocked = pack.locked;
        if (wasLocked) await pack.configure({locked: false});
        
        try {
            let subclasses = [...(classDoc.system.subclasses || [])].map(s => typeof s === "string" ? s : s.uuid);
            const scUuid = "Compendium.coracao-de-trabuco.personagem.Item.sBelS9j1tIifS63b";
            
            if (!subclasses.includes(scUuid)) {
                subclasses.push(scUuid);
                
                // Força a atualização esperando o banco de dados responder
                await Item.updateDocuments([{
                    _id: classDoc.id, 
                    "system.subclasses": subclasses
                }], {pack: pack.collection});
                
                console.log("Coração de Trabuco | Guardião atualizado com sucesso");
            }
        } catch (err) {
            console.error("Coração de Trabuco | Erro ao atualizar Guardião:", err);
        } finally {
            // Só tranca de volta se ele estava trancado originalmente
            if (wasLocked) await pack.configure({locked: true});
        }
    }
});
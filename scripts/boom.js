Hooks.once('ready', async () => {
    if (game.system.id !== 'daggerheart') return;
    if (!game.user.isGM) return; // Só GM executa

    // Delay para garantir carregamento
    await new Promise(r => setTimeout(r, 3000));

    const macroUuid = "Compendium.coracao-de-trabuco.macro.Macro.ebiwRMd2IkAe6vb6";
    const settingKey = "trabuco.subclassesSynced";

    // Registra a setting se não existir (faz só uma vez)
    if (!game.settings.settings.has(`core.${settingKey}`)) {
        game.settings.register("core", settingKey, {
            name: "Trabuco Subclasses Synced",
            hint: "Flag interna para sincronização de subclasses",
            scope: "world",
            config: false,
            type: Boolean,
            default: false
        });
    }

    const alreadySynced = game.settings.get("core", settingKey) ?? false;

    if (alreadySynced) {
        console.log("Coração de Trabuco | Sincronização já realizada anteriormente. Pulando.");
        return;
    }

    // CHECAGEM ANTES: verifica se todas as subclasses já estão vinculadas
    const mapping = [
        { cId: "BTyfve69LKqoOi9S", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.9KlmFQ3F2HolEEdT" }, // Ranger
        { cId: "nRAyoC0fOzXPDa4z", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.sBelS9j1tIifS63b" }, // Guardião
        { cId: "CvHlkHZfpMiCz5uT", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.2fYAdKji56qYfcLF" }, // Ladino
        { cId: "5ZnlJ5bEoyOTkUJv", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.16w12QT3wk2mtJ1u" }, // Serafim
        { cId: "xCUWwJz4WSthvLfy", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.4la0rGljMtYIV0pX" }  // Guerreiro
    ];

    const classPack = game.packs.get("daggerheart.classes");
    let needsSync = false;

    try {
        for (const entry of mapping) {
            const classDoc = await classPack.getDocument(entry.cId);
            if (!classDoc) {
                needsSync = true;
                console.warn(`Coração de Trabuco | Classe não encontrada: ${entry.cId}`);
                break;
            }

            let subclasses = classDoc.system.subclasses || [];
            if (!subclasses.includes(entry.scUuid)) {
                needsSync = true;
                console.log(`Coração de Trabuco | Vinculação faltando para ${entry.scUuid}`);
                break;
            }
        }
    } catch (checkErr) {
        console.warn("Coração de Trabuco | Erro ao verificar vinculação:", checkErr);
        needsSync = true;
    }

    // Se já estiver tudo sincronizado, marca setting e pula (sem mensagem)
    if (!needsSync) {
        console.log("Coração de Trabuco | Tudo já sincronizado. Marcando flag e pulando envio de mensagem.");
        await game.settings.set("core", settingKey, true);
        return;
    }

    // Prossegue com tentativa automática + fallback mensagem
    try {
        const macro = await fromUuid(macroUuid);

        if (!macro) throw new Error("Macro não encontrada");

        console.log("Coração de Trabuco | Tentando executar macro automaticamente...");
        await macro.execute();

        // Marca flag como feito
        await game.settings.set("core", settingKey, true);

        console.log("Coração de Trabuco | Macro executada com sucesso automaticamente.");
        ui.notifications.success("Sincronização automática concluída!");

    } catch (err) {
        console.error("Coração de Trabuco | Erro na execução automática:", err);
        ui.notifications.warn("Falha na sincronização automática. Enviando mensagem no chat para execução manual...");

        const chatContent = `
            <p>Olá! Para sincronizar as subclasses do Coração de Trabuco,clique no botão abaixo:</p>
            <button data-action="execute-macro" data-macro-uuid="${macroUuid}">Sincronizar</button>
        `;

        await ChatMessage.create({
            content: chatContent,
            speaker: { alias: "Coração de Trabuco" },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });

        // Event listener pro botão no chat
        Hooks.on("renderChatMessage", (message, html) => {
            html.find('button[data-action="execute-macro"]').click(async (event) => {
                const clickedUuid = event.currentTarget.dataset.macroUuid;
                const clickedMacro = await fromUuid(clickedUuid);
                if (clickedMacro) {
                    await clickedMacro.execute();
                    ui.notifications.success("Macro executada via chat!");
                    // Marca flag após execução manual
                    await game.settings.set("core", settingKey, true);
                } else {
                    ui.notifications.error("Macro não encontrada ao clicar no botão.");
                }
            });
        });
    }
});
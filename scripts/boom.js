const TRABUCO_ID = 'coracao-de-trabuco';
const MACRO_UUID = "Compendium.coracao-de-trabuco.macro.Macro.ebiwRMd2IkAe6vb6";

Hooks.once('ready', async () => {
    if (game.system.id !== 'daggerheart' || !game.user.isGM) return;

    const mapping = [
        { cId: "BTyfve69LKqoOi9S", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.9KlmFQ3F2HolEEdT" },
        { cId: "nRAyoC0fOzXPDa4z", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.sBelS9j1tIifS63b" },
        { cId: "CvHlkHZfpMiCz5uT", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.2fYAdKji56qYfcLF" },
        { cId: "5ZnlJ5bEoyOTkUJv", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.16w12QT3wk2mtJ1u" },
        { cId: "xCUWwJz4WSthvLfy", scUuid: "Compendium.coracao-de-trabuco.personagem.Item.4la0rGljMtYIV0pX" }
    ];

    const classPack = game.packs.get("daggerheart.classes");
    if (!classPack) return;

    // Checagem silenciosa
    let faltaVinculo = false;
    for (const entry of mapping) {
        const classDoc = await classPack.getDocument(entry.cId);
        if (classDoc) {
            const lista = Array.from(classDoc.system.subclasses || []).map(s => typeof s === "string" ? s : s.uuid);
            if (!lista.includes(entry.scUuid)) {
                faltaVinculo = true;
                break;
            }
        }
    }

    if (!faltaVinculo) return;

    const content = `
        <div class="daggerheart dh-style">
            <img src="modules/coracao-de-trabuco/imgs/icon-pe-na-porta.webp" style="border:none; display:block; margin: 0 auto 10px; width: 60px;">
            <p style="text-align:center"><b>Sincronização de Subclasses</b></p>
            <p style="font-size: 0.9em">Para que as vincular as subclasses deste módulo e fazer com que apareçam no <b>Criador de Personagem</b>, clique no botão abaixo:</p>
            <p style="text-align:center"><button class="trabuco-sync-btn" style="background: #18162e; color: white; cursor: pointer;">
                <i class="fas fa-sync-alt"></i> <b>Sincronizar Agora 💥</b>
            </button></p>
        </div>
    `;

    await ChatMessage.create({ content, speaker: { alias: "Sistema" }, whisper: [game.user.id] });
});

// Hook moderno para v13 (HTML puro)
Hooks.on("renderChatMessageHTML", (message, html) => {
    const btn = html.querySelector(".trabuco-sync-btn");
    if (!btn) return;

    btn.addEventListener("click", async (ev) => {
        ev.preventDefault();
        const macro = await fromUuid(MACRO_UUID);
        if (macro) {
            await macro.execute();
        } else {
            ui.notifications.error("Macro não encontrada no compêndio!");
        }
    });
});
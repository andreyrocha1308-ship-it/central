function switchTab(id, btn) {
    // 1. Atualiza os botões
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Atualiza a visibilidade dos sistemas
    document.querySelectorAll('iframe').forEach(frame => frame.classList.remove('active'));
    const targetFrame = document.getElementById('iframe-' + id);
    targetFrame.classList.add('active');

    // 3. Opcional: Recarrega o frame ao clicar para atualizar dados do LocalStorage
    // Isso garante que se você mudar algo em uma aba, a outra veja a mudança ao ser aberta.
    targetFrame.contentWindow.location.reload();
}

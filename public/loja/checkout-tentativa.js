// Guarda somente o identificador da tentativa; endereço e CPF não vão para o armazenamento.
export function criarTentativaCheckout(clienteId, apiFetch) {
    const armazenamento = "hkCheckoutTentativa:" + clienteId;
    let chave;
    function ler() {
        if (chave) return chave;
        try { chave = sessionStorage.getItem(armazenamento); }
        catch { throw new Error("Permita o armazenamento deste site no navegador para finalizar com segurança."); }
        if (chave && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(chave)) {
            throw new Error("Não foi possível conferir sua última tentativa. Consulte Meus pedidos antes de continuar.");
        }
        return chave;
    }
    async function recuperar() {
        if (!ler()) return null;
        try { return await apiFetch("/checkout/" + chave); }
        catch (erro) { if (erro.status === 404) return null; throw erro; }
    }
    async function enviar(dados) {
        if (!ler()) {
            const bytes = crypto.getRandomValues(new Uint8Array(16));
            bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
            const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
            const nova = hex.slice(0,8) + "-" + hex.slice(8,12) + "-" + hex.slice(12,16) + "-" + hex.slice(16,20) + "-" + hex.slice(20);
            // Só envia após persistir: recarregar a página não pode perder a tentativa.
            try { sessionStorage.setItem(armazenamento, nova); }
            catch { throw new Error("Permita o armazenamento deste site no navegador para finalizar com segurança."); }
            chave = nova;
        }
        try {
            return await apiFetch("/checkout", { method: "POST",
                headers: { "X-Loja-Cliente": "1", "Idempotency-Key": chave }, body: JSON.stringify(dados) });
        } catch (erro) {
            if (erro.status === 409) {
                const existente = await recuperar();
                if (existente) return existente;
            }
            // Mantém a chave até receber o pedido, mesmo após falha ou timeout.
            if (!erro.status || erro.status >= 500) throw new Error("Não foi possível confirmar a resposta da loja. Tente finalizar novamente: vamos conferir se seu pedido já foi criado antes de enviar outra vez.");
            throw erro;
        }
    }
    function concluir() {
        try { sessionStorage.removeItem(armazenamento); chave = null; } catch { /* mantém a recuperação disponível */ }
    }
    return { recuperar, enviar, concluir };
}

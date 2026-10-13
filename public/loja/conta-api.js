export async function contaApi(caminho, dados) {
    const resposta = await fetch(caminho, {
        credentials: "same-origin",
        ...(dados === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json", "X-Loja-Cliente": "1" }, body: JSON.stringify(dados) })
    });
    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) { const erro = new Error(corpo.mensagem || "Nao foi possivel acessar sua conta"); erro.status = resposta.status; erro.campos = corpo.campos; erro.tentarEmSegundos = Number(resposta.headers.get("Retry-After")) || 0; throw erro; }
    return corpo;
}
export async function obterContaCliente() {
    try { return await contaApi("/conta/me"); }
    catch (erro) { if (erro.status === 401) return null; throw erro; }
}

// Aceita somente paginas da loja, nunca um endereco externo enviado pela URL.
const destinosLogin = { carrinho: "/loja/carrinho", solicitacao: "/loja/solicitacao", acompanhamento: "/loja/acompanhamento" };
function parametrosRetorno(acao, busca) {
    const origem = new URLSearchParams(busca);
    const resultado = new URLSearchParams();
    const campos = acao === "solicitacao" ? ["produtoId", "produto", "descricao", "linkReferencia"] : acao === "acompanhamento" ? ["pedido"] : [];
    for (const campo of campos) {
        const valor = origem.get(campo);
        if (valor) resultado.set(campo, valor.slice(0, 2000));
    }
    return resultado;
}
export function destinoAposLogin(busca = location.search) {
    const acao = new URLSearchParams(busca).get("voltar");
    const caminho = destinosLogin[acao];
    if (!Object.hasOwn(destinosLogin, acao)) return "/loja";
    const params = parametrosRetorno(acao, busca).toString();
    return caminho + (params ? "?" + params : "");
}
export function urlLoginPara(acao, busca = location.search) {
    const params = parametrosRetorno(acao, busca);
    if (Object.hasOwn(destinosLogin, acao)) params.set("voltar", acao);
    return "/loja/conta" + (params.size ? "?" + params.toString() : "");
}
export async function exigirContaNaPagina(acao) {
    const conta = await obterContaCliente();
    if (!conta) location.replace(urlLoginPara(acao));
    return conta;
}

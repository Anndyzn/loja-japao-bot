import { iniciarSolicitacoesConta } from "./conta-solicitacoes.js";
import { iniciarEnderecoConta } from "./conta-endereco.js";
import { prepararFormularioConta } from "./conta-formulario.js";
import { aplicarConfiguracaoPublica } from "./configuracao.js";
import { contaApi, obterContaCliente, destinoAposLogin } from "./conta-api.js";
import { esquecerUltimoPedido } from "./pedido-sessao.js";
void aplicarConfiguracaoPublica("Minha conta");
const el = id => document.getElementById(id);
const feedback = mensagem => { el("conta-feedback").textContent = mensagem; };
const enderecoConta = iniciarEnderecoConta();
const solicitacoesConta = iniciarSolicitacoesConta({ document });
let recuperacao = null;
function receberRecuperacao() {
    const token = new URLSearchParams(location.hash.slice(1)).get("recuperacao");
    if (!token) return false;
    recuperacao = token;
    history.replaceState(null, "", location.pathname + location.search);
    return true;
}
receberRecuperacao();
let consultaPedidos = 0;
let pagina = 1, totalPaginas = 0;
function mostrar(id, ativo) { el(id).classList.toggle("hidden", !ativo); }
function formulario(dados) { return Object.fromEntries(new FormData(dados)); }
async function listarPedidos() {
    const consulta = ++consultaPedidos;
    const lista = el("conta-pedidos"); lista.replaceChildren();
    const resposta = await contaApi("/conta/pedidos?pagina=" + pagina);
    if (consulta !== consultaPedidos) return;
    totalPaginas = resposta.totalPaginas;
    if (!resposta.dados.length) lista.textContent = "Voce ainda nao tem pedidos nesta conta.";
    for (const pedido of resposta.dados) {
        const card = document.createElement("article");card.className = "tracking-card";
        const texto = document.createElement("p");
        texto.textContent = "Pedido #" + pedido.id + " - " + ({pendente:"Aguardando Pix",pago:"Em preparacao",enviado:"Enviado",cancelado:"Cancelado"}[pedido.status] || pedido.status) + " - " + Number(pedido.total).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
        const link = document.createElement("a");link.className = "ghost-link";link.href = "/loja/acompanhamento?pedido=" + pedido.id;link.textContent = "Ver pedido";
        card.append(texto, link);lista.append(card);
    }
    el("pedidos-pagina").textContent = "Pagina " + pagina + " de " + Math.max(1,totalPaginas);
    el("pedidos-anterior").disabled = pagina <= 1; el("pedidos-proximo").disabled = pagina >= totalPaginas;
}
async function carregar() {
    mostrar("conta-recuperacao", false);
    mostrar("redefinicao-voltar", !!recuperacao);
    if (recuperacao) { solicitacoesConta.limpar();consultaPedidos++;mostrar("conta-acesso",false);mostrar("conta-logada",false);mostrar("conta-ativar",true);return; }
    const conta = await obterContaCliente();
    if (recuperacao) return;
    mostrar("conta-acesso",!conta);mostrar("conta-logada",!!conta);mostrar("conta-ativar",false);
    if (conta && destinoAposLogin() !== "/loja") { location.replace(destinoAposLogin());return; }
    if (conta) {enderecoConta.carregar(conta.cliente);el("conta-nome").textContent = "Ola, " + conta.cliente.nome + "! Conta: " + conta.emailLogin;await Promise.all([listarPedidos(), solicitacoesConta.iniciar()]);
        const ancora = location.hash.slice(1);
        if (["minhas-solicitacoes", "meus-pedidos", "meu-endereco"].includes(ancora)) el(ancora).scrollIntoView({ block: "start" });
    }
}
for (const [id,rota] of [["conta-entrar","entrar"],["conta-cadastro","registrar"],["conta-ativar","redefinir-senha"]]) {
    const form = el(id);
    const validacao = prepararFormularioConta(form, rota === "redefinir-senha" ? "ativar" : rota);
    const resumo = document.createElement("p");
    resumo.className = "conta-aviso"; resumo.setAttribute("role", "status"); resumo.hidden = true;
    form.prepend(resumo);
    const avisar = (mensagem, erro = false) => { resumo.textContent = mensagem; resumo.hidden = !mensagem; resumo.classList.toggle("conta-aviso-erro", erro); };
    form.addEventListener("input", () => avisar(""));
    form.addEventListener("submit", async evento => {
        evento.preventDefault();if(form.inert)return;
        feedback("");
        if (!validacao.validar()) { avisar("Confira os campos destacados antes de continuar.", true); return; }
        const dados = formulario(form);
        delete dados.confirmacao;if (rota === "redefinir-senha") dados.token = recuperacao;
        form.inert=true;form.setAttribute("aria-busy", "true");avisar("Aguarde...");
        try {
            await contaApi("/conta/" + rota,dados);consultaPedidos++;recuperacao=null;pagina=1;form.reset();esquecerUltimoPedido();
            if (rota === "redefinir-senha") {
                enderecoConta.limpar();solicitacoesConta.limpar();el("conta-pedidos").replaceChildren();
                el("conta-entrar").reset();
                mostrar("conta-ativar",false);mostrar("redefinicao-voltar",false);mostrar("conta-logada",false);mostrar("conta-acesso",true);
                mostrarFormularioAcesso(false);
                feedback("Senha alterada. Entre com sua nova senha.");
                return;
            }
            feedback("Voce entrou na sua conta.");
            location.assign(destinoAposLogin());
        } catch (erro) {
            form.inert = false;
            validacao.errosServidor(erro.campos);
            const espera = erro.status === 429 && erro.tentarEmSegundos > 0
                ? " Tente novamente em " + Math.ceil(erro.tentarEmSegundos / 60) + " min."
                : "";
            avisar(erro.message + espera, true);
        } finally { form.inert = false; form.removeAttribute("aria-busy"); }
    });
}
function mostrarFormularioAcesso(cadastro) {
    mostrar("conta-recuperacao", false);
    mostrar("conta-entrar", !cadastro); mostrar("conta-cadastro", cadastro); feedback("");
    for (const [id, ativo] of [["mostrar-entrar", !cadastro], ["mostrar-cadastro", cadastro]]) {
        el(id).classList.toggle("ghost-button", !ativo);
        el(id).setAttribute("aria-pressed", String(ativo));
    }
}
el("mostrar-entrar").addEventListener("click", () => mostrarFormularioAcesso(false));
el("mostrar-cadastro").addEventListener("click", () => mostrarFormularioAcesso(true));
el("conta-sair").addEventListener("click",async()=>{
    try {await contaApi("/conta/sair",{});enderecoConta.limpar();solicitacoesConta.limpar();consultaPedidos++;esquecerUltimoPedido();el("conta-pedidos").replaceChildren();pagina=1;feedback("Voce saiu da conta.");await carregar();}catch(erro){feedback(erro.message);}
});
for (const [id,delta] of [["pedidos-anterior",-1],["pedidos-proximo",1]]) el(id).addEventListener("click",async()=>{
    el("pedidos-anterior").disabled=el("pedidos-proximo").disabled=true;
    const anterior=pagina;pagina=Math.max(1,pagina+delta);try{await listarPedidos();}catch(erro){pagina=anterior;feedback(erro.message);}finally{el("pedidos-anterior").disabled=pagina<=1;el("pedidos-proximo").disabled=pagina>=totalPaginas;}
});
window.addEventListener("hashchange", () => { if (receberRecuperacao()) void carregar().catch(erro => feedback(erro.message)); });
try {await carregar();}catch(erro){feedback(erro.message);}

const recuperarForm = el("conta-recuperar");
const recuperarValidacao = prepararFormularioConta(recuperarForm, "recuperar");
const recuperarAviso = el("recuperacao-feedback");
const recuperarBotao = recuperarForm.querySelector("button[type=submit]");
el("esqueci-senha").addEventListener("click", async () => {
    feedback("");mostrar("conta-acesso",false);mostrar("conta-recuperacao",true);
    recuperarForm.elements.email.value = el("conta-entrar").elements.email.value;
    recuperarBotao.disabled = true;recuperarAviso.textContent = "Verificando disponibilidade...";
    try {
        const resposta = await contaApi("/conta/recuperacao-disponivel");
        recuperarBotao.disabled = !resposta.disponivel;
        recuperarAviso.textContent = resposta.disponivel ? "O link vale por 30 minutos e só pode ser usado uma vez." : "A recuperação de senha por e-mail ainda não está disponível nesta loja.";
    } catch { recuperarAviso.textContent = "Não foi possível verificar a recuperação. Volte e tente novamente."; }
});
recuperarForm.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (recuperarBotao.disabled || recuperarForm.inert || !recuperarValidacao.validar()) return;
    recuperarForm.inert = true;recuperarForm.setAttribute("aria-busy", "true");
    recuperarAviso.textContent = "Solicitando link...";
    try {
        const resposta = await contaApi("/conta/recuperar-senha", formulario(recuperarForm));
        recuperarAviso.textContent = resposta.mensagem;
    } catch (erro) {
        recuperarValidacao.errosServidor(erro.campos);
        recuperarAviso.textContent = erro.message + (erro.status === 429 && erro.tentarEmSegundos > 0 ? " Tente novamente em " + Math.ceil(erro.tentarEmSegundos / 60) + " min." : "");
    } finally { recuperarForm.inert = false;recuperarForm.removeAttribute("aria-busy"); }
});
function voltarParaEntrar() {
    recuperacao = null;el("conta-ativar").reset();
    mostrar("conta-ativar",false);mostrar("redefinicao-voltar",false);mostrar("conta-acesso",true);
    mostrarFormularioAcesso(false);
}
el("recuperacao-voltar").addEventListener("click", voltarParaEntrar);
el("redefinicao-voltar").addEventListener("click", voltarParaEntrar);

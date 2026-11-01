import { pathToFileURL } from 'node:url';

// Consulta somente a conta autenticada. Nao cria orders nem pagamentos.
export async function verificarMercadoPago(valores, requisitar = fetch) {
    const token = valores.MERCADO_PAGO_ACCESS_TOKEN?.trim();
    if (!token) throw new Error('Preencha MERCADO_PAGO_ACCESS_TOKEN no .env com o Access Token da aba Teste.');
    if (/\s/.test(token)) throw new Error('O Access Token contem espacos ou quebras de linha. Copie novamente no painel.');

    let resposta;
    try {
        resposta = await requisitar('https://api.mercadolibre.com/users/me', {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
            redirect: 'error',
            signal: AbortSignal.timeout(10000)
        });
    } catch {
        throw new Error('Nao foi possivel conectar ao Mercado Pago. Confira a internet e tente novamente.');
    }
    // Nunca exibir corpo da API ou erro original: podem conter dados privados.
    if (resposta.status === 401 || resposta.status === 403) {
        throw new Error('A API recusou o acesso. Confira o Access Token e as permissoes da aplicacao no painel.');
    }
    if (resposta.status === 429) throw new Error('Mercado Pago limitou as consultas. Aguarde antes de tentar novamente.');
    if (!resposta.ok) throw new Error('Mercado Pago indisponivel para esta consulta (HTTP ' + resposta.status + '). Tente mais tarde.');

    let conta;
    try { conta = await resposta.json(); } catch {
        throw new Error('A API retornou uma resposta invalida. Tente novamente mais tarde.');
    }
    if (!conta || !Number.isSafeInteger(conta.id) || conta.id <= 0 || typeof conta.site_id !== 'string') {
        throw new Error('A API nao retornou uma conta reconhecida. Confira a aplicacao no painel.');
    }
    if (conta.site_id !== 'MLB') throw new Error('A conta retornada nao e do Brasil. Confira as credenciais da aplicacao brasileira.');
    return 'Conexao OK: a API aceitou a credencial de uma conta do Brasil. Nenhuma cobranca foi criada.';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        try { process.loadEnvFile('.env'); } catch (erro) {
            if (erro.code !== 'ENOENT') throw new Error('Nao foi possivel carregar o .env. Confira o arquivo local.');
        }
        console.log(await verificarMercadoPago(process.env));
        console.log('Esta consulta nao comprova o ambiente nem habilita o checkout. Confirme no painel que copiou da aba Teste; o prefixo do token nao distingue teste de producao.');
    } catch (erro) {
        console.error(erro.message);
        process.exitCode = 1;
    }
}

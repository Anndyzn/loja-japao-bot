type ResultadoParametrosPaginacao = {
    pagina?: number | undefined;
    limite?: number | undefined;
    mensagemErro?: string;
};

type ResultadoConversaoInteiro =
    | {
        valor: number;
        mensagemErro?: undefined;
    }
    | {
        valor?: undefined;
        mensagemErro: string;
    };

function converterParaInteiroPositivo(valor: unknown, nomeCampo: string, valorPadrao: number): ResultadoConversaoInteiro {
    if (valor === undefined) {
        return {
            valor: valorPadrao
        };
    }

    if (typeof valor !== "string" || valor.trim() === "") {
        return {
            mensagemErro: `${nomeCampo} deve ser um número inteiro positivo`
        };
    }

    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero <= 0) {
        return {
            mensagemErro: `${nomeCampo} deve ser um número inteiro positivo`
        };
    }

    return {
        valor: numero
    };
}

export function obterParametrosPaginacao(paginaQuery: unknown, limiteQuery: unknown): ResultadoParametrosPaginacao {
    const paginaResultado = converterParaInteiroPositivo(paginaQuery, "Página", 1);

    if (paginaResultado.mensagemErro) {
        return {
            mensagemErro: paginaResultado.mensagemErro
        };
    }

    const limiteResultado = converterParaInteiroPositivo(limiteQuery, "Limite", 10);

    if (limiteResultado.mensagemErro) {
        return {
            mensagemErro: limiteResultado.mensagemErro
        };
    }

    const pagina = paginaResultado.valor;
    const limite = limiteResultado.valor;

    if (pagina === undefined || limite === undefined) {
        return {
            mensagemErro: "Parâmetros de paginação inválidos"
        };
    }

    if (limite > 50) {
        return {
            mensagemErro: "Limite deve ser menor ou igual a 50"
        };
    }

    return {
        pagina,
        limite
    };
}

export function paginarLista<T>(itens: T[], pagina: number, limite: number) {
    const total = itens.length;
    const totalPaginas = Math.ceil(total / limite);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;

    return {
        dados: itens.slice(inicio, fim),
        pagina,
        limite,
        total,
        totalPaginas
    };
}

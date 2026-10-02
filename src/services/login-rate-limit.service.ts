import { env } from "../config/env.js";

type RegistroTentativasLogin = {
    falhas: number;
    primeiraFalhaEm: number;
    ultimaFalhaEm: number;
    bloqueadoAte?: number;
};

type ResultadoBloqueioLogin =
    | {
        bloqueado: false;
    }
    | {
        bloqueado: true;
        segundosRestantes: number;
        tentarNovamenteEm: Date;
    };

const tentativasLogin = new Map<string, RegistroTentativasLogin>();
const JANELA_FALHAS_MS = env.ADMIN_LOGIN_BLOQUEIO_MINUTOS * 60 * 1000;
const BLOQUEIO_MS = env.ADMIN_LOGIN_BLOQUEIO_MINUTOS * 60 * 1000;

function obterAgora() {
    return Date.now();
}

function calcularBloqueio(bloqueadoAte: number, agora: number): ResultadoBloqueioLogin {
    return {
        bloqueado: true,
        segundosRestantes: Math.ceil((bloqueadoAte - agora) / 1000),
        tentarNovamenteEm: new Date(bloqueadoAte)
    };
}

export function verificarBloqueioLogin(chave: string): ResultadoBloqueioLogin {
    const agora = obterAgora();
    const registro = tentativasLogin.get(chave);

    if (!registro) {
        return {
            bloqueado: false
        };
    }

    if (registro.bloqueadoAte !== undefined) {
        if (registro.bloqueadoAte > agora) {
            return calcularBloqueio(registro.bloqueadoAte, agora);
        }

        tentativasLogin.delete(chave);

        return {
            bloqueado: false
        };
    }

    if (agora - registro.primeiraFalhaEm > JANELA_FALHAS_MS) {
        tentativasLogin.delete(chave);
    }

    return {
        bloqueado: false
    };
}

export function registrarFalhaLogin(chave: string): ResultadoBloqueioLogin {
    const agora = obterAgora();
    const registroAtual = tentativasLogin.get(chave);
    const registro: RegistroTentativasLogin =
        registroAtual && agora - registroAtual.primeiraFalhaEm <= JANELA_FALHAS_MS
            ? registroAtual
            : {
                falhas: 0,
                primeiraFalhaEm: agora,
                ultimaFalhaEm: agora
            };

    registro.falhas += 1;
    registro.ultimaFalhaEm = agora;

    if (registro.falhas >= env.ADMIN_LOGIN_MAX_TENTATIVAS) {
        registro.bloqueadoAte = agora + BLOQUEIO_MS;
    }

    tentativasLogin.set(chave, registro);

    return verificarBloqueioLogin(chave);
}

export function limparFalhasLogin(chave: string) {
    tentativasLogin.delete(chave);
}

import { prisma } from "../lib/prisma.js";
import { gerarHashSenha, senhaConfere } from "../utils/senhas.js";
import { gerarTokenAdmin } from "../utils/tokens.js";

export async function loginAdmin(email: string, senha: string) {
    const admin = await prisma.admin.findUnique({
        where: {
            email
        }
    });

    if (!admin) {
        return undefined;
    }

    if (!senhaConfere(senha, admin.senhaHash)) {
        return undefined;
    }

    return {
        token: gerarTokenAdmin({
            id: admin.id,
            email: admin.email
        }),
        admin: {
            id: admin.id,
            nome: admin.nome,
            email: admin.email
        }
    };
}

export async function obterAdminPorId(adminId: number) {
    const admin = await prisma.admin.findUnique({
        where: {
            id: adminId
        }
    });

    if (!admin) {
        return undefined;
    }

    return {
        id: admin.id,
        nome: admin.nome,
        email: admin.email
    };
}

export async function alterarSenhaAdmin(adminId: number, senhaAtual: string, novaSenha: string) {
    const admin = await prisma.admin.findUnique({
        where: {
            id: adminId
        }
    });

    if (!admin) {
        return {
            sucesso: false as const,
            mensagemErro: "Admin nao encontrado"
        };
    }

    if (!senhaConfere(senhaAtual, admin.senhaHash)) {
        return {
            sucesso: false as const,
            mensagemErro: "Senha atual invalida"
        };
    }

    const adminAtualizado = await prisma.admin.update({
        where: {
            id: adminId
        },
        data: {
            senhaHash: gerarHashSenha(novaSenha)
        }
    });

    return {
        sucesso: true as const,
        admin: {
            id: adminAtualizado.id,
            nome: adminAtualizado.nome,
            email: adminAtualizado.email
        }
    };
}

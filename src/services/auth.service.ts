import { prisma } from "../lib/prisma.js";
import { senhaConfere } from "../utils/senhas.js";
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

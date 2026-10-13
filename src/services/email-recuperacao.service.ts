import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Credenciais e links nunca sao registrados nos logs.
export const emailRecuperacao = {
    disponivel: () => env.EMAIL_RECUPERACAO !== null,
    async enviar(destinatario: string, token: string) {
        const config = env.EMAIL_RECUPERACAO;
        if (!config) throw new Error("E-mail de recuperacao nao configurado");
        const transporte = nodemailer.createTransport({
            host: config.host, port: config.port, secure: config.port === 465,
            requireTLS: true, auth: { user: config.user, pass: config.password },
            connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
            disableFileAccess: true, disableUrlAccess: true
        });
        const link = new URL("/loja/conta", config.origem);
        link.hash = "recuperacao=" + token;
        const resultado = await transporte.sendMail({
            from: { name: env.APP_NOME, address: config.remetente }, to: { address: destinatario, name: "" },
            subject: "Redefina sua senha - " + env.APP_NOME,
            text: "Recebemos um pedido para redefinir a senha da sua conta.\n\n" + link.href +
                "\n\nO link vale por 30 minutos e so pode ser usado uma vez. Depois de salvar a nova senha, entre novamente na loja." +
                "\nSe voce nao solicitou a troca, ignore este e-mail. Sua senha continua a mesma."
        });
        if (!resultado.accepted.length) throw new Error("Envio de recuperacao nao aceito");
    }
};

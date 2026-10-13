import { prisma } from "../lib/prisma.js";
import { ErroConta } from "./conta-cliente.service.js";

const limites = { cep: 9, endereco: 200, numero: 30, complemento: 150, bairro: 100, cidade: 100, estado: 2, referencia: 200 };
type CampoEndereco = keyof typeof limites;
export function validarEnderecoConta(entrada: unknown) {
    if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) throw new ErroConta("Informe seu endereço.");
    const campos: Record<string, string> = {};
    const dados = entrada as Record<string, unknown>;
    if (Object.keys(dados).some(campo => !Object.hasOwn(limites, campo))) throw new ErroConta("Envie apenas os campos de endereço.");
    const endereco = {} as Record<CampoEndereco, string>;
    for (const campo of Object.keys(limites) as CampoEndereco[]) {
        const valor = dados[campo];
        const opcional = campo === "complemento" || campo === "referencia";
        if ((valor !== undefined && typeof valor !== "string") || (!opcional && (typeof valor !== "string" || !valor.trim()))) campos[campo] = "Preencha este campo.";
        endereco[campo] = typeof valor === "string" ? valor.trim() : "";
        if (endereco[campo].length > limites[campo]) campos[campo] = "Use até " + limites[campo] + " caracteres.";
    }
    if (!/^\d{5}-?\d{3}$/.test(endereco.cep)) campos.cep = "Informe os 8 números do CEP.";
    endereco.estado = endereco.estado.toUpperCase();
    if (!"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ").includes(endereco.estado)) campos.estado = "Informe a sigla do estado, como SP.";
    if (Object.keys(campos).length) throw new ErroConta("Confira os campos do endereço.", 400, campos);
    return { ...endereco, cep: endereco.cep.replace(/\D/g, ""), complemento: endereco.complemento || null, referencia: endereco.referencia || null };
}
export async function salvarEnderecoDaConta(clienteId: number, entrada: unknown) {
    const data = validarEnderecoConta(entrada);
    return prisma.cliente.update({ where: { id: clienteId }, data });
}

export type MedidasProduto = {
    pesoKg?: number | null;
    alturaCm?: number | null;
    larguraCm?: number | null;
    comprimentoCm?: number | null;
};
export const camposMedidas = ["pesoKg", "alturaCm", "larguraCm", "comprimentoCm"] as const;
export function validarMedidasProduto(body: Record<string, unknown>) {
    for (const campo of camposMedidas) {
        const valor = body[campo];
        if (valor === undefined || valor === null) continue;
        if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0 || valor > 1000) {
            return campo + " deve ser um numero maior que zero e ate 1000";
        }
        if (campo !== "pesoKg" && !Number.isInteger(valor)) return campo + " deve ser inteiro em centimetros";
        if (campo === "pesoKg" && Math.abs(valor * 1000 - Math.round(valor * 1000)) > 0.000001) {
            return "Peso deve ter no maximo tres casas decimais em kg";
        }
    }
    return undefined;
}
export function extrairMedidasProduto(body: Record<string, unknown>): MedidasProduto {
    return Object.fromEntries(camposMedidas.filter(campo => body[campo] !== undefined).map(campo => [campo, body[campo]]));
}

// Indica o que falta cadastrar, sem fazer uma cotação externa.
export function obterMedidasEnvioPendentes(produto: Partial<Record<(typeof camposMedidas)[number], unknown>>) {
    return camposMedidas.filter(campo => {
        const valor = produto[campo];
        return valor == null || !Number.isFinite(Number(valor)) || Number(valor) <= 0;
    });
}

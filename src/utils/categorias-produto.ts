export const categoriasProduto = [
    { valor: "action_figures", nome: "Action figures" },
    { valor: "eletronicos", nome: "Eletrônicos" },
    { valor: "comidas_doces", nome: "Comidas e doces" },
    { valor: "maquiagens_beleza", nome: "Maquiagens e beleza" },
    { valor: "casa_papelaria", nome: "Casa e papelaria" },
    { valor: "moda_acessorios", nome: "Moda e acessórios" },
    { valor: "outros", nome: "Outros" }
] as const;

export function validarCategoriaProduto(valor: unknown) {
    if (valor === undefined || valor === null) return undefined;
    if (typeof valor !== "string" || !categoriasProduto.some(categoria => categoria.valor === valor)) {
        return "Selecione uma categoria válida ou Sem categoria";
    }
    return undefined;
}

export function nomeCategoriaProduto(valor: string | null) {
    return categoriasProduto.find(categoria => categoria.valor === valor)?.nome ?? "Sem categoria";
}

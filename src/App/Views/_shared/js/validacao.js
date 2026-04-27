export function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarSenha(senha) {
    return senha.length >= 8;
}

export function campoVazio(valor) {
    return valor.trim() === '';
}

export function validarConfirmacao(valor1, valor2) {
    return valor1 === valor2;
}

export function validarTitulo(titulo) {
    return titulo.trim().length >= 3 && titulo.trim().length <= 200;
}

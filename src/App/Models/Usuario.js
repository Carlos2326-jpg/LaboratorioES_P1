class Usuario {

    function Creat(dadosUser) {
        let dados = JSON.parse(localStorage.getItem('dados')) || [];
        dados.push(dadosUser);
        localStorage.setItem('dados', JSON.stringify('dados'));
    }

    function Read() {
        return JSON.parse(localStorage.getItem('dados')) || [];
    }

    function Delete(id) {
        let dados = Read();
        dados.aplice(id, 1);
        localStorage.setItem('dados', JSON.stringify(dados));
    }
}
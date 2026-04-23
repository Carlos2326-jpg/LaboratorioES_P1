class Usuario {
    Creat(dadosUser) {
        let dados = JSON.parse(localStorage.getItem('dados')) || [];
        dados.push(dadosUser);
        localStorage.setItem('dados', JSON.stringify(dados)); 
    }

    Read() {
        return JSON.parse(localStorage.getItem('dados')) || [];
    }

    Update(id, dadosUser) {
        let dados = this.Read(); 
        dados[id] = dadosUser;
        localStorage.setItem('dados', JSON.stringify(dados));
    }

    Delete(id) {
        let dados = this.Read(); 
        dados.splice(id, 1); 
        localStorage.setItem('dados', JSON.stringify(dados));
    }
}
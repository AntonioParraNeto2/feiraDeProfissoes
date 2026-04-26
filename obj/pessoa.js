var API = 'https://cdavelino-915a7-default-rtdb.firebaseio.com/'
class Pessoas {
    constructor(nome, cargo = '', empresa = '', ano = '') {
        this.nome = nome;
        this.cargo = cargo;
        this.empresa = empresa;
        this.ano = ano;
    }

    verificar_pessoa() {
        if (this.cargo !== '') {
            return 'Cordenação'
        } else if (this.empresa !== '') {
            return 'Convidado'
        } else if (this.ano !== '') {
            return 'aluno'
        }
    }

    salvar() {
        let objToSave = {}
        let pessoa = this.verificar_pessoa();
        if (pessoa === 'aluno') {
            objToSave = { nome: this.nome, ano: this.ano }
        } else if (pessoa === 'Convidado') {
            objToSave = { nome: this.nome, empresa: this.empresa }
        } else if (pessoa === 'Cordenação') {
            objToSave = { nome: this.nome, cargo: this.cargo }
        }

        return fetch(`${API}${pessoa}.json`, {
            method: 'POST',
            body: JSON.stringify(objToSave),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }

    fazer_pedido() {
        let time = new Date();
        let tempo = time.getHours() + ':' + time.getMinutes()
        let objToSave = {}
        let kit
        let pessoa = this.verificar_pessoa();
        if (pessoa === 'aluno') {
            objToSave = { nome: this.nome, ano: this.ano, kit: 'kit aluno', horario: tempo }
            
        } else if (pessoa === 'Convidado') {
            objToSave = { nome: this.nome, empresa: this.empresa, kit: 'kit convidado', horario: tempo }
        } else if (pessoa === 'Cordenação') {
            objToSave = { nome: this.nome, cargo: this.cargo, kit: 'kit coordenação', horario: tempo }
        }

        return fetch(`${API}pedidos.json`, {
            method: 'POST',
            body: JSON.stringify(objToSave),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }
}
export default Pessoas;

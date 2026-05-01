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
        let tempo = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0')
        let objToSave = {}
        let pessoa = this.verificar_pessoa();

        if (pessoa === 'aluno') {
            objToSave = { nome: this.nome, ano: this.ano, tipo: 'aluno', kit: 'kit aluno', horario: tempo, status: 'Aguardando separacao', criadoEm: new Date().toISOString(), estoqueBaixado: false }

        } else if (pessoa === 'Convidado') {
            objToSave = { nome: this.nome, empresa: this.empresa, tipo: 'convidado', kit: 'kit convidado', horario: tempo, status: 'Aguardando separacao', criadoEm: new Date().toISOString(), estoqueBaixado: false }
        } else if (pessoa === 'Cordenação') {
            objToSave = { nome: this.nome, cargo: this.cargo, tipo: 'coordenacao', kit: 'kit coordenacao', horario: tempo, status: 'Aguardando separacao', criadoEm: new Date().toISOString(), estoqueBaixado: false }
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

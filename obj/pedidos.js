const API = 'https://cdavelino-915a7-default-rtdb.firebaseio.com/';

class Pedidos {
    constructor(key) {
        this.key = key;
    }

    atualizar_status(status) {
        return fetch(`${API}pedidos/${this.key}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        })
            .then(response => response.json())
            .then(data => {
                return data;
            });
    }
}

export default Pedidos;

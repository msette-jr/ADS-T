const mysql = require('mysql');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root321',
    database: 'mascate',
    port: 3006  // Atualizando a porta para 3006
});

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados: ', erro);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

module.exports = conexao;



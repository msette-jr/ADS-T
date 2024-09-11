const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const http = require('http');
const socketIo = require('socket.io');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sua_senha',
    database: 'mascate',
    port: 3006
});

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados: ', erro);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/reservas', (req, res) => {
    conexao.query('SELECT * FROM reservas ORDER BY id', (erro, resultados) => {
        if (erro) throw erro;
        res.json(resultados);
    });
});

app.post('/reservas', (req, res) => {
    const { nome, telefone, pessoas, prioridade } = req.body;
    const sql = 'INSERT INTO reservas (nome, telefone, pessoas, prioridade) VALUES (?, ?, ?, ?)';
    conexao.query(sql, [nome, telefone, pessoas, prioridade], (erro, resultado) => {
        if (erro) throw erro;
        io.emit('novaReserva', { id: resultado.insertId, nome, telefone, pessoas, prioridade });
        res.json({ id: resultado.insertId });
    });
});

app.put('/reservas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, telefone, pessoas, prioridade } = req.body;
    const sql = 'UPDATE reservas SET nome = ?, telefone = ?, pessoas = ?, prioridade = ? WHERE id = ?';
    conexao.query(sql, [nome, telefone, pessoas, prioridade, id], (erro) => {
        if (erro) throw erro;
        io.emit('atualizarReserva', { id, nome, telefone, pessoas, prioridade });
        res.send('Reserva atualizada com sucesso!');
    });
});

app.delete('/reservas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM reservas WHERE id = ?';
    conexao.query(sql, [id], (erro) => {
        if (erro) throw erro;
        io.emit('removerReserva', id);
        res.send('Reserva removida com sucesso!');
    });
});

io.on('connection', (socket) => {
    console.log('Novo cliente conectado');
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const porta = 3000;
server.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});


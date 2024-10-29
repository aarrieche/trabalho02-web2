const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/addUser', (req, res) => res.render('addUser'));

router.post('/addUser', (req, res) => {
    const { nome, cpf, telefones, emails, telefonePrincipal, emailPrincipal } = req.body;
    const perfil = 'CLIENTE';

    db.run(`INSERT INTO users (nome, cpf, perfil) VALUES (?, ?, ?)`, [nome, cpf, perfil], function (err) {
        if (err) return res.send("Erro ao adicionar usuário");

        const userId = this.lastID;

        telefones.forEach((telefone, index) => {
            db.run(`INSERT INTO telefones (user_id, telefone, principal) VALUES (?, ?, ?)`, [
                userId,
                telefone,
                index == telefonePrincipal ? 1 : 0,
            ]);
        });

        emails.forEach((email, index) => {
            db.run(`INSERT INTO emails (user_id, email, principal) VALUES (?, ?, ?)`, [
                userId,
                email,
                index == emailPrincipal ? 1 : 0,
            ]);
        });

        res.redirect('/users');
    });
});

router.get('/users', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const nome = req.query.nome || '';
    const limit = 5;
    const offset = (page - 1) * limit;

    db.all(`SELECT * FROM users WHERE nome LIKE ? LIMIT ? OFFSET ?`, [`%${nome}%`, limit, offset], (err, users) => {
        if (err) return res.send("Erro ao buscar usuários");

        db.get(`SELECT COUNT(*) as count FROM users WHERE nome LIKE ?`, [`%${nome}%`], (err, result) => {
            if (err) return res.send("Erro ao contar usuários");
            const totalPages = Math.ceil(result.count / limit);
            res.render('userList', { users, page, totalPages, nome });
        });
    });
});

router.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err || !user) return res.status(404).send("Usuário não encontrado");

        db.all(`SELECT * FROM telefones WHERE user_id = ?`, [userId], (err, telefones) => {
            db.all(`SELECT * FROM emails WHERE user_id = ?`, [userId], (err, emails) => {
                res.render('userDetails', { user, telefones, emails });
            });
        });
    });
});

router.get('/updateUser/:id', (req, res) => {
    const userId = req.params.id;

    db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err || !user) return res.send("Erro ao buscar usuário");

        db.all(`SELECT * FROM telefones WHERE user_id = ?`, [userId], (err, telefones) => {
            if (err) return res.send("Erro ao buscar telefones");

            db.all(`SELECT * FROM emails WHERE user_id = ?`, [userId], (err, emails) => {
                if (err) return res.send("Erro ao buscar emails");

                res.render('updateUser', { user, telefones, emails });
            });
        });
    });
});

router.post('/updateUser/:id', (req, res) => {
    const userId = req.params.id;
    const { nome, telefones, emails, telefonePrincipal, emailPrincipal } = req.body;

    db.run(`UPDATE users SET nome = ? WHERE id = ?`, [nome, userId], (err) => {
        if (err) return res.send("Erro ao atualizar usuário");

        telefones.forEach((telefone) => {
            db.run(`UPDATE telefones SET telefone = ?, principal = ? WHERE id = ?`, [
                telefone.numero,
                telefone.id == telefonePrincipal ? 1 : 0,
                telefone.id,
            ]);
        });

        emails.forEach((email) => {
            db.run(`UPDATE emails SET email = ?, principal = ? WHERE id = ?`, [
                email.endereco,
                email.id == emailPrincipal ? 1 : 0,
                email.id,
            ]);
        });

        res.redirect(`/user/${userId}`);
    });
});

router.get('/deleteUser/:id', (req, res) => {
    const userId = req.params.id;
    db.run(`DELETE FROM users WHERE id = ? AND perfil != 'ADMIN'`, [userId], (err) => {
        if (err) return res.send("Erro ao deletar usuário");
        res.redirect('/users');
    });
});

module.exports = router;

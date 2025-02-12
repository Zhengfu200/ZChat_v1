const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const user_db = new sqlite3.Database('./users.db');
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';

const login = (req, res) => {
    const { username, password } = req.body;

    user_db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err || !row) {
            return res.status(400).json({ error: '用户名或密码不正确' });
        }

        bcrypt.compare(password, row.password, (err, result) => {
            if (err || !result) {
                return res.status(400).json({ error: '用户名或密码不正确' });
            }

            const token = jwt.sign({ userId: row.id, username: row.username, user_avatar: row.avatar }, JWT_SECRET);

            res.json({ message: '登陆成功', token })
        })
    })
}

const register = (req, res) => {
    const { username, password, avatar_url } = req.body;
    user_db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询错误' });
        }
        if (row) {
            return res.status(400).json({ error: '用户名已存在' });
        }
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to hash password' });
            }
            const stmt = user_db.prepare("INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)");
            stmt.run(username, hashedPassword, avatar_url, function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to register user' });
                }
                console.log('用户名', username, '用户密码', hashedPassword, "用户头像", avatar_url);
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
}

module.exports = {
    login,
    register,
}
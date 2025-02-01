const sqlite3 = require('sqlite3').verbose();

//用户管理数据库
const user_db = new sqlite3.Database('./users.db');
user_db.serialize(() => {
    user_db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, avatar TEXT,bio TEXT,birthday TEXT)");
});

const accountInfo = (req, res) => {
    const id = req.query.id;
    const userId = parseInt(id, 10);

    user_db.get("SELECT username, avatar, bio, birthday, gender, AboutMe, banner FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询错误' });
        }
        if (!row) {
            return res.status(404).json({ error: '用户未找到' });
        }
        res.json({
            username: row.username,
            avatar: row.avatar,
            bio: row.bio,
            birthday: row.birthday,
            gender: row.gender,
            AboutMe: row.AboutMe,
            banner: row.banner,
        });
    });
};

module.exports = {
    accountInfo,
};
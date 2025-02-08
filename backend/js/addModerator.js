const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const user_db = new sqlite3.Database('./users.db');

const chatroom_db = new sqlite3.Database('./Chatrooms.db');

const addModerator = (req, res) => {
    const { moderator_add, chatroom_id } = req.body;

    user_db.get('SELECT * FROM users WHERE username = ?', [moderator_add], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (!row) {
            return res.status(404).json({ error: '找不到用户' });
        }

        add_user_id = row.id;

        chatroom_db.get("SELECT * FROM chatrooms WHERE id =?", [chatroom_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: '查询聊天室信息失败' });
            }
            if (!row) {
                return res.status(404).json({ error: '找不到匹配的聊天室' });
            }
            const dbPath = row.db_path
            if (!fs.existsSync(dbPath)) {
                return res.status(404).json({ error: 'Chatroom not found' });
            }

            const messages_db = new sqlite3.Database(dbPath);

            messages_db.get('SELECT moderator FROM badges LIMIT 1', (err, result) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                let moderatorValue = result ? result.moderator : '[]'; 
                let moderatorArray = JSON.parse(moderatorValue); 

                const newId = add_user_id.toString();
                if (!moderatorArray.includes(newId)) {
                    moderatorArray.push(newId); 
                }
                moderatorValue = JSON.stringify(moderatorArray);

                messages_db.run('UPDATE badges SET moderator =? WHERE rowid = (SELECT MIN(rowid) FROM badges)', [moderatorValue], (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: '管理员添加成功' });
                });
            });
        });
    })
}

module.exports = {
    addModerator,
};
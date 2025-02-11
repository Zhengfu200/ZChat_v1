const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const jwt = require('jsonwebtoken');

const user_db = new sqlite3.Database('./users.db');
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';
const chatroom_db = new sqlite3.Database('./Chatrooms.db');

const allBanAccount = (req, res) => {
    const chatroom_id = req.query.chatroom_id;
    chatroom_db.get('SELECT * FROM chatrooms WHERE id = ?', [chatroom_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error ' });
        }
        if (!rows) {
            return res.status(404).json({ error: 'Chatroom not found 0' });
        }
        console.log(rows);
        const dbPath = rows.db_path;
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Chatroom not found' });
        }

        const messages_db = new sqlite3.Database(dbPath);

        messages_db.all('SELECT * FROM ban', [], (err, banRows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to retrieve ban accounts' });
            }
            return res.status(200).json({ bannedAccounts: banRows });
        });
    })
}

const addBanAccount = (req, res) => {
    const { ban_account, chatroom_id, token } = req.body;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Sending 401 response', token);
            return res.status(401).json({ error: 'Token is invalid,请尝试重新登陆！' });
        }
        const userId = decoded.userId;

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

            messages_db.get('SELECT owner, moderator FROM badges LIMIT 1', (err, result) => {
                const owner = result.owner;
                const moderator = result.moderator;
                const isUserInMods = isMods(owner, moderator, userId);
                if (!isUserInMods) {
                    return res.status(500).json({ error: '你无权更改聊天室信息' });
                } else {
                    user_db.get('SELECT * FROM users WHERE username =?', [ban_account], (err, row) => {
                        if (err) {
                            return res.status(500).json({ error: 'Initial Server Error' });
                        }

                        if (!row) {
                            return res.status(404).json({ error: '找不到用户' });
                        }

                        const ban_user_id = row.id;
                        messages_db.get('SELECT id FROM ban WHERE id = ?', [ban_user_id], (err, row) => {
                            if (err) {
                                return res.status(500).json({ error: 'Internal Server Error' });
                            }

                            if (!row) {
                                messages_db.run('INSERT INTO ban (id, name) VALUES (?, ?)', [ban_user_id, ban_account], (err) => {
                                    if (err) {
                                        return res.status(500).json({ error: 'Internal Server Error' });
                                    } else {
                                        return res.status(200).json({ message: '添加成功' });
                                    }
                                });
                            } else {
                                return res.status(500).json({ error: '用户已被封禁' });
                            }
                        });

                    })
                }
            });
        });
    })
}

const deleteBanAccount = (req, res) => {
    const { BanAccountId_delete, chatroom_id, token } = req.body;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Sending 401 response', token);
            return res.status(401).json({ error: 'Token is invalid,请尝试重新登陆！' });
        }
        const userId = decoded.userId;

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

            messages_db.get('SELECT owner, moderator FROM badges LIMIT 1', (err, result) => {
                const owner = result.owner;
                const moderator = result.moderator;
                const isUserInMods = isMods(owner, moderator, userId);
                if (!isUserInMods) {
                    return res.status(500).json({ error: '你无权禁言用户' });
                } else {
                    messages_db.run("DELETE FROM ban WHERE id = ?", [BanAccountId_delete], (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            return res.status(200).json({ message: '删除成功' });
                        }
                    });
                }
            });
        });
    })
}

function isMods(owner, moderator, userId) {
    const ownerList = JSON.parse(owner);
    const moderatorList = JSON.parse(moderator);

    const Mods = ownerList.concat(moderatorList);
    const isUserInMods = Mods.includes(userId.toString());
    return isUserInMods
}

module.exports = {
    addBanAccount,
    allBanAccount,
    deleteBanAccount,
};
const sqlite3 = require('sqlite3').verbose();
const fs = require('graceful-fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';
const chatroom_db = new sqlite3.Database('./Chatrooms.db');

const deleteMessages = (req, res) => {
    const { chatroom_id, token } = req.body;
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
                if (err) {
                    return res.status(500).json({ error: 'Initial Server Error' });
                }
                const owner = result.owner;
                const moderator = result.moderator;
                const isUserInMods = isMods(owner, moderator, userId);
                if (!isUserInMods) {
                    return res.status(500).json({ error: '你无权删除所有聊天记录' });
                } else {
                    messages_db.run('DELETE FROM messages;', (err) => {
                        if (err) {
                            return res.status(500).json({ error: '删除聊天记录失败' });
                        }
                        return res.status(200).json({ success: true, message: '删除聊天记录成功' });
                    });
                }
            });
        });
    })
}

const deleteChatrooms = (req, res) => {
    const { chatroom_id, token } = req.body;
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
            if (userId != row.owner_id) {
                return res.status(500).json({ error: '你无权删除该聊天室' });
            } else {
                const dbPath = row.db_path
                if (!fs.existsSync(dbPath)) {
                    return res.status(404).json({ error: '聊天室数据库未找到' });
                } else {
                    try {
                        chatroom_db.run("DELETE FROM chatrooms WHERE id = ?", [chatroom_id], (err) => {
                            if (err) {
                                return res.status(500).json({ error: '删除聊天室记录失败,请联系网站管理员手动删除' });
                            }
                            return res.status(200).json({ message: '聊天室记录和数据库文件已删除' });
                        });
                    } catch (err) {
                        return res.status(500).json({ error: '强制删除数据库文件失败', details: err.message });
                    }
                }
            }
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
    deleteMessages,
    deleteChatrooms
};
const sqlite3 = require('sqlite3').verbose();
const { error } = require('console');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';


const user_db = new sqlite3.Database('./users.db');

const chatroom_db = new sqlite3.Database('./Chatrooms.db');

const addModerator = (req, res) => {
    const { moderator_add, chatroom_id, token } = req.body;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
    }


    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Sending 401 response', token);
            return res.status(401).json({ error: 'Token is invalid,请尝试重新登陆！' });
        }
        const userId = decoded.userId;

        chatroom_db.get("SELECT * FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: '查询聊天室信息失败' });
            }
            if (!row) {
                return res.status(404).json({ error: '找不到匹配的聊天室' });
            }

            chatroom_db.get("SELECT owner_id FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!row) {
                    return res.status(404).json({ error: 'Chatroom not found' });
                }

                const owner_previous_id = row.owner_id;
                if (owner_previous_id === userId) {
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
                                if (moderatorArray == null) {
                                    moderatorArray = [];
                                    moderatorArray.push(newId);
                                } else if (!moderatorArray.includes(newId)) {
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
                } else {
                    return res.status(500).json({ error: '你无权更改聊天室信息' });
                }
            });
        });
    })
}

const deleteModerator = (req, res) => {
    const { moderator_delete, chatroom_id, token } = req.body;

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Sending 401 response', token);
            return res.status(401).json({ error: 'Token is invalid,请尝试重新登陆！' });
        }
        const userId = decoded.userId;

        chatroom_db.get("SELECT * FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: '查询聊天室信息失败' });
            }
            if (!row) {
                return res.status(404).json({ error: '找不到匹配的聊天室' });
            }

            chatroom_db.get("SELECT owner_id FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!row) {
                    return res.status(404).json({ error: 'Chatroom not found' });
                }

                const owner_previous_id = row.owner_id;
                if (owner_previous_id === userId) {
                    user_db.get('SELECT * FROM users WHERE username = ?', [moderator_delete], (err, row) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).send('Internal Server Error');
                        }
                
                        if (!row) {
                            return res.status(404).json({ error: '找不到用户()' });
                        }
                
                        delete_user_id = row.id;
                        
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
                                const delete_user_id_str = delete_user_id.toString();
                                let moderatorValue = result ? result.moderator : '[]';
                                let moderatorArray = JSON.parse(moderatorValue);
                                moderatorArray = moderatorArray.filter(m => m !== delete_user_id_str);
                                let updatedModeratorValue = JSON.stringify(moderatorArray.map(String));
                                messages_db.run('UPDATE badges SET moderator = ? WHERE 1=1', [updatedModeratorValue], (err) => {
                                    if (err) {
                                        console.error(err.message);
                                        return res.status(500).json({ error: '更新moderator字段失败' });
                                    }
                                    return res.json({ message: 'Moderator 删除成功' });
                                });
                            });
                        });
                    })
                } else {
                    return res.status(500).json({ error: '你无权更改聊天室信息' });
                }
            });
        });
    })
}

module.exports = {
    addModerator,
    deleteModerator,
};
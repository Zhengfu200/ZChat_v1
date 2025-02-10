const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const jwt = require('jsonwebtoken');

const user_db = new sqlite3.Database('./users.db');
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';
const chatroom_db = new sqlite3.Database('./Chatrooms.db');

const allBadges = (req, res) => {
    const chatroom_id = req.query.chatroom_id;
    chatroom_db.get('SELECT * FROM chatrooms WHERE id =?', [chatroom_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Chatroom not found' });
        }
        const dbPath = row.db_path
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Chatroom not found' });
        }

        const messages_db = new sqlite3.Database(dbPath);

        messages_db.all('PRAGMA table_info(badges);', (err, columns) => {
            if (err) {
                messages_db.close();
                return res.status(500).json({ error: 'Failed to retrieve badges schema' });
            }

            const fieldNames = columns.map(col => col.name);

            // 检查 badges 表的第一条记录中的字段是否为 null
            messages_db.all('SELECT * FROM badges LIMIT 1', (err, rows) => {
                if (err) {
                    messages_db.close();
                    return res.status(500).json({ error: 'Failed to retrieve badges data' });
                }

                if (rows.length > 0) {
                    columns.forEach((col, index) => {
                        if (rows[0][col.name] === null) {
                            const fieldIndex = fieldNames.indexOf(col.name);
                            if (fieldIndex !== -1) {
                                fieldNames.splice(fieldIndex, 1);
                            }
                        }
                    });
                }
                messages_db.close();
                return res.status(200).json({ fields: fieldNames });
            });
        });
    })
}

const addBadgesAccount = (req, res) => {
    const { addBadgesName, addBadgesAccount, chatroom_id, token } = req.body;
    if(addBadgesName == 'owner' || addBadgesName == 'moderator'|| addBadgesName =='developer'){
        return res.status(500).json({ error: '此身份组为特殊身份组，不可更改！' });
    }
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
                    return res.status(500).json({ error: '你无权设置用户身分组' });
                } else {
                    user_db.get('SELECT * FROM users WHERE username = ?', [addBadgesAccount], (err, row) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).send('Internal Server Error');
                        }

                        if (!row) {
                            return res.status(404).json({ error: '找不到用户' });
                        }

                        const add_user_id = row.id;

                        const query = `PRAGMA table_info(badges)`;
                        messages_db.all(query, (err, rows) => {
                            if (err) {
                                return res.status(500).json({ error: '查询 badges 表信息时出错' });
                            }

                            const columnExists = rows.some(row => row.name === addBadgesName);
                            if (!columnExists) {
                                const alterTableQuery = `ALTER TABLE badges ADD COLUMN ${addBadgesName} TEXT DEFAULT '[]'`;
                                messages_db.run(alterTableQuery, (alterErr) => {
                                    if (alterErr) {
                                        return res.status(500).json({ error: `无法创建身分组 ${addBadgesName}` });
                                    }

                                    const userIdArray = JSON.stringify([add_user_id.toString()]);
                                    messages_db.run(`UPDATE badges SET ${addBadgesName} = ? WHERE rowid = 1`, [userIdArray], (updateErr) => {
                                        if (updateErr) {
                                            return res.status(500).json({ error: '更新 badges 表时出错' });
                                        }

                                        return res.status(200).json({ success: true, message: `已创建新身分组 ${addBadgesName} 并插入用户 ${add_user_id}` });
                                    });
                                });
                            } else {
                                messages_db.get(`SELECT ${addBadgesName} FROM badges LIMIT 1`, (err, result) => {
                                    if (err) {
                                        return res.status(500).json({ error: '查询 badges 表时出错' });
                                    }

                                    let badgesArray;
                                    try {
                                        badgesArray = JSON.parse(result[addBadgesName]);
                                    } catch (parseError) {
                                        return res.status(500).json({ error: '解析 badges 字段时出错' });
                                    }
                                    const userIdString = add_user_id.toString();
                                    if (badgesArray == null) {
                                        badgesArray = [];
                                        badgesArray.push(userIdString);
                                    } else if (!badgesArray.includes(userIdString)) {
                                        badgesArray.push(userIdString);
                                    } else {
                                        return res.status(400).json({ error: `用户 ${userIdString} 已存在于 badges 列表中` });
                                    }
                                    const updatedBadges = JSON.stringify(badgesArray);
                                    messages_db.run(`UPDATE badges SET ${addBadgesName} = ?`, [updatedBadges], (updateErr) => {
                                        if (updateErr) {
                                            return res.status(500).json({ error: '更新 badges 表时出错' });
                                        }

                                        res.status(200).json({ success: true, message: '用户已成功添加到 badges 列表中' });
                                    });
                                });
                            }
                        });
                    })
                }
            });
        });
    })
}

//其中addBadgesName, addBadgesAccount实则为deleteBadgesName, deleteBadgesAccount
const deleteBadgesAccount = (req, res) => {
    const { addBadgesName, addBadgesAccount, chatroom_id, token } = req.body;
    if(addBadgesName == 'owner' || addBadgesName == 'moderator'|| addBadgesName =='developer'){
        return res.status(500).json({ error: '此身份组为特殊身份组，不可更改！' });
    }
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
                    return res.status(500).json({ error: '你无权设置用户身分组' });
                } else {
                    user_db.get('SELECT * FROM users WHERE username = ?', [addBadgesAccount], (err, row) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).send('Internal Server Error');
                        }

                        if (!row) {
                            return res.status(404).json({ error: '找不到用户' });
                        }

                        const add_user_id = row.id;

                        const query = `PRAGMA table_info(badges)`;
                        messages_db.all(query, (err, rows) => {
                            if (err) {
                                return res.status(500).json({ error: '查询 badges 表信息时出错' });
                            }

                            const columnExists = rows.some(row => row.name === addBadgesName);
                            if (!columnExists) {
                                return res.status(404).json({ error: `身分组 ${addBadgesName} 不存在` });
                            } else {
                                messages_db.get(`SELECT ${addBadgesName} FROM badges LIMIT 1`, (err, result) => {
                                    if (err) {
                                        return res.status(500).json({ error: '查询 badges 表时出错' });
                                    }

                                    let badgesArray;
                                    try {
                                        badgesArray = JSON.parse(result[addBadgesName]);
                                    } catch (parseError) {
                                        return res.status(500).json({ error: '解析 badges 字段时出错' });
                                    }
                                    const userIdString = add_user_id.toString();
                                    const updatedBadgesArray = badgesArray.filter(id => id !== userIdString);
                                    if (badgesArray.length === updatedBadgesArray.length) {
                                        return res.status(400).json({ error: `用户 ${userIdString} 不在 badges 列表中` });
                                    }
                                    if (updatedBadgesArray.length === 0) {
                                        messages_db.run(`UPDATE badges SET ${addBadgesName} = NULL`, (updateErr) => {
                                            if (updateErr) {
                                                return res.status(500).json({ error: '更新 badges 表时出错' });
                                            }

                                            res.status(200).json({ success: true, message: `字段 ${addBadgesName} 已删除，因为没有剩余的用户` });
                                        });
                                    } else {
                                        const updatedBadges = JSON.stringify(updatedBadgesArray);
                                        messages_db.run(`UPDATE badges SET ${addBadgesName} = ?`, [updatedBadges], (updateErr) => {
                                            if (updateErr) {
                                                return res.status(500).json({ error: '更新 badges 表时出错' });
                                            }

                                            res.status(200).json({ success: true, message: '用户已从 badges 列表中删除' });
                                        });
                                    }
                                });
                            }
                        });
                    })
                }
            });
        });
    })
}

//其中addBadgesName实则为deleteBadgesName
const deleteBadges = (req, res) => {
    const { addBadgesName, chatroom_id, token } = req.body;
    if(addBadgesName == 'owner' || addBadgesName == 'moderator'|| addBadgesName =='developer'){
        return res.status(500).json({ error: '此身份组为特殊身份组，不可更改！' });
    }
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
                    return res.status(500).json({ error: '你无权设置用户身分组' });
                } else {
                    messages_db.all(`PRAGMA table_info(badges);`, (err, columns) => {
                        if (err) {
                            return res.status(500).json({ error: '查询表结构失败' });
                        }

                        const columnExists = columns.some(column => column.name === addBadgesName);
                        if (!columnExists) {
                            return res.status(404).json({ error: `字段 ${addBadgesName} 不存在于 badges 表中` });
                        }

                        messages_db.run(`UPDATE badges SET ${addBadgesName} = NULL WHERE rowid = 1`, (updateErr) => {
                            if (updateErr) {
                                console.log(updateErr);
                                return res.status(500).json({ error: '更新 badges 表时出错', updateErr });
                            }

                            res.status(200).json({ success: true, message: `身分组 ${addBadgesName} 已清空` });
                        });
                    });
                }
            });
        });
    })
}

module.exports = {
    allBadges,
    addBadgesAccount,
    deleteBadgesAccount,
    deleteBadges,
};

function isMods(owner, moderator, userId) {
    const ownerList = JSON.parse(owner);
    const moderatorList = JSON.parse(moderator);

    const Mods = ownerList.concat(moderatorList);
    const isUserInMods = Mods.includes(userId.toString());
    return isUserInMods
}
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { WebSocketServer } = require('ws');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const { accountInfo } = require('./js/accountinfo')
const { editAccount } = require('./js/editAccount');

//聊天室管理数据库
const chatroomsDb = new sqlite3.Database('./Chatrooms.db');
chatroomsDb.serialize(() => {
  chatroomsDb.run("CREATE TABLE IF NOT EXISTS chatrooms (id INTEGER PRIMARY KEY, name TEXT UNIQUE, db_path TEXT, owner_id INTEGER)");
});

//用户管理数据库
const user_db = new sqlite3.Database('./users.db');
user_db.serialize(() => {
  user_db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, avatar TEXT,bio TEXT,birthday TEXT,gender TEXT,AboutMe TEXT, banner TEXT)");
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';

//获取所有聊天室
app.get('/api/all_chatrooms', (req,res) => {
  chatroomsDb.all("SELECT * FROM chatrooms", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ chatrooms: rows });
  });
});

// 获取当前聊天室的信息
app.get('/api/chatrooms', (req, res) => {
  const chatroom_id = req.query.chatroom_id;
  if (!chatroom_id) {
    return res.status(400).json({ error: 'Chatroom Id is required' });
  }
  chatroomsDb.get("SELECT * FROM chatrooms WHERE id = ?", [chatroom_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!rows) {
      return res.status(404).json({ error: '找不到匹配的聊天室' });
    }
    res.json({ chatrooms: rows });
  });
});

//登录接口
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  user_db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err || !row) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    bcrypt.compare(password, row.password, (err, result) => {
      if (err || !result) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign({ userId: row.id, username: row.username, user_avatar: row.avatar }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Login successful', token })
    })
  })
});

// 注册接口
app.post('/register', (req, res) => {
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
});

// 获取历史消息（1.历史消息）
app.get('/api/messages', (req, res) => {
  const chatroom_id = req.query.chatroom_id;
  if (!chatroom_id) {
    return res.status(400).json({ error: 'Chatroom Id is required' });
  }

  chatroomsDb.get("SELECT * FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: '查询聊天室信息失败' });
    }
    if (!row) {
      return res.status(404).json({ error: '找不到匹配的聊天室' });
    }
    const dbPath = row.db_path

    // 如果数据库文件不存在，返回错误
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    const messages_db = new sqlite3.Database(dbPath);

    messages_db.all("SELECT * FROM messages", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ messages: rows });
    });
  });
});

//获取历史消息(2.聊天室徽章)
app.get('/api/chatroomBadges', (req, res) => {
  const chatroom_id = req.query.chatroom_id;
  if (!chatroom_id) {
    return res.status(400).json({ error: 'Chatroom Id is required' });
  }

  chatroomsDb.get("SELECT * FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: '查询聊天室信息失败' });
    }
    if (!row) {
      return res.status(404).json({ error: '找不到匹配的聊天室' });
    }
    const dbPath = row.db_path

    // 如果数据库文件不存在，返回错误
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    const messages_db = new sqlite3.Database(dbPath);

    messages_db.all("SELECT * FROM badges", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ badges: rows });
    });
  });
});

// 创建 HTTP 服务器
const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws) => {
  console.log("WebSocket connection established");
  ws.on('message', (data) => {
    const { chatroom, Id, name, message, avatar, currentTime, message_type } = JSON.parse(data);

    //从Chatrooms.db定位Chatroom,查找历史消息数据库所在路径
    chatroomsDb.get("SELECT * FROM chatrooms WHERE name = ?", [chatroom], (err, row) => {
      if (err) {
        return res.status(500).json({ error: '查询聊天室信息失败' });
      }
      if (!row) {
        return res.status(404).json({ error: '找不到匹配的聊天室' });
      }
      const dbPath = row.db_path
      let badges = [];

      if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ error: 'Chatroom not found' });
      }


      //连接消息数据库
      const messages_db = new sqlite3.Database(dbPath);


      //检索badges表
      messages_db.all("PRAGMA table_info(badges)", (err, columns) => {
        if (err) {
          console.error('查询badges表字段失败：', err);
          return;
        }

        const fieldNames = columns.map(col => col.name);

        messages_db.get("SELECT * FROM badges", (err, badgeRow) => {
          if (err) {
            console.error('查询 badges 表失败:', err);
            return;
          }

          //检索badges字段中的内容，并于当前用户id匹配
          if (badgeRow) {
            fieldNames.forEach(field => {
              if (badgeRow[field]) {
                try {
                  const idsList = JSON.parse(badgeRow[field]);
                  if (Array.isArray(idsList) && idsList.includes(Id.toString())) {
                    badges.push(field);
                  } else {
                  }
                } catch (err) {
                  console.error('解析 badges 表数据失败:', err);
                  return;
                }
              }
            })

            messages_db.run("INSERT INTO messages (name, message, avatar_url, date, badges, type) VALUES (?, ?, ?, ?, ?, ?)", [name, message, avatar, currentTime, JSON.stringify(badges), message_type], function (err) {
              if (err) {
                console.error(err);
              } else {
                wss.clients.forEach((client) => {
                  if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({ name, message, avatar, currentTime, badges, message_type }));
                  }
                });
              }
            });
          }
        })
      })
    });
  });

  ws.on('close', () => {
    console.log("WebSocket connection closed");
  });
});

// 修改聊天室信息(1.基本信息）
app.post('/api/mod', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { chatroom_id,chatroom_previous, owner_previous, chatroom_modified, owner_modified } = req.body;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }


  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Token is invalid' });
    }
    const userId = decoded.userId;

    chatroomsDb.get("SELECT * FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
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

      chatroomsDb.get("SELECT owner_id FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!row) {
          return res.status(404).json({ success: false, message: 'Chatroom not found' });
        }

        const owner_previous_id = row.owner_id;
        if (owner_previous_id === userId) {
          console.log("accesseble");
          user_db.get("SELECT * FROM users WHERE username = ?", [owner_modified], (err, row) => {
            if (err) {
              return res.status(500).json({ error: '用户数据库查询失败' });
            }
            if (!row) {
              return res.status(404).json({ error: '指定用户不存在' });
            }

            const owner_modified_id = row.id;
            chatroomsDb.get("SELECT * FROM chatrooms WHERE name = ? AND owner = ?", [chatroom_previous, owner_previous], (err, row) => {
              if (err) {
                return res.status(500).json({ error: '数据库查询错误' });
              }
              if (!row) {
                return res.status(400).json({ error: '找不到匹配的聊天室' });
              }
              
              chatroomsDb.run("UPDATE chatrooms SET name = ?, owner = ?, owner_id = ? WHERE name = ? AND owner = ? AND owner_id = ?",
                [chatroom_modified, owner_modified, owner_modified_id, chatroom_previous, owner_previous, owner_previous_id], (err) => {
                  messages_db.get("SELECT * FROM badges", (err, badgeRow) => {
                    if (err) {
                      console.error('查询 badges 表失败:', err);
                      return res.status(500).json({ error: '查询 badges 表失败' });
                    }

                    if (badgeRow && badgeRow.owner) {
                      try {
                        let ownerList = JSON.parse(badgeRow.owner);
                        ownerList = [];
                        ownerList.push(String(owner_modified_id));
                        const updatedOwnerList = JSON.stringify(ownerList);
                        messages_db.run("UPDATE badges SET owner = ? WHERE owner IS NOT NULL", [updatedOwnerList], (err) => {
                          if (err) {
                            console.error('更新 badges 表失败:', err);
                            return res.status(500).json({ error: '更新 badges 表失败' });
                          }
                          console.log('更新后的 owner 列表:', updatedOwnerList);
                          res.json({ message: '聊天室信息和所有者更新成功' });
                        });

                      } catch (err) {
                        console.error('解析 badges 表数据失败:', err);
                        return res.status(500).json({ error: '解析 badges 表数据失败' });
                      }
                    } else {
                      return res.status(404).json({ error: '没有找到对应的 owner 数据' });
                    }
                  });
                  if (err) {
                    return res.status(500).json({ error: '更新聊天室失败' });
                  }
                });
            });
          });
        } else {
          return res.status(500).json({ error: 'You do not have the necessary permissions to modify this chatroom' });
        }
      });
    });
  })
});

// 跳转后台验证
app.post('/api/verifyChatroomOwner', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { chatroom_id } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token is invalid');
      return res.status(402).json({ success: false, message: 'Token is invalid' });
    }
    const userId = decoded.userId;
    chatroomsDb.get("SELECT owner_id FROM chatrooms WHERE id = ?", [chatroom_id], (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ success: false, message: 'Chatroom not found' });
      }

      if (row.owner_id === userId) {
        res.json({ success: true, isOwner: true });
      } else {
        res.json({ success: true, isOwner: false });
      }
    });
  })
})

//创建聊天室
app.post('/api/CreateChatRoom', (req, res) => {
  const { Id, name, NewChatroomName } = req.body;

  if (!name || !NewChatroomName || !Id) {
    return res.status(400).json({ error: 'name and NewChatroomName are required' });
  }

  const dbName = `${crypto.randomBytes(4).toString('hex')}.db`;
  const dbPath = path.join(__dirname, './messages', dbName);
  const dbPath_relative = path.join('./messages', dbName);

  if (!fs.existsSync(path.join(__dirname, './messages'))) {
    fs.mkdirSync(path.join(__dirname, './messages'));
  }

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error creating new database:', err);
      return res.status(500).json({ error: 'Failed to create new database' });
    }

    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          message TEXT,
          avatar_url TEXT,
          date TEXT,
          badges TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating messages table:', err);
          return res.status(500).json({ error: 'Failed to create messages table' });
        }

        const ownerList = JSON.stringify([String(Id)]);
        db.run(`CREATE TABLE IF NOT EXISTS badges (
            owner TEXT NOT NULL,
            moderator TEXT
          )
        `, (err) => {
          if (err) {
            console.error('Error creating badges table:', err);
            return res.status(500).json({ error: 'Failed to create badges table' });
          }

          // 在 badges 表中插入数据
          const insertBadges = `
            INSERT INTO badges (owner, moderator)
            VALUES (?, ?)
          `;
          db.run(insertBadges, [ownerList, null], function (err) {
            if (err) {
              console.error('Error inserting badges data:', err);
              return res.status(500).json({ error: 'Failed to insert badges data' });
            }
            const insertChatroom = `
                INSERT INTO chatrooms (name, owner, owner_id, db_path)
                VALUES (?, ?, ?, ?)
              `;
            chatroomsDb.run(insertChatroom, [NewChatroomName, name, Id, dbPath_relative], (err) => {
              if (err) {
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                  return res.status(400).json({ error: 'Chatroom name already exists' });
                }else{
                  console.error('Error inserting into chatrooms:', err);
                  return res.status(500).json({ error: 'Failed to insert into chatrooms' });
                }
              }
              res.json({ message: 'Chatroom created successfully', dbPath: dbPath });
            });
          });
        })
      })
    })
  })
})

//获取用户详情
app.get('/api/accountInfo', accountInfo);

//编辑用户信息
app.post('/api/editAccount', editAccount);


// HTTP 升级为 WebSocket 连接
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

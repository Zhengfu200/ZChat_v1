const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { WebSocketServer } = require('ws');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');

//聊天室管理数据库
const chatroomsDb = new sqlite3.Database('./Chatrooms.db');
chatroomsDb.serialize(() => {
  chatroomsDb.run("CREATE TABLE IF NOT EXISTS chatrooms (id INTEGER PRIMARY KEY, name TEXT UNIQUE, owner TEXT, db_path TEXT)");
});

//用户管理数据库
const user_db = new sqlite3.Database('./users.db');
user_db.serialize(() => {
  user_db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const cors = require('cors');
app.use(cors());
app.use(bodyParser.json()); // 解析JSON请求

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';

// 获取所有聊天室的名称
app.get('/api/chatrooms', (req, res) => {
  chatroomsDb.all("SELECT * FROM chatrooms", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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

      const token = jwt.sign({ userId: row.id, username: row.username }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Login successful', token })
    })
  })
});

// 注册接口
app.post('/register', (req, res) => {
  const { username, password } = req.body;
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
      const stmt = user_db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
      stmt.run(username, hashedPassword, function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to register user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
});

// 获取历史消息
app.get('/api/messages', (req, res) => {
  const chatroom = req.query.chatroom;
  if (!chatroom) {
    return res.status(400).json({ error: 'Chatroom name is required' });
  }

  chatroomsDb.get("SELECT * FROM chatrooms WHERE name = ?", [chatroom], (err, row) => {
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

// 创建 HTTP 服务器
const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws) => {
  console.log("WebSocket connection established");
  ws.on('message', (data) => {
    const { chatroom, name, message } = JSON.parse(data);

    chatroomsDb.get("SELECT * FROM chatrooms WHERE name = ?", [chatroom], (err, row) => {
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

      console.log(dbPath);

      messages_db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, name TEXT, message TEXT)");

      messages_db.run("INSERT INTO messages (name, message) VALUES (?, ?)", [name, message], function (err) {
        if (err) {
          console.error(err);
        } else {
          // 广播消息
          wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({ name, message }));
            }
          });
        }
      });
    });
  });

  ws.on('close', () => {
    console.log("WebSocket connection closed");
  });
});

// 修改聊天室信息
app.post('/api/mod', (req, res) => {
  const { chatroom_previous, owner_previous, chatroom_modified, owner_modified } = req.body;

  user_db.get("SELECT * FROM users WHERE username = ?", [owner_modified], (err, row) => {
    if (err) {
      return res.status(500).json({ error: '用户数据库查询失败' });
    }
    if (!row) {
      return res.status(404).json({ error: '指定用户不存在' });
    }

    chatroomsDb.get("SELECT * FROM chatrooms WHERE name = ? AND owner = ?", [chatroom_previous, owner_previous], (err, row) => {
      if (err) {
        return res.status(500).json({ error: '数据库查询错误' });
      }
      if (!row) {
        return res.status(400).json({ error: '找不到匹配的聊天室' });
      }

      // 更新聊天室信息
      chatroomsDb.run("UPDATE chatrooms SET name = ?, owner = ? WHERE name = ? AND owner = ?",
        [chatroom_modified, owner_modified, chatroom_previous, owner_previous], (err) => {
          if (err) {
            return res.status(500).json({ error: '更新聊天室失败' });
          }
          res.json({ message: '聊天室信息修改成功' });
        });
    });
  });
});



// HTTP 升级为 WebSocket 连接
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

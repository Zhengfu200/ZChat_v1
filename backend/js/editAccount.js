const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ind3dy5ranNvbi5jb20iLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzM3OTczOTMyLCJuYmYiOjE3Mzc5NzM5MzIsImV4cCI6MTczODA2MDMzMn0.T7gBlg6XwSLWMx5vwXihH3B1q7B8SyJohhrTdXOtGBw';

const user_db = new sqlite3.Database('./users.db');
user_db.serialize(() => {
    user_db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, avatar TEXT,bio TEXT,birthday TEXT)");
});

const editAccount = (req, res) => {
    const token = req.query.token;
    const editsection = req.query.editsection;
    const Id = req.query.Id;
    if (!token) {
        console.log('Token is required');
        return res.status(401).json({ success: false, message: 'Token is required' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log('Token is invalid');
          return res.status(402).json({ success: false, message: 'Token is invalid,Please try to login again(请尝试重新登录!)' });
        }
        const userId = decoded.userId;
        if (userId != Id) {
            console.log(userId, Id, 'You are not allowed to edit others profile');
            return res.status(401).json({ success: false, message: 'You are not allowed to edit others profile' });
        }else{
            user_db.get('SELECT * FROM users WHERE id = ?', [Id], (err, row) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false, message: 'Internal server error' }); 
                }
                if (!row) {
                    return res.status(401).json({ success: false, message: 'User not found' });
                }
                if (!editsection) {
                    return res.status(401).json({ success: false, message: '未指定修改位置' });
                }
                if(editsection == 'Bio'){
                    const edit = req.query.edit;
                    user_db.run('UPDATE users SET bio = ? WHERE id = ?', [edit, Id], (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false, message: 'Failed to update' });
                        }
                        return res.status(200).json({ success: true, message: ' updated successfully' });
                    });
                }
                if(editsection == 'Avatar'){
                    const edit = req.query.edit;
                    user_db.run('UPDATE users SET avatar = ? WHERE id = ?', [edit, Id], (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false, message: 'Failed to update' });
                        }
                        return res.status(200).json({ success: true, message: ' updated successfully' });
                    });
                }
                if(editsection == 'Banner'){
                    const edit = req.query.edit;
                    user_db.run('UPDATE users SET banner = ? WHERE id = ?', [edit, Id], (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false, message: 'Failed to update' });
                        }
                        return res.status(200).json({ success: true, message: ' updated successfully' });
                    });
                }
                if(editsection == 'AboutMe'){
                    const edit = req.query.edit;
                    user_db.run('UPDATE users SET AboutMe = ? WHERE id = ?', [edit, Id], (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false, message: 'Failed to update' });
                        }
                        return res.status(200).json({ success: true, message: ' updated successfully' });
                    });
                }
                if(editsection == 'gender'){
                    const edit = req.query.edit;
                    user_db.run('UPDATE users SET gender = ? WHERE id = ?', [edit, Id], (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false, message: 'Failed to update' });
                        }
                        return res.status(200).json({ success: true, message: ' updated successfully' });
                    });
                }
                if(editsection == 'birthday'){
                    const edit = req.query.edit;
                    user_db.run('UPDATE users SET birthday = ? WHERE id = ?', [edit, Id], (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ success: false, message: 'Failed to update' });
                        }
                        return res.status(200).json({ success: true, message: ' updated successfully' });
                    });
                }
                else{
                    return res.status(401).json({ success: false, message: '未指定修改位置,请重新尝试！' });
                }
            })
        }
    })
}

module.exports = {
    editAccount,
};
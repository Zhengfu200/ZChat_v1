### ZChat: Build a Public Chatroom with Node.js + Vue3 + Quasar + sqlite3

#### 2025/2/4:
##### 🙂前端：
* 修复了时间显示错误的bug
* 探索了Quasar的新特性：在q-message中发送图片消息
* 支持发送图片和视频
* 发现了一个bug：在q-message中发送视频消息时，如果链接直接填写文字，会因为未知错误而直接在消息中插入网页

##### 🙃后端:
* 支持发送图片和视频链接


#### 2025/2/2：
##### 🙂前端：
* 简单实现了用户资料修改功能
* 修复聊天室查询错误

##### 🙃后端:
* 简单实现了用户资料修改功能
* 修复聊天室查询错误

#### 2025/2/1：
##### 🙂前端：
* 开始制作用户详情页面

##### 🙃后端:
* 由于后端变得复杂，故将以后的接口另起js文件存储在/js目录下，再使用server.js调用
* 开始制作用户详情接口
  
#### 2025/1/31:
##### 🙂前端：
* 开始制作频道身份管理系统
* 大幅修改侧边栏
* 新增新建聊天室

##### 🙃后端:
* 开始制作频道身份管理系统
* 为websocket接口逻辑进行批注
* 新增新建聊天室

#### 2025/1/30:
##### 🙂前端：
* 优化修改服务器页面
* 增添聊天头像显示
* 修复了聊天头像显示
* 修改消息框，增加了徽章显示，时间显示

##### 🙃后端:
* 修改数据库结构，支持聊天头像显示
* 增加验证接口，确保后台登录验证
* 修改数据库结构，支持徽章显示
* 制造了新的屎山

#### 2025/1/18:    
##### 🙂前端：
* 构建频道管理界面
* 优化侧滑栏    

##### 🙃后端：  
* 修改数据库结构
* 修改消息读取，发送接口
* 增加聊天室管理机制

#### 2025/1/17：  
##### 🙂前端：  
* 构建基础聊天页面
* 构建登陆页面
* 构建注册页面
* 构建侧滑栏（未优化UI）   

##### 🙃后端：
* 搭建主体读取，发送信息接口
* 建立用户管理数据库，登录和注册接口
* 建立聊天室数据库    

##### 📄TODO:

- [x] ~~优化频道管理界面UI~~
- [x] ~~增加发送消息时显示发送时间~~
- [ ] 增加聊天频道隐藏机制
- [ ] 消除一些屎山    
  
##### 🤯Ideas:

- [ ] 实现频道身份管理系统
- [ ] 实现消息回复，撤回机制

##### 🪲已知bug:    
<font color=red>*** ~~1.新发布的消息聊天头像不显示（已解决）~~ ***</font>

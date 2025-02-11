<div align=center><img src="https://img.icons8.com/?size=100&id=7859&format=png&color=000000"></div>

# ZChat: Build a Public Chatroom with Node.js + Vue3 + Quasar + sqlite3    
#### 截止2025/2/10 Zchat_V1计划中所有功能均已实现，将不再进行实质性更新（仅进行前段UI优化与bug修复）

---

### 关于项目：
##### Zchat旨在于任何低配置服务器上搭建在线聊天网站，Zchat_v1中所有接口均为公开接口，请谨慎使用！
##### 项目[演示地址](https://zhengfu200.github.io/#/)(最新版本)
- 前端：![Static Badge](https://img.shields.io/badge/Vue-green)  ![Static Badge](https://img.shields.io/badge/Javascript-yellow)  ![Static Badge](https://img.shields.io/badge/Quasar-blue)
- 后端：![Static Badge](https://img.shields.io/badge/Node.js-red)  ![Static Badge](https://img.shields.io/badge/Sqlite3-gray)    
- [跳转到第一节](#tree)
  
---

### ✅ Zchat_v1已实现功能:

- [x] 多种消息发送（文字，图片，视频，链接，网址）
- [x] 用户管理系统
- [x] 多频道管理系统（禁言，身份组设置）
- [x] 支持二次开发   

*（计划在V2中实现一系列包括用户私聊，网页视频通话等功能，但并非近期）*

---

### 📄TODO:

- [x] ~~优化频道管理界面UI~~
- [x] ~~增加发送消息时显示发送时间~~
- [x] ~~实现图片和视频发送~~
- [x] ~~实现音频和文件发送（以及文件下载）~~
- [ ] 增加聊天频道隐藏机制（可能不会在V1实现了）
- [ ] 消除一些屎山    
  
### 🤯Ideas:

- [x] ~~实现频道身份管理系统~~
- [x] ~~实现消息回复，撤回机制~~

### 🪲已知bug:    
 ~~1.新发布的消息聊天头像不显示（已解决）~~     
2.q-video的src如果被设置成任意文字，则会显示错误（将通过画中画形式将整个网页显示在视频组件里）
3.token失效问题，重新登陆即可
4.手机端切换至后台会中断websocket连接

---

<a id="tree"></a>

### 项目文件结构

```
Zchat
├─ backend
│  ├─ js
│  │  ├─ accountinfo.js
│  │  ├─ addModerator.js
│  │  ├─ badges.js
│  │  ├─ banAccount.js
│  │  ├─ deleteChatrooms.js
│  │  ├─ editAccount.js
│  │  └─ userManager.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ server.js
├─ frontend
│  └─ chat-app
│     ├─ .editorconfig
│     ├─ .npmrc
│     ├─ .prettierrc.json
│     ├─ .quasar
│     │  ├─ dev-spa
│     │  │  ├─ app.js
│     │  │  ├─ client-entry.js
│     │  │  ├─ client-prefetch.js
│     │  │  └─ quasar-user-options.js
│     │  ├─ feature-flags.d.ts
│     │  ├─ quasar.d.ts
│     │  └─ tsconfig.json
│     ├─ eslint.config.js
│     ├─ index.html
│     ├─ jsconfig.json
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ postcss.config.js
│     ├─ public
│     │  ├─ favicon.ico
│     │  └─ icons
│     │     ├─ favicon-128x128.png
│     │     ├─ favicon-16x16.png
│     │     ├─ favicon-32x32.png
│     │     └─ favicon-96x96.png
│     ├─ quasar.config.js
│     ├─ quasar.extensions.json
│     ├─ README.md
│     └─ src
│        ├─ App.vue
│        ├─ assets
│        │  └─ quasar-logo-vertical.svg
│        ├─ boot
│        │  └─ axios.js
│        ├─ components
│        │  └─ EssentialLink.vue
│        ├─ css
│        │  ├─ app.scss
│        │  └─ quasar.variables.scss
│        ├─ layouts
│        │  └─ MainLayout.vue
│        ├─ pages
│        │  ├─ AccountInfo.vue
│        │  ├─ ErrorNotFound.vue
│        │  ├─ IndexPage.vue
│        │  ├─ LoginPage.vue
│        │  ├─ RegisterPage.vue
│        │  └─ ServerModerator.vue
│        └─ router
│           ├─ index.js
│           └─ routes.js
├─ LICENSE
└─ README.md

```

---

### 📝更新日志：
#### 2025/2/10:
##### 🙂前端：
* 实现了聊天室身份组管理系统
* 实现聊天室删除功能
* 优化部分UI,统一了部分报错提示
* 修复了若干bug

##### 🙃后端:
* 实现聊天室身份组管理系统
* 实现聊天室删除功能
* 制造若干Bug


#### 2025/2/8~9:
##### 🙂前端：
* 修复前端若干bug
* 实现聊天室管理员系统
* 实现聊天室禁言系统

##### 🙃后端:
* 实现聊天室管理员增加，移除功能
* 实现聊天室禁言系统


#### 2025/2/7:
##### 将截至2025/2/7日前更新的所有内容放在[我的Github主页](https://zhengfu200.github.io/#/)上
##### 🙂前端：
* 实现消息回复机制
* 实现消息撤回机制
* 修复头像更改需重新登陆才有效的bug
* 修复消息菜单超出屏幕bug

##### 🙃后端:
* 支持消息撤回

#### 2025/2/6:
##### 🙂前端：
* 制作了点击消息展开操作页面的UI
* 消息操作栏实现查看用户个人资料

#### 2025/2/5:
##### 🙂前端：
* 支持上传网页链接，文件

##### 🙃后端:
* 支持上传网页链接，文件

#### 2025/2/4:
##### 🎉 重大更新：ZChat支持图片和视频上传并直链显示了（也可以做一个图床了）
##### 🙂前端：
* 修复了时间显示错误的bug
* 探索了Quasar的新特性：在q-message中发送图片消息
* 支持发送图片和视频
* 发现了一个bug：在q-message中发送视频消息时，如果链接直接填写文字，会因为未知错误而直接在消息中插入网页

##### 🙃后端:
* 支持发送图片和视频链接

#### 2025/2/3:
##### 将截至2025/2/3日前更新的所有内容放在[我的Github主页](https://zhengfu200.github.io/#/)上

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

#### 2025/1/28:    
##### 🙂前端：
* 构建频道管理界面
* 优化侧滑栏    

##### 🙃后端：  
* 修改数据库结构
* 修改消息读取，发送接口
* 增加聊天室管理机制

#### 2025/1/27：  
##### 🙂前端：  
* 构建基础聊天页面
* 构建登陆页面
* 构建注册页面
* 构建侧滑栏（未优化UI）   

##### 🙃后端：
* 搭建主体读取，发送信息接口
* 建立用户管理数据库，登录和注册接口
* 建立聊天室数据库    

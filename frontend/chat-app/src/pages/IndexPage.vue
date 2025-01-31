<template>
  <q-page padding>
    <q-header elevated>
      <q-bar class="bg-primary">
        <q-btn dense flat icon="chat" />
        <div class="text-weight-bold">
          ZChat
        </div>
        <q-btn dense flat icon="menu" @click="toggleDrawer" />
        <div class="col text-center text-weight-bold">
          {{ current_chatroom }}
        </div>
        <q-space />
        <q-btn dense flat icon="edit" @click="goToServerModerator" />
        <q-btn dense flat icon="info" @click="toggleDetails" />
        <q-btn dense flat icon="login" class="gt-xs" @click="gotoLogin" />
        <div>{{ currentTime }}</div>
      </q-bar>
    </q-header>

    <!--聊天室详细信息对话框-->
    <q-dialog v-model="showDetails">
      <q-card>
        <q-card-section>
          <div class="text-h6">Chatroom Details</div>
          <div v-if="current_chatroom">
            <p><q-badge rounded color="blue" /> Chatroom Name: {{ current_chatroom }}</p>
            <p><q-badge rounded color="red" /> Owner: {{ current_chatroom_owner }}</p>
          </div>
          <div v-else>
            <p>No chatroom selected.</p>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat label="Close" @click="showDetails = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!--一级侧滑栏-->
    <q-drawer v-model="leftDrawerOpen_1" side="left" style="width: 25vw;" bordered>
      <q-card>
        <q-card-section class="avatar-section text-center">
          <q-avatar>
            <img
              :src="avatar_url ? avatar_url : 'https://img.icons8.com/?size=100&id=YXG86oegZMMh&format=png&color=000000'" />
          </q-avatar>
          <div style="margin-top: 10px;">🖖 Name : {{ name }}</div>
          <div>🥰 Bio : {{ bio }}</div>
          <div>🥳 Birthday : {{ birthday }}</div>
        </q-card-section>
        <q-btn round icon="arrow_forward" class="custom-btn" flat @click="handleButtonClick" />
      </q-card>
      <q-separator inset />
      <q-card-section>
        <q-expansion-item expand-separator icon="chat" label="Chatrooms  " caption="点击展开聊天室">
          <q-list separator bordened>
            <q-separator />
            <q-item v-for="chatroom in chatrooms" :key="chatroom.id" clickable @click="switchChatRoom(chatroom.name)">
              <q-item-section :class="chatroom.name === current_chatroom ? 'text-primary' : ''">
                {{ chatroom.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <q-btn flat class="full-width no-border" @click="newChatroomDialogVisible = true">新建聊天室</q-btn>
      </q-card-section>
    </q-drawer>

    <!--新建聊天室对话框-->
    <q-dialog v-model="newChatroomDialogVisible" persistent>
      <q-card style="width: 400px;">
        <q-card-section>
          <div class="text-h6">新建聊天室</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newChatroomName" label="Chatroom Name" filled />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="negative" @click="newChatroomDialogVisible = false" />
          <q-btn flat label="确认" color="primary" @click="CreateChatroom" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-drawer v-model="leftDrawerOpen_2" side="left" style="width: 25vw;" bordered>
      <q-list separator bordened>
        <q-item-label class="text-h6" style="padding: 10px;">Chatrooms</q-item-label>
        <q-separator />
        <q-item v-for="chatroom in chatrooms" :key="chatroom.id" clickable @click="switchChatRoom(chatroom.name)">
          <q-item-section :class="chatroom.name === current_chatroom ? 'text-primary' : ''">
            {{ chatroom.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div class="chat-container">
      <q-chat-message v-for="msg in messages" :key="msg.name" :sent="msg.name === name" :text="[msg.message]"
        :name="null" name-html
        :avatar="msg.avatar_url ? msg.avatar_url : 'https://img.icons8.com/?size=100&id=YXG86oegZMMh&format=png&color=000000'"
        :stamp="msg.date">
        <template v-slot:name>
          <div v-for="(all_badge, key) in all_badges" :key="key" style="display: flex; gap: 3px;flex-wrap: wrap">
            <div v-for="(idIndex, value) in all_badge" :key="idIndex">
              <q-badge v-if="msg.badges && msg.badges.includes(value)" :label="value" :color="getBadgeColor(value)" />
            </div>
          </div>
          <span v-html="`<span>${msg.name}</span>`"></span>
        </template>
      </q-chat-message>
    </div>

    <div class="chat-input-container">
      <q-input v-model="message" label="Message" class="bottom-input" @keyup.enter="sendMessage" />
      <q-btn round icon="navigation" class="send-btn" @click="sendMessage" />
    </div>
  </q-page>
</template>

<script>
import { jwtDecode } from 'jwt-decode';


export default {
  data() {
    return {
      messages: [],
      message: '',
      name: '', Id: '', avatar_url: '', bio: '未设置', birthday: '未设置',
      ws: null,
      isConnected: false,
      currentTime: '',
      leftDrawerOpen_1: false, leftDrawerOpen_2: false, newChatroomDialogVisible: false,
      current_chatroom: '',
      chatrooms: [],
      showDetails: false,
      current_chatroom_owner: '',
      badges: [], all_badges: [],
      newChatroomName: '', newChatroomOwner: '', newChatroomModerator: '',
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!localStorage.getItem('token')) {
      this.$router.push('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      this.name = decodedToken.username;
      this.Id = decodedToken.userId;
      this.avatar_url = decodedToken.user_avatar;
    } catch (err) {
      console.error("Invalid token or decoding failed:", err);
      this.$router.push('/login');
    }

    // WebSocket 连接
    this.ws = new WebSocket(`ws://localhost:3000`);

    // 监听连接打开事件
    this.ws.onopen = () => {
      this.isConnected = true;
      console.log("WebSocket connection established");
    };

    // 监听收到的消息
    this.ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      this.messages.push(newMessage);
      this.fetchMessages();
    };

    // 监听连接关闭事件
    this.ws.onclose = () => {
      this.isConnected = false;
      console.log("WebSocket connection closed");
    };

    // 监听连接错误事件
    this.ws.onerror = (err) => {
      console.log("WebSocket error:", err);
    };

    this.fetchChatrooms();

    setInterval(this.updateTime, 1000);

  },
  methods: {
    async fetchChatrooms() {
      fetch('http://localhost:3000/api/chatrooms')
        .then(response => response.json())
        .then(data => {
          this.chatrooms = data.chatrooms; // 获取聊天室列表
          if (this.chatrooms.length > 0) {
            this.current_chatroom = this.chatrooms[0].name;
            this.current_chatroom_owner = this.chatrooms[0].owner;
            this.fetchMessages();
          }
        })
        .catch(err => {
          console.error("Error fetching chatrooms:", err);
        });
    },
    async fetchMessages() {
      console.log(this.current_chatroom);
      const chatroom = this.chatrooms.find(c => c.name === this.current_chatroom);
      if (chatroom) {
        this.current_chatroom_owner = chatroom.owner;
      }
      fetch(`http://localhost:3000/api/chatroomBadges?chatroom=${this.current_chatroom}`)
        .then(response => response.json())
        .then(data => {
          this.all_badges = data.badges
          console.log(this.all_badges);
        })
        .catch(err => {
          console.error("Error fetching chatroom badges:", err);
        });
      fetch(`http://localhost:3000/api/messages?chatroom=${this.current_chatroom}`)
        .then(response => response.json())
        .then(data => {
          this.messages = data.messages;
        })
        .catch(err => {
          console.error("Error fetching messages:", err);
        });
    },
    sendMessage() {
      if (this.isConnected && this.message && this.name) {
        const currentTime = new Date().toISOString();
        const msg = { chatroom: this.current_chatroom, Id: this.Id, name: this.name, avatar: this.avatar_url, message: this.message, currentTime: currentTime };
        this.ws.send(JSON.stringify(msg));
        this.message = ''; // 清空输入框
      } else {
        console.log("WebSocket is not connected");
      }
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString(); // 获取当前时间
    },
    gotoLogin() {
      this.$router.push('/login');
    },
    toggleDrawer() {
      this.leftDrawerOpen_1 = !this.leftDrawerOpen_1; // 切换侧边栏状态
    },
    switchChatRoom(chatroomName) {
      this.current_chatroom = chatroomName;
      this.fetchMessages();
    },
    toggleDetails() {
      this.showDetails = !this.showDetails; // 切换展开区域的显示状态
    },
    goToServerModerator() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$q.notify({
          color: 'negative',
          message: 'no token found, please try login again',
          icon: 'report_problem',
          position: 'top'
        });
        return;
      }
      fetch('http://localhost:3000/api/verifyChatroomOwner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatroom: this.current_chatroom
        })
      })
        .then(response => {
          if (response.status === 401) {
            // 如果返回 401 错误，表示需要 Token
            this.$q.notify({
              color: 'negative',
              message: 'Token is required',
              icon: 'error',
              position: 'top'
            });
            throw new Error('Token is required');
          } else if (response.status === 402) {
            // 如果返回 402 错误，表示 Token 无效
            this.$q.notify({
              color: 'negative',
              message: 'Token is invalid,please try to login again!',
              icon: 'error',
              position: 'top'
            });
            throw new Error('Token is invalid');
          }
          return response.json();
        })
        .then(data => {
          if (data.isOwner) {
            // 如果是 owner，跳转到 moderator 页面
            this.$router.push({
              name: 'server-moderator',
              query: {
                chatroom: this.current_chatroom,
                owner: this.current_chatroom_owner
              }
            });
          } else {
            // 弹出提示
            this.$q.notify({
              color: 'negative',
              message: 'You are not the owner of this chatroom!',
              icon: 'report_problem',
              position: 'top'
            });
          }
        })
        .catch(error => {
          this.$q.notify({
            color: 'negative',
            message: 'An error occurred:', error,
            icon: 'error',
            position: 'top'
          });
        });
    },
    getBadgeColor(value) {
      if (value == 'owner') {
        return 'red';
      } else if (value == 'moderator') {
        return 'blue';
      } else if (value == 'developer') {
        return 'purple';
      } else {
        return 'green';
      }
    },
    CreateChatroom() {
      if (!this.newChatroomName.trim()) {
        this.$q.notify({
          type: 'negative',
          message: '聊天室名称不能为空',
          position: 'top'
        });
      } else {
        // 在这里添加创建聊天室的逻辑
        console.log('创建聊天室: ', this.newChatroomName);
        this.newChatroomDialogVisible = false;
        // 在这里添加创建聊天室的逻辑
        console.log('创建聊天室: ', this.newChatroomName);

        // 发送请求到后端 API
        fetch('http://localhost:3000/api/CreateChatRoom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Id: this.Id,  
            name: this.name, 
            NewChatroomName: this.newChatroomName
          })
        })
          .then((response) => {
            console.log('服务器响应状态:', response.status); 
            return response.text().then((text) => {
              console.log('服务器返回的文本:', text); 
              if (!response.ok) {
                throw new Error('请求失败，状态码：' + response.status);
              }
              return text ? JSON.parse(text) : {};
            });
          })
          .then((data) => {
            console.log('聊天室创建成功:', data);
            this.$q.notify({
              type: 'positive',
              message: '聊天室创建成功',
              position: 'top'
            });
            this.newChatroomDialogVisible = false;
            this.fetchChatrooms();
          })
          .catch((error) => {
            // 处理错误响应
            console.error('创建聊天室失败:', error);
            this.$q.notify({
              type: 'negative',
              message: '创建聊天室失败，请重试',
              position: 'top'
            });
          });
      }
    }
  }
};
</script>

<style>
.chat-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 20px;
  width: 100%;
  padding: 0 20px;
}

.bottom-input {
  width: 80%;
}

.send-btn {
  width: 40px;
  height: 40px;
  margin-left: 2%;
  /* 让按钮与输入框紧密连接 */
  display: flex;
  justify-content: center;
  background-color: transparent;
  align-items: center;
}

.send-btn .q-btn__content {
  padding: 0;
  /* 去除按钮内容的内边距 */
}

.chatroom-btn {
  width: 80%;
  margin: 0 auto;
}

.custom-btn {
  position: absolute;
  right: 10px;
  /* 右侧边距 */
  top: 50%;
  /* 垂直居中 */
  transform: translateY(-50%);
  /* 垂直居中调整 */
  background-color: transparent;
  /* 透明背景 */
  border: none;
  /* 移除边框 */
  color: black;
  /* 按钮图标颜色 */
}
</style>

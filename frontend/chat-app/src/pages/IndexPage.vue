<template>
  <q-page padding>
    <q-header elevated>
      <q-bar>
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

    <q-dialog v-model="showDetails">
      <q-card>
        <q-card-section>
          <div class="text-h6">Chatroom Details</div>
          <div v-if="current_chatroom">
            <p><strong>Chatroom Name:</strong> {{ current_chatroom }}</p>
            <p><strong>Created By:</strong>{{ current_chatroom_owner }}</p>
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

    <q-drawer v-model="leftDrawerOpen" side="left" :width="250" bordered>
      <q-list separator bordened>
        <q-item-label class="text-h6" style="padding: 10px;">Chatrooms</q-item-label>
        <q-separator />
        <!-- 遍历聊天室列表，生成按钮 -->
        <q-item v-for="chatroom in chatrooms" :key="chatroom.id" clickable @click="switchChatRoom(chatroom.name)">
          <q-item-section>
            {{ chatroom.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div class="chat-container">
      <!-- 显示消息列表 -->
      <q-chat-message v-for="msg in messages" :key="msg.id" :sent="msg.name === name" :text="[msg.message]"
        :name="msg.name" avatar="https://img.icons8.com/?size=100&id=YXG86oegZMMh&format=png&color=000000" />
    </div>

    <div class="chat-input-container">
      <q-input v-model="message" label="Message" class="bottom-input" @keyup.enter="sendMessage" />
      <!-- 发送消息按钮 -->
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
      name: '',
      ws: null, // WebSocket对象
      isConnected: false, // 连接状态标志
      currentTime: '',
      leftDrawerOpen: false,
      current_chatroom: '',
      cahtrooms: [],
      showDetails: false,
      current_chatroom_owner: '',
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!localStorage.getItem('token')) {
      this.$router.push('/login');
      return; // 如果没有登录，阻止进一步加载页面内容
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);  // 输出解码后的 token
      this.name = decodedToken.username;
    } catch (err) {
      console.error("Invalid token or decoding failed:", err);
      this.$router.push('/login');  // 如果解码失败，跳转到登录页面
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
          console.log(this.chatrooms);

          if (this.chatrooms.length > 0) {
            this.current_chatroom = this.chatrooms[0].name;
            this.current_chatroom_owner = this.chatrooms[0].owner;
            console.log(this.current_chatroom);

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
        this.current_chatroom_owner = chatroom.owner;  // 将匹配聊天室的 owner 赋值给 current_chatroom_owner
      }
      fetch(`http://localhost:3000/api/messages?chatroom=${this.current_chatroom}`)
        .then(response => response.json())
        .then(data => {
          this.messages = data.messages; // 获取历史消息并反转，显示最旧的消息
        })
        .catch(err => {
          console.error("Error fetching messages:", err);
        });
    },
    sendMessage() {
      if (this.isConnected && this.message && this.name) {
        const msg = { chatroom: this.current_chatroom, name: this.name, message: this.message };
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
      this.leftDrawerOpen = !this.leftDrawerOpen; // 切换侧边栏状态
    },
    switchChatRoom(chatroomName) {
      this.current_chatroom = chatroomName;
      this.fetchMessages();
    },
    toggleDetails() {
      this.showDetails = !this.showDetails; // 切换展开区域的显示状态
    },
    goToServerModerator() {
      if (this.name === this.current_chatroom_owner) {
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
    },
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
</style>

<template>
  <q-page padding style="background-color: #ECF0F1;">
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
          <div>
            <span v-if="bio === null">🥰 Bio : 未设置</span>
            <span v-else>🥰 Bio : {{ bio }}</span>
          </div>
          <div>
            <span v-if="bio === null">🥳 Birthday : 未设置</span>
            <span v-else>🥳 Birthday : {{ birthday }}</span>
          </div>
        </q-card-section>
      </q-card>
      <q-separator inset />
      <q-card-section>
        <q-expansion-item expand-separator icon="chat" label="Chatrooms  " caption="点击展开聊天室">
          <q-list separator bordened>
            <q-separator />
            <q-item v-for="chatroom in chatrooms" :key="chatroom.id" clickable @click="switchChatRoom(chatroom.id)">
              <q-item-section :class="chatroom.id === current_chatroom_id ? 'text-primary' : ''">
                {{ chatroom.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-card-section>
      <q-separator inset />
      <q-card-section>
        <q-btn flat class="full-width no-border" @click="newChatroomDialogVisible = true">💬 新建聊天室</q-btn>
        <q-btn flat class="full-width no-border" @click="gotoAccountInfo">👋 个人资料</q-btn>
        <q-btn flat class="full-width no-border" @click="gotoLogin">👉 登录</q-btn>
        <q-btn flat class="full-width no-border" @click="toggleDrawer">⬅️ 关闭</q-btn>
      </q-card-section>
    </q-drawer>

    <!--新建聊天室对话框-->
    <q-dialog v-model="newChatroomDialogVisible" persistent>
      <q-card style="width: 400px;">
        <q-card-section>
          <div class="text-h6">💬 新建聊天室</div>
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

    <div class="chat-container">
      <q-chat-message v-for="msg in messages" :key="msg.name" :sent="msg.name === name" :name="null" name-html
        :avatar="msg.avatar_url ? msg.avatar_url : 'https://img.icons8.com/?size=100&id=YXG86oegZMMh&format=png&color=000000'"
        :stamp="msg.date" @click="clickMessage($event, msg.id, msg.name_id, msg.name)">
        <div v-if="msg.isReply == 1">{{ msg.reply }}</div>
        <template v-slot:name>
          <div v-for="(all_badge, key) in all_badges" :key="key" style="display: flex; gap: 3px;flex-wrap: wrap">
            <div v-for="(idIndex, value) in all_badge" :key="idIndex">
              <q-badge v-if="msg.badges && msg.badges.includes(value)" :label="value" :color="getBadgeColor(value)" />
            </div>
          </div>
          <span v-html="`<span>${msg.name}</span>`"></span>
        </template>
        <span v-if="msg.type == 1">{{ msg.message }}</span>
        <q-img v-if="msg.type == 2 && msg.message.startsWith('http')" :src="msg.message"
          @click="openSourceInNewTab(msg.message)" />
        <q-video v-if="msg.type == 3 && msg.message.startsWith('http')" :src="msg.message"
          @click="openSourceInNewTab(msg.message)" :autoplay="false" />
        <a v-if="msg.type == 4" :href="msg.message.startsWith('http') ? msg.message : 'http://' + msg.message"
          target="_blank">🔗 {{ msg.message }}</a>
        <div v-if="msg.type == 5">
          <span>📁 文件</span>
          <q-btn color="primary" rounded style="margin-left: 5px;" text-color="white"
            @click=" downloadFile(msg.message)">
            直链下载
          </q-btn>
        </div>
      </q-chat-message>
    </div>

    <q-slide-transition>
      <q-card v-if="siderVisible"
        :style="{ position: 'fixed', left: expansionX + 'px', top: expansionY + 'px', zIndex: 999 }">
        <q-list bordened vertical>
          <q-item style="background-color: #ECF0F1;">
            <q-btn flat label="🔎 查看个人资料" @click="gotoUserInfo(this.edit_name_id)" />
          </q-item>
          <q-item style="background-color: #ECF0F1;">
            <q-btn flat label="🗣️ 回复TA" @click="replyMessage(this.edit_name)" />
          </q-item>
          <q-item style="background-color: #ECF0F1;">
            <q-btn flat label="👉 撤回消息" @click="recallMessage(this.edit_message_id, this.edit_name_id)" />
          </q-item>
          <q-item style="background-color: #ECF0F1;">
            <q-btn flat label="❌ 关闭" @click="closeSider" />
          </q-item>
        </q-list>
      </q-card>
    </q-slide-transition>

    <div class="chat-input-container">
      <q-input v-model="message" :label="message_isReply == 1 ? message_Reply : '消息'" class="bottom-input"
        @keyup.enter="sendMessage" :placeholder="message_type == 4 ? '请输入网页链接' : '请输入内容'">
        <q-expansion-item v-model="expansionVisible" style="position: absolute; bottom: 5px; right: 10px;">
          <q-list bordened vertical>
            <q-item style="background-color: #ECF0F1;" v-if="message_isReply == 1">
              <q-btn flat label="❌ 取消回复" @click="cancelReply" />
            </q-item>
            <q-item style="background-color: #ECF0F1;">
              <q-btn flat label="📝 文字" @click="editTypeText" />
            </q-item>
            <q-item style="background-color: #ECF0F1;">
              <q-btn flat label="📷 图片" @click="editTypePhoto" />
            </q-item>
            <q-item style="background-color: #ECF0F1;">
              <q-btn flat label="📹 视频" @click="editTypeVideo" />
            </q-item>
            <q-item style="background-color: #ECF0F1;">
              <q-btn flat label="🔗 链接" @click="editTypeWeb" />
            </q-item>
            <q-item style="background-color: #ECF0F1;">
              <q-btn flat label="📁 文件" @click="editTypeFile" />
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-input>
      <q-btn round icon="navigation" class="send-btn q-btn-shadow" @click="sendMessage"
        style="background-color: #ECF0F1;" />
      <q-btn round icon="add" class="send-btn q-btn-shadow" @click="editType" style="background-color: #ECF0F1;" />
    </div>

    <q-dialog v-model="uploadFileDialogVisible_1">
      <q-uploader url="http://localhost:3000/api/upload" style="max-width: 300px" accept="image/*"
        @uploaded="handleUploadSuccess" @upload-error="handleUploadError" field-name="file" label="📷 Upload Images" />
    </q-dialog>

    <q-dialog v-model="uploadFileDialogVisible_2">
      <q-uploader url="http://localhost:3000/api/upload" style="max-width: 300px" accept="video/*"
        @uploaded="handleUploadSuccess" @upload-error="handleUploadError" field-name="file" label="📹 Upload Videos" />
    </q-dialog>

    <q-dialog v-model="uploadFileDialogVisible_3">
      <q-uploader url="http://localhost:3000/api/upload" style="max-width: 300px" @uploaded="handleUploadSuccess"
        @upload-error="handleUploadError" field-name="file" label="📁 Upload Files" />
    </q-dialog>
  </q-page>
</template>

<script>
import { jwtDecode } from 'jwt-decode';


export default {
  data() {
    return {
      messages: [],
      ws_action: 'send',
      message: '', message_type: '1', message_isReply: false, message_Reply: '',
      name: '', Id: '', avatar_url: '', bio: '', birthday: '',
      ws: null,
      isConnected: false,
      currentTime: '',
      leftDrawerOpen_1: false, newChatroomDialogVisible: false, expansionVisible: false, uploadFileDialogVisible_1: false, uploadFileDialogVisible_2: false, uploadFileDialogVisible_3: false, siderVisible: false,
      current_chatroom: '', current_chatroom_id: '1',
      chatrooms: [],
      showDetails: false,
      current_chatroom_owner: '',
      badges: [], all_badges: [],
      newChatroomName: '', newChatroomOwner: '', newChatroomModerator: '',
      expansionX: 0, expansionY: 0,
      edit_message_id: '', edit_name_id: '', edit_name: '',
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
    this.connetWebsocket();
    this.fetchChatrooms();
    this.fetchAccountInfo();

    setInterval(this.updateTime, 1000);

  },
  methods: {
    async connetWebsocket() {
      this.ws = new WebSocket(`ws://localhost:3000`);
      this.ws.onopen = () => {
        this.isConnected = true;
        console.log("WebSocket connection established");
      };
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.success === false) {
            console.log(data)
            this.$q.notify({
              type: 'negative',
              message: data.message,
              timeout: 1000,
            });
            console.log("Error:", data.message);
        }
        if (data.action == 'newMessage') {
          const newMessage = JSON.parse(event.data);
          this.messages.push(newMessage);
          this.fetchMessages();
        }
        if (data.action == "messageRevoked") {
          this.$q.notify({
            type: 'positive',
            message: data.message,
          });
          this.fetchMessages();
        }
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        console.log("WebSocket connection closed");
      };
      this.ws.onerror = (err) => {
        console.log("WebSocket error:", err);
      };
    },
    async fetchAllChatrooms() {
      fetch("http://localhost:3000/api/all_chatrooms")
        .then(response => response.json())
        .then(data => {
          this.chatrooms = data.chatrooms;
        })
        .catch(err => {
          console.error("Error fetching chatrooms:", err);
        });
    },
    async fetchChatrooms() {
      fetch(`http://localhost:3000/api/chatrooms?chatroom_id=${this.current_chatroom_id}`)
        .then(response => response.json())
        .then(data => {
          this.current_chatroom_id = data.chatrooms.id;
          this.current_chatroom = data.chatrooms.name;
          this.current_chatroom_owner = data.chatrooms.owner;
          this.fetchMessages();
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: '聊天室获取错误，请检查网络',
            icon: 'report_problem',
            position: 'top'
          });
          console.error("Error fetching chatrooms:", err);
        });
    },
    async fetchMessages() {
      fetch(`http://localhost:3000/api/chatroomBadges?chatroom_id=${this.current_chatroom_id}`)
        .then(response => response.json())
        .then(data => {
          this.all_badges = data.badges
          console.log(this.all_badges);
        })
        .catch(err => {
          console.error("Error fetching chatroom badges:", err);
        });
      fetch(`http://localhost:3000/api/messages?chatroom_id=${this.current_chatroom_id}`)
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
        const currentTime = new Date().toLocaleTimeString();
        const msg = { action: this.ws_action, chatroom: this.current_chatroom, Id: this.Id, name: this.name, avatar: this.avatar_url, message: this.message, currentTime: currentTime, message_type: parseInt(this.message_type, 10), message_isReply: this.message_isReply, message_Reply: this.message_Reply };
        this.ws.send(JSON.stringify(msg));
        this.message = '';
        this.message_type = 1;
      } else {
        this.$q.notify({
          color: 'yellow',
          message: '服务器连接中断，请刷新再试',
          icon: 'report_problem',
          position: 'top'
        });
        console.log("WebSocket is not connected");
      }
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString();
    },
    gotoLogin() {
      this.$router.push('/login');
    },
    toggleDrawer() {
      this.fetchAllChatrooms();
      this.leftDrawerOpen_1 = !this.leftDrawerOpen_1;
    },
    switchChatRoom(chatroomId) {
      this.current_chatroom_id = chatroomId;
      this.fetchChatrooms();
    },
    toggleDetails() {
      this.showDetails = !this.showDetails;
    },
    goToServerModerator() {
      const token = localStorage.getItem('token');
      console.log(this.current_chatroom_id);
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
          chatroom_id: this.current_chatroom_id,
        })
      })
        .then(response => {
          if (response.status === 401) {
            this.$q.notify({
              color: 'negative',
              message: 'Token is required',
              icon: 'error',
              position: 'top'
            });
            throw new Error('Token is required');
          } else if (response.status === 402) {
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
            this.$router.push({
              name: 'server-moderator',
              query: {
                chatroom_id: this.current_chatroom_id,
                chatroom: this.current_chatroom,
                owner: this.current_chatroom_owner
              }
            });
          } else {
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
        console.log('创建聊天室: ', this.newChatroomName);
        this.newChatroomDialogVisible = false;
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
            if (!response.ok) {
              return response.json().then(error => {
                throw new Error(error.error);
              });
            }
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
            window.location.reload()
          })
          .catch(error => {
            this.$q.notify({
              type: 'negative',
              message: error.message,
              position: 'top'
            });
          });
      }
    },
    fetchAccountInfo() {
      const url = `http://localhost:3000/api/accountInfo?id=${this.Id}`;
      fetch(url)
        .then(response => {
          if (!response.ok) {
            return Promise.reject('请求失败，状态码：' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('用户信息:', data);
          this.bio = data.bio;
          this.birthday = data.birthday;
        })
        .catch(error => {
          console.error('请求失败，网络错误:', error);
          this.$q.notify({
            type: 'negative',
            message: '请求失败，网络错误：' + error,
            position: 'top',
            timeout: 3000
          });
        });
    },
    gotoAccountInfo() {
      this.$router.push({ path: '/AccountInfo', query: { id: this.Id } });
    },
    gotoUserInfo(userId) {
      this.$router.push({ path: '/AccountInfo', query: { id: userId } });
    },
    editType() {
      this.expansionVisible = !this.expansionVisible;
    },
    editTypeText() {
      this.message_type = '1';
      this.expansionVisible = !this.expansionVisible;
    },
    editTypePhoto() {
      this.uploadFileDialogVisible_1 = !this.uploadFileDialogVisible_1;
      this.message_type = '2';
      this.expansionVisible = !this.expansionVisible;
    },
    editTypeVideo() {
      this.uploadFileDialogVisible_2 = !this.uploadFileDialogVisible_2;
      this.message_type = '3';
      this.expansionVisible = !this.expansionVisible;
    },
    editTypeWeb() {
      this.message_type = '4';
      this.expansionVisible = !this.expansionVisible;
    },
    editTypeFile() {
      this.uploadFileDialogVisible_3 = !this.uploadFileDialogVisible_3;
      this.message_type = '5';
      this.expansionVisible = !this.expansionVisible;
    },
    openSourceInNewTab(url) {
      window.open(url, '_blank');
    },
    handleUploadSuccess({ xhr }) {
      const response = JSON.parse(xhr.responseText);
      const filename = response.filename;
      this.message = "http://localhost:3000/file/" + filename
      this.sendMessage();
      console.log(this.message)
      this.$q.notify({
        message: '上传成功',
        color: 'positive',
        icon: 'check'
      });
      if (this.message_type == 2) {
        this.uploadFileDialogVisible_1 = !this.uploadFileDialogVisible_1;
      }
      if (this.message_type == 3) {
        this.uploadFileDialogVisible_2 = !this.uploadFileDialogVisible_2;
      }
      if (this.message_type == 5) {
        this.uploadFileDialogVisible_3 = !this.uploadFileDialogVisible_3;
      }
    },
    handleUploadError(err) {
      this.$q.notify({
        message: '文件上传失败',
        color: 'negative',
        icon: 'error'
      });
      console.error('文件上传失败:', err);
    },
    downloadFile(url) {
      console.log(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop();
      link.click();
    },
    openSider() {
      console.log("siderVisible", this.siderVisible);
      this.siderVisible = !this.siderVisible;
    },
    clickMessage(event, messageId, nameId, name) {
      this.expansionX = event.clientX;
      this.expansionY = event.clientY;
      this.edit_message_id = messageId;
      this.edit_name_id = nameId;
      this.edit_name = name
      this.siderVisible = !this.siderVisible
    },
    replyMessage(name) {
      this.message_isReply = true;
      this.message_Reply = "回复" + name + ":";
      this.siderVisible = !this.siderVisible
    },
    cancelReply() {
      this.message_isReply = false;
      this.message_Reply = "";
      this.expansionVisible = !this.expansionVisible
    },
    recallMessage(messageId, nameId) {
      this.ws_action = 'recall';
      const token = localStorage.getItem('token');
      if (this.isConnected) {
        const recall_msg = { action: this.ws_action, chatroom: this.current_chatroom, Id: this.Id, message_id: messageId, name_id: nameId, token: token };
        this.ws.send(JSON.stringify(recall_msg));
      } else {
        this.$q.notify({
          color: 'yellow',
          message: '服务器连接中断，请刷新再试',
          icon: 'report_problem',
          position: 'top'
        });
        console.log("WebSocket is not connected");
      }
      this.ws_action = 'send';
      this.edit_message_id = '';
      this.edit_name_id = '';
      this.edit_name = '';
      this.siderVisible = !this.siderVisible
    },
    closeSider() {
      this.siderVisible =!this.siderVisible
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
  display: flex;
  justify-content: center;
  background-color: transparent;
  align-items: center;
}

.send-btn .q-btn__content {
  padding: 0;
}

.chatroom-btn {
  width: 80%;
  margin: 0 auto;
}

.custom-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  color: black;
}
</style>

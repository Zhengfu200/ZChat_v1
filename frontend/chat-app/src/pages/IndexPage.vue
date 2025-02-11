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
    <q-dialog v-model="showDetails" backdrop-filter="blur(4px) saturate(150%)">
      <q-card style="width: 60vw;">
        <q-card-section>
          <div class="text-h6">聊天室详情</div>
          <div v-if="current_chatroom">
            <p style="font-weight: 600;"><q-badge rounded color="green" /> 🚩 名称 : {{ current_chatroom }}</p>
            <p style="font-weight: 600;"><q-badge rounded color="red" /> 👑 所有者: {{ current_chatroom_owner }}</p>
            <div>
              <p style="font-weight: 600;"><q-badge rounded color="blue" /> 👮 管理员:</p>
              <p style="font-weight: 400; margin-left: 20px;" v-for="(moderator, index) in current_chatroom_moderator" :key="index" ><q-badge rounded color="blue"/> {{ moderator }}</p>
            </div>
            <div>
              <p style="font-weight: 600;"><q-badge rounded color="purple" /> 🕶️ 身份组:</p>
              <q-list>
                <q-badge style="margin-left: 10px;" v-for="badges in allBadges" :key="badges.id" :label="badges"
                  :color="getBadgeColor(badges)" />
              </q-list>
            </div>
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
    <q-drawer v-model="leftDrawerOpen_1" side="left" style="width: 25vw; padding: 10px;" bordered>
      <q-card>
        <q-card-section class="avatar-section text-center">
          <q-avatar>
            <img
              :src="avatar_url ? avatar_url : 'https://img.icons8.com/?size=100&id=YXG86oegZMMh&format=png&color=000000'" />
          </q-avatar>
          <div style="margin-top: 10px; font-weight: 500; overflow: hidden;">🖖 欢迎回来，{{ name }}</div>
        </q-card-section>
      </q-card>
      <q-card style="margin-top: 10px;">
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
      </q-card>
      <q-card style="margin-top: 10px;">
        <q-card-section>
          <q-btn flat class="full-width no-border" @click="newChatroomDialogVisible = true">💬 新建聊天室</q-btn>
          <q-btn flat class="full-width no-border" @click="gotoAccountInfo">👋 个人资料</q-btn>
          <q-btn flat class="full-width no-border" @click="gotoLogin">👉 登录</q-btn>
          <q-btn flat class="full-width no-border" @click="goToServerModerator">🖊️ 修改聊天室</q-btn>
          <q-btn flat class="full-width no-border" @click="AboutProject">📄 项目文档</q-btn>
          <q-btn flat class="full-width no-border" @click="toggleDrawer">⬅️ 关闭</q-btn>
        </q-card-section>
      </q-card>
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
      <div class="message-container">
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
            <q-btn color="primary" rounded style="margin-left: 5px;" text-color="white" z-index="100"
              @click=" downloadFile(msg.message)">
              直链下载
            </q-btn>
          </div>
        </q-chat-message>
      </div>
    </div>

    <q-slide-transition>
      <q-card v-if="siderVisible"
        :style="{ position: 'fixed', left: expansionX + 'px', top: expansionY + 'px', zIndex: 9 }">
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
      <q-btn :icon="InputContainerVisible ? matChevronRight : matChevronLeft" round class="send-btn q-btn-shadow"
        @click="hideInputContainer" style="background-color: #ECF0F1; margin-right: 10px;" />
      <q-input v-if="InputContainerVisible" v-model="message" :label="message_isReply == 1 ? message_Reply : '消息'"
        class="bottom-input" @keyup.enter="sendMessage" :placeholder="message_type == 4 ? '请输入网页链接' : '请输入内容'">
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
      <q-btn v-if="InputContainerVisible" round icon="add" class="send-btn q-btn-shadow" @click="editType"
        style="background-color: #ECF0F1;" />
    </div>

    <q-dialog v-model="uploadFileDialogVisible_1" backdrop-filter="blur(4px) saturate(150%)">
      <q-uploader url="http://localhost:3000/api/upload" style="max-width: 300px" accept="image/*"
        @uploaded="handleUploadSuccess" @upload-error="handleUploadError" field-name="file" label="📷 Upload Images" />
    </q-dialog>

    <q-dialog v-model="uploadFileDialogVisible_2" backdrop-filter="blur(4px) saturate(150%)">
      <q-uploader url="http://localhost:3000/api/upload" style="max-width: 300px" accept="video/*"
        @uploaded="handleUploadSuccess" @upload-error="handleUploadError" field-name="file" label="📹 Upload Videos" />
    </q-dialog>

    <q-dialog v-model="uploadFileDialogVisible_3" backdrop-filter="blur(4px) saturate(150%)">
      <q-uploader url="http://localhost:3000/api/upload" style="max-width: 300px" @uploaded="handleUploadSuccess"
        @upload-error="handleUploadError" field-name="file" label="📁 Upload Files" />
    </q-dialog>
  </q-page>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import { matChevronRight, matChevronLeft } from '@quasar/extras/material-icons';


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
      leftDrawerOpen_1: false, newChatroomDialogVisible: false, expansionVisible: false, uploadFileDialogVisible_1: false, uploadFileDialogVisible_2: false, uploadFileDialogVisible_3: false, siderVisible: false, InputContainerVisible: true,
      current_chatroom: '', current_chatroom_id: '', current_chatroom_moderator: [], allBadges: [],
      chatrooms: [],
      showDetails: false,
      current_chatroom_owner: '',
      badges: [], all_badges: [],
      newChatroomName: '', newChatroomOwner: '', newChatroomModerator: '',
      expansionX: 0, expansionY: 0,
      edit_message_id: '', edit_name_id: '', edit_name: '',
      matChevronRight, matChevronLeft,
    };
  },
  mounted() {
    this.current_chatroom_id = localStorage.getItem('current_chatroom_id');
    if (this.current_chatroom_id == null) {
      localStorage.setItem('current_chatroom_id', 1);
      this.current_chatroom_id = 1;
    }
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
        this.$q.notify({
          type: 'positive',
          position: 'top',
          message: '服务器连接成功',
          timeout: 1000,
        });

      };
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.success === false) {
          console.log(data)
          this.$q.notify({
            type: 'negative',
            message: data.message,
            position: 'top',
            timeout: 1000
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
        this.$q.notify({
          type: 'negative',
          position: 'top',
          message: '服务器连接中断，请刷新再试',
          timeout: 1000,
        });
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
            message: '聊天室获取错误，如果您还未创建任何聊天室，请创建一个！',
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
      } else if (!this.isConnected) {
        this.$q.notify({
          color: 'negative ',
          message: '服务器连接中断，尝试重连……',
          icon: 'report_problem',
          position: 'top'
        });
        this.connetWebsocket();
      } else if (!this.name) {
        this.$q.notify({
          color: 'negative',
          message: '用户数据获取错误，请重新登录!',
          icon: 'report_problem',
          position: 'top'
        });
      } else if (!this.message) {
        this.$q.notify({
          color: 'negative',
          message: '无法发送空消息!',
          icon: 'report_problem',
          position: 'top',
        })
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
      localStorage.setItem('current_chatroom_id', chatroomId);
      this.fetchChatrooms();
    },
    toggleDetails() {
      this.getAllBadges();
      this.getModerator();
      this.showDetails = !this.showDetails;
    },
    goToServerModerator() {
      this.$router.push({
        name: 'server-moderator',
        query: {
          chatroom_id: this.current_chatroom_id,
          chatroom: this.current_chatroom,
          owner: this.current_chatroom_owner
        }
      });
    },
    getBadgeColor(value) {
      if (value == 'owner') {
        return 'red';
      } else if (value == 'moderator') {
        return 'blue';
      } else if (value == 'developer') {
        return 'gray';
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
            return Promise.reject('获取用户数据错误：' + response.status);
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
      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop();
      link.click();
    },
    openSider() {
      this.siderVisible = !this.siderVisible;
    },
    clickMessage(event, messageId, nameId, name) {
      const windowHeight = window.innerHeight;
      this.expansionX = event.clientX;
      if (event.clientY + 200 > windowHeight) {
        console.log("overflow")
        this.expansionY = event.clientY - 200;
      } else { this.expansionY = event.clientY; }
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
      this.siderVisible = !this.siderVisible
    },
    hideInputContainer() {
      this.InputContainerVisible = !this.InputContainerVisible
    },
    async getModerator() {
      try {
        const url = `http://localhost:3000/api/chatroomModerators?chatroom_id=${this.current_chatroom_id}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('请求失败，请重试');
        }
        const data = await response.json();
        this.current_chatroom_moderator = data.moderators;
      } catch (error) {
        this.$q.notify({
          color: 'red',
          message: error.message,
          icon: 'error'
        });
      }
    },
    async getAllBadges() {
      try {
        const url = `http://localhost:3000/api/allBadges?chatroom_id=${this.current_chatroom_id}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('请求失败，请重试');
        }
        const data = await response.json();
        this.allBadges = Array.isArray(data.fields) ? data.fields : [];
      } catch (error) {
        this.$q.notify({
          color: 'red',
          message: error.message,
          icon: 'error'
        });
      }
    },
    AboutProject(){
      window.open('https://github.com/Zhengfu200/ZChat_v1', '_blank');
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

.chat-container {
  padding-bottom: 50px;
  box-sizing: border-box;
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

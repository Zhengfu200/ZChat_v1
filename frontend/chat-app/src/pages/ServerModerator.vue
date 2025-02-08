<template>
    <q-layout>
        <q-page-container>
            <q-bar class="bg-primary">
                <q-btn dense flat :icon="matArrowBack" color="white" @click="back" />
                <q-btn dense flat icon="chat" style="color: white;" />
                <div class="text-weight-bold" style="color: white;">
                    ZChat
                </div>
                <div class="col text-center text-weight-bold" style="color: white;">
                    聊天室管理
                </div>
            </q-bar>
            <q-page padding class="q-pa-md">
                <div class="row justify-center">
                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">基本信息</div>

                            <q-input v-model="chatroom_modified" label="Modify Chatroom Name" :default-value="chatroom"
                                filled dense class="q-mb-md" />

                            <q-input v-model="owner_modified" label="Modify Owner" :default-value="owner" filled dense
                                class="q-mb-md" />

                            <q-btn label="Save Changes" icon="save" color="primary" style="margin-right: 10px;"
                                @click="saveChanges" />
                        </q-card-section>
                    </q-card>

                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%; margin-top: 10px;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">管理员</div>
                            <q-list>
                                <q-item v-for="(moderator, index) in moderators" :key="index">
                                    <q-item-section>
                                        <p style="font-weight: 500;"><q-badge rounded color="red"
                                                style="margin-right: 10px;" /> {{ moderator }}</p>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                            <q-separator inset />
                        </q-card-section>

                        <q-input v-model="moderator_add" label="新增管理员" filled dense class="q-mb-md" />
                        <q-btn label="Save Changes" :icon="matAddCircleOutline" color="primary"
                            style="margin-right: 10px;" @click="addModerator" />
                    </q-card>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { matAddCircleOutline, matArrowBack } from '@quasar/extras/material-icons';

export default {
    data() {
        return {
            chatroom_id: '',
            chatroom_previous: '',
            owner_previous: '',
            chatroom_modified: '',
            owner_modified: '',
            matArrowBack, matAddCircleOutline,
            moderators: [],
            moderator_add: '',
        };
    },
    mounted() {
        this.chatroom_id = this.$route.query.chatroom_id;
        this.chatroom_previous = this.$route.query.chatroom;
        this.owner_previous = this.$route.query.owner;
        this.chatroom_modified = this.chatroom_previous;
        this.owner_modified = this.owner_previous;
        this.getModerator();
    },
    methods: {
        async saveChanges() {
            if (/\s/.test(this.chatroom_modified)) {
                this.$q.notify({
                    color: 'yellow',
                    message: '聊天室名称不可包含空格',
                });
                return;
            }
            if (this.chatroom_modified == '') {
                this.chatroom_modified = this.chatroom_previous;
            }
            if (this.owner_modified == '') {
                this.owner_modified = this.owner_previous;
            }
            const payload = {
                chatroom_id: this.chatroom_id,
                chatroom_previous: this.chatroom_previous,
                owner_previous: this.owner_previous,
                chatroom_modified: this.chatroom_modified,
                owner_modified: this.owner_modified
            };

            try {
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
                const response = await fetch('http://localhost:3000/api/mod', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (response.ok) {
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.$router.push('/');
                } else {
                    this.$q.notify({
                        color: 'red',
                        message: data.error,
                        icon: 'error'
                    });
                }
            } catch (error) {
                this.$q.notify({
                    color: 'red',
                    message: error.message || '请求失败，请重试',
                    icon: 'error'
                });
            }
        },
        back() {
            this.$router.go(-1);
        },
        async getModerator() {

            try {
                const url = `http://localhost:3000/api/chatroomModerators?chatroom_id=${this.chatroom_id}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('请求失败，请重试');
                }
                const data = await response.json();
                this.moderators = data.moderators;
                console.log(this.moderators);
            } catch (error) {
                this.$q.notify({
                    color: 'red',
                    message: error.message,
                    icon: 'error'
                });
            }
        },
        async addModerator() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                moderator_add: this.moderator_add
            };
            const response = await fetch('http://localhost:3000/api/addModerator', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                this.$q.notify({
                    color: 'green',
                    message: data.message || '管理员添加成功',
                    icon: 'check_circle'
                });
                this.getModerator(); // 刷新管理员列表
            } else {
                this.$q.notify({
                    color: 'red',
                    message: data.error || '请求失败，请重试',
                    icon: 'error'
                });
            }
        }
    }
};
</script>
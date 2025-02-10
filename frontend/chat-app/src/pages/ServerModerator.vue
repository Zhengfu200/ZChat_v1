<template>
    <q-layout>
        <q-page-container>
            <q-bar class="bg-primary">
                <q-btn dense flat :icon="matArrowBack" color="white" @click="back" />
                <div class="col text-center text-weight-bold" style="color: white;">
                    聊天室管理
                </div>
            </q-bar>
            <q-page padding class="q-pa-md">
                <div class="row justify-center">
                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">基本信息</div>

                            <q-input v-model="chatroom_modified" label="修改聊天室名称" :default-value="chatroom" filled dense
                                class="q-mb-md" />

                            <q-input v-model="owner_modified" label="修改聊天室所有者" :default-value="owner" filled dense
                                class="q-mb-md" />

                            <q-btn label="保存更改" icon="save" color="primary" style="margin-right: 10px;"
                                @click="saveChanges" />
                        </q-card-section>
                    </q-card>

                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%; margin-top: 10px;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">管理员</div>
                            <q-list>
                                <q-item v-for="(moderator, index) in moderators" :key="index">
                                    <q-item-section>
                                        <p style="font-weight: 500;"><q-badge rounded color="blue"
                                                style="margin-right: 10px;" /> {{ moderator }}</p>
                                    </q-item-section>
                                    <q-btn dense flat icon="delete" color="red" @click="deleteModerator(moderator)" />
                                </q-item>
                            </q-list>
                            <q-separator inset />
                        </q-card-section>

                        <q-input v-model="moderator_add" label="新增管理员" filled dense class="q-mb-md" />
                        <q-btn label="添加管理员" :icon="matAddCircleOutline" color="primary" style="margin-right: 10px;"
                            @click="addModerator" />
                    </q-card>


                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%; margin-top: 10px;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">禁言用户</div>
                            <q-list>
                                <q-item v-for="account in banAcounts" :key="account.id">
                                    <q-item-section>
                                        <p style="font-weight: 500;"><q-badge rounded color="red"
                                                style="margin-right: 10px;" /> {{ account.name }}</p>
                                    </q-item-section>
                                    <q-btn dense flat icon="delete" color="red" @click="deleteBanAccount(account.id)" />
                                </q-item>
                            </q-list>
                            <q-separator inset />
                        </q-card-section>

                        <q-input v-model="banAccount_add" label="新增禁言用户" filled dense class="q-mb-md" />
                        <q-btn label="添加禁言用户" :icon="matAddCircleOutline" color="primary" style="margin-right: 10px;"
                            @click="addBanAccount" />
                    </q-card>

                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%; margin-top: 10px;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">频道身分组</div>
                            <q-badge style="margin-left: 10px;" v-for="badges in allBadges" :key="badges.id"
                                :label="badges" :color="getBadgeColor(badges)" />
                            <q-separator inset />
                        </q-card-section>

                        <q-input v-model="addBadgesName" label="身份组名称" filled dense class="q-mb-md" />
                        <q-input v-model="addBadgesAccount" label="新增用户" filled dense class="q-mb-md" />
                        <q-btn label="添加用户" :icon="matAddCircleOutline" color="primary" style="margin-right: 10px;"
                            @click="addBadges" />
                        <q-btn label="移除用户" icon="delete" color="red" style="margin-right: 10px;"
                            @click="deleteBadges" />

                        <q-btn label="移除所有用户" icon="delete" color="red" style="margin-right: 10px;"
                            @click="deleteWholeBadges" />
                    </q-card>


                    <q-card class="q-pa-md" style="max-width: 80vw; width: 100%; margin-top: 10px;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md" style="font-weight: 600;">删除频道</div>
                            <q-separator inset />
                        </q-card-section>
                        <q-btn label="删除聊天数据" icon="delete" color="purple" style="margin-right: 10px;"
                            @click="deleteMessages" />
                        <q-btn label="删除聊天室" icon="delete" color="red" style="margin-right: 10px;"
                            @click="changeDialogVisible" />
                    </q-card>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>

    <q-dialog v-model="dialogVisible" backdrop-filter="blur(4px) saturate(150%)">
        <q-card class="q-pa-md" style="min-width: 300px;">
            <div class="row items-center q-mb-md">
                <q-icon name="warning" color="red" size="32px" />
                <span class="text-h6 q-ml-sm" style="font-weight: 600;">警告，此操作不可逆！</span>
            </div>
            <q-card-actions align="right">
                <q-btn flat label="取消" color="primary" @click="changeDialogVisible" />
                <q-btn label="确认" color="negative" @click="deleteChatroom" />
            </q-card-actions>
        </q-card>
    </q-dialog>
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
            banAcounts: [],
            moderator_add: '',
            banAccount_add: '',
            allBadges: [],
            addBadgesName: '',
            addBadgesAccount: '',
            dialogVisible: false,
        };
    },
    mounted() {
        this.chatroom_id = this.$route.query.chatroom_id;
        this.chatroom_previous = this.$route.query.chatroom;
        this.owner_previous = this.$route.query.owner;
        this.chatroom_modified = this.chatroom_previous;
        this.owner_modified = this.owner_previous;
        this.getModerator();
        this.getBanAccount();
        this.getAllBadges();
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
                moderator_add: this.moderator_add,
                token: token,
            };

            fetch('http://localhost:3000/api/addModerator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getModerator();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        async deleteModerator(moderator_delete) {
            console.log(moderator_delete)
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                moderator_delete: moderator_delete,
                token: token,
            };

            fetch('http://localhost:3000/api/deleteModerator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getModerator();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        async getBanAccount() {
            try {
                const url = `http://localhost:3000/api/allBanAccount?chatroom_id=${this.chatroom_id}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('请求失败，请重试');
                }
                const data = await response.json();
                this.banAcounts = Array.isArray(data.bannedAccounts) ? data.bannedAccounts : [];
                console.log(this.banAcounts)
            } catch (error) {
                this.$q.notify({
                    color: 'red',
                    message: error.message,
                    icon: 'error'
                });
            }
        },
        addBanAccount() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                ban_account: this.banAccount_add,
                token: token,
            };

            fetch('http://localhost:3000/api/banAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getBanAccount();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        deleteBanAccount(deleteBanAccountId) {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                BanAccountId_delete: deleteBanAccountId,
                token: token,
            };

            fetch('http://localhost:3000/api/deleteBanAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getBanAccount();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        async getAllBadges() {
            try {
                const url = `http://localhost:3000/api/allBadges?chatroom_id=${this.chatroom_id}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('请求失败，请重试');
                }
                const data = await response.json();
                this.allBadges = Array.isArray(data.fields) ? data.fields : [];
                console.log(this.allBadges)
            } catch (error) {
                this.$q.notify({
                    color: 'red',
                    message: error.message,
                    icon: 'error'
                });
            }
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
        addBadges() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                addBadgesName: this.addBadgesName,
                addBadgesAccount: this.addBadgesAccount,
                token: token,
            };

            fetch('http://localhost:3000/api/addBadgesAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getAllBadges();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        deleteBadges() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                addBadgesName: this.addBadgesName,
                addBadgesAccount: this.addBadgesAccount,
                token: token,
            };

            fetch('http://localhost:3000/api/deleteBadgesAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getAllBadges();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        deleteWholeBadges() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                addBadgesName: this.addBadgesName,
                token: token,
            };

            fetch('http://localhost:3000/api/deleteBadges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    this.getAllBadges();
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        deleteMessages() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                token: token,
            };

            fetch('http://localhost:3000/api/deleteMessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        deleteChatroom() {
            const token = localStorage.getItem('token');

            const payload = {
                chatroom_id: this.chatroom_id,
                token: token,
            };

            fetch('http://localhost:3000/api/deleteChatrooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const data = await response.json();
                    this.$q.notify({
                        color: 'green',
                        message: data.message,
                        icon: 'check_circle'
                    });
                    const current_chatroom_id = localStorage.getItem('current_chatroom_id');
                    if (current_chatroom_id == this.chatroom_id) {
                        localStorage.removeItem('current_chatroom_id');
                    }
                    this.$router.push('/');
                })
                .then(data => {
                    console.log('success', data);
                })
                .catch(error => {
                    this.$q.notify({
                        color: 'red',
                        message: error.message,
                        icon: 'error'
                    });
                });
        },
        changeDialogVisible() {
            this.dialogVisible = !this.dialogVisible;
        }
    }
};
</script>
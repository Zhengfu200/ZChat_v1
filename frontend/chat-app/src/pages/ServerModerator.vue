<template>
    <q-layout>
        <q-page-container>
            <q-page padding>
                <div>
                    <h2>Server Moderator</h2>
                    <q-input v-model="chatroom_modified" label="Modify Chatroom Name" :default-value="chatroom"
                        filled />
                    <q-input v-model="owner_modified" label="Modify Owner" :default-value="owner" filled />

                    <q-btn label="Save Changes" @click="saveChanges" color="primary" />
                    <!-- 这里可以展示更多的聊天室管理功能 -->
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
export default {
    data() {
        return {
            chatroom_previous: '',
            owner_previous: '',
            chatroom_modified: '',
            owner_modified: '',
        };
    },
    mounted() {
        // 获取路由传递的参数
        this.chatroom_previous = this.$route.query.chatroom;
        this.owner_previous = this.$route.query.owner;
    },
    methods: {
        async saveChanges() {
            if (this.chatroom_modified == '') {
                this.chatroom_modified = this.chatroom_previous;
            }
            if (this.owner_modified == '') {
                this.owner_modified = this.owner_previous;
            }
            console.log(this.chatroom_modified);
            console.log(this.owner_modified)
            const payload = {
                chatroom_previous: this.chatroom_previous,
                owner_previous: this.owner_previous,
                chatroom_modified: this.chatroom_modified,
                owner_modified: this.owner_modified
            };

            try {
                const response = await fetch('http://localhost:3000/api/mod', {
                    method: 'POST',
                    headers: {
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
        }
    }
};
</script>
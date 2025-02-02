<template>
    <q-layout>
        <q-page-container>
            <q-page padding class="q-pa-md">
                <div class="row justify-center">
                    <q-card class="q-pa-md" style="max-width: 500px; width: 100%;">
                        <q-card-section>
                            <div class="text-h6 text-center q-mb-md">Server Moderator</div>

                            <q-input v-model="chatroom_modified" label="Modify Chatroom Name" :default-value="chatroom"
                                filled dense class="q-mb-md" />

                            <q-input v-model="owner_modified" label="Modify Owner" :default-value="owner" filled dense
                                class="q-mb-md" />

                            <q-separator spaced />

                            <q-btn label="Save Changes" icon="save" color="primary" push class="full-width q-mt-md"
                                @click="saveChanges" />
                        </q-card-section>
                    </q-card>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
export default {
    data() {
        return {
            chatroom_id: '',
            chatroom_previous: '',
            owner_previous: '',
            chatroom_modified: '',
            owner_modified: '',
        };
    },
    mounted() {
        this.chatroom_id = this.$route.query.chatroom_id;
        this.chatroom_previous = this.$route.query.chatroom;
        this.owner_previous = this.$route.query.owner;
        this.chatroom_modified = this.chatroom_previous;
        this.owner_modified = this.owner_previous;
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
        }
    }
};
</script>
<template>
    <div style="background-color: #ECF0F1;">
        <q-bar class="bg-primary">
            <q-btn dense flat :icon="matArrowBack" color="white" @click="back" />
            <div class="text-weight-bold text-white">
                Account
            </div>
        </q-bar>
        <q-card style="margin-top: 10px; width: 80vw;justify-self: center;">
            <q-card-section
                :style="banner ? `background-image: url(${banner}); height: 120px;` : 'background-color: gray; height: 120px;'"></q-card-section>

            <q-avatar size="120px"
                style="position: absolute; top: 80px; left: 10px; border-radius: 50%;box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);">
                <img
                    :src="avatar ? avatar : 'https://img.icons8.com/?size=100&id=YXG86oegZMMh&format=png&color=000000'" />
            </q-avatar>

            <span
                style="position: absolute; top:125px; left:150px;font-size: 2.5rem;font-weight: bold;font-family: 'Arial', sans-serif;overflow: hidden;">{{
                    name }}</span>
            <span
                style="position: absolute; top:175px; left:150px;font-size: 1.0rem;font-family: 'Arial', sans-serif;color: gray;">{{
                    bio }}</span>
        </q-card>

        <q-card style="margin-top: 100px; width: 80vw; justify-self: center;">
            <q-card-section style="position: relative;overflow: hidden;">
                <span style="font-weight: bold;font-size: 1.0rem;">🤗 Name: </span>
                <span>{{ name }}</span>
            </q-card-section>
            <q-separator inset />
            <q-card-section  style="overflow: hidden;">
                <span style="font-weight: bold;font-size: 1.0rem;">😶 Gender: </span>
                <span v-if="gender">{{ gender }}</span>
                <span v-else>未设置</span>
                <q-btn icon="edit" size="13px" color="secondary" @click="editgender" round
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" />
            </q-card-section>
            <q-separator inset />
            <q-card-section  style="overflow: hidden;">
                <span style="font-weight: bold;font-size: 1.0rem;">🎂 Birthday: </span>
                <span v-if="birthday">{{ birthday }}</span>
                <span v-else>未设置</span>
                <q-btn icon="edit" size="13px" color="amber" @click="editBirthday" round
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" />
            </q-card-section>
            <q-separator inset />
            <q-card-section>
                <span style="font-weight: bold;font-size: 1.0rem;">🤣 Bio: </span>
                <span v-if="bio">{{ bio }}</span>
                <span v-else>未设置</span>
                <q-btn icon="edit" size="13px" color="brown-5" @click="editBio" round
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" />
            </q-card-section>
            <q-separator inset />
            <q-card-section style="overflow: hidden;">
                <span style="font-weight: bold;font-size: 1.0rem;">🖼️ Avatar: </span>
                <a v-if="avatar" :href="avatar" target="_blank">{{ avatar }}</a>
                <span v-else>未设置</span>
                <q-btn icon="edit" size="13px" color="purple" @click="editAvatar" round
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" />
            </q-card-section>
            <q-separator inset />
            <q-card-section style="overflow: hidden;">
                <span style="font-weight: bold;font-size: 1.0rem;">🖼️ Banner: </span>
                <a v-if="banner" :href="banner" target="_blank">{{ banner }}</a>
                <span v-else>未设置</span>
                <q-btn icon="edit" size="13px" color="black" @click="editBanner" round
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" />
            </q-card-section>
        </q-card>

        <q-card style="margin-top: 20px; width: 80vw; justify-self: center;">
            <q-card-section style="overflow: hidden;">
                <div class="text-h6">👋 About Me:</div>
                <q-btn icon="edit" size="13px" color="indigo" @click="editAboutMe" round
                    style="position: absolute; right: 10px; top: 10px; " />
                <div style="margin-top: 10px;">
                    <div v-if="AboutMe">
                        <q-markdown :src="markdownContent" />
                    </div>
                    <div v-else>此人还没有自我介绍哦~</div>
                </div>
            </q-card-section>
        </q-card>

        <q-dialog v-model="showEditSection_1">
            <q-card style="width: 400px;">
                <q-card-section>
                    <div class="text-h6">edit:</div>
                </q-card-section>

                <q-card-section>
                    <q-input v-model="edit" label="请输入编辑的内容" filled />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="取消" color="negative" @click="changeEditSection_1" />
                    <q-btn flat label="确认" color="primary" @click="uploadEdit" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="showEditSection_2">
            <q-card>
                <q-card-section>
                    <q-date v-model="edit" mask="YYYY-MM-DD" color="blue" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="取消" color="negative" @click="changeEditSection_2" />
                    <q-btn flat label="确认" color="primary" @click="uploadEdit" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
<script>
import { matArrowBack } from '@quasar/extras/material-icons';
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
export default {
    components: {
        QMarkdown,
    },
    data() {
        return {
            token: '',
            birthday: '',
            Id: "",
            name: "",
            avatar: "",
            bio: "",
            gender: "",
            banner: "",
            AboutMe: "",
            markdownContent: "",
            editsection: '',
            edit: '',
            showEditSection_1: false,showEditSection_2: false,
            matArrowBack,
        }
    },
    mounted() {
        this.token = localStorage.getItem('token');
        this.Id = this.$route.query.id;
        this.fetchAccountInfo();
    },
    methods: {
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
                    this.name = data.username;
                    this.avatar = data.avatar;
                    this.bio = data.bio;
                    this.gender = data.gender;
                    this.birthday = data.birthday;
                    this.banner = data.banner;
                    this.AboutMe = data.AboutMe;
                    this.fetchMarkdown();
                })
                .catch(error => {
                    console.error('请求失败:', error);
                    this.$q.notify({
                        type: 'negative',
                        message: '请求失败：' + error,
                        position: 'top',
                        timeout: 3000
                    });
                });
        },
        fetchMarkdown() {
            if (!this.AboutMe) {
                console.log('AboutMe 为空，不执行获取 Markdown 文件的操作');
                return;
            }
            fetch(this.AboutMe)
                .then(response => {
                    if (!response.ok) {
                        return Promise.reject('请求失败，状态码：' + response.status);
                    }
                    return response.text();
                })
                .then(data => {
                    this.markdownContent = data;
                })
                .catch(error => {
                    console.error('请求失败:', error);
                    this.$q.notify({
                        type: 'negative',
                        message: '请求Markdown文件失败：' + error,
                        position: 'top',
                        timeout: 3000
                    });
                });
        },
        changeEditSection_1() {
            this.showEditSection_1 = !this.showEditSection_1;
        },
        editgender() {
            this.editsection = "gender";
            this.showEditSection_1 = !this.showEditSection_1;
        },
        editBirthday() {
            this.editsection = "birthday";
            this.showEditSection_2 = !this.showEditSection_2;
        },
        editBio() {
            this.editsection = "Bio";
            this.showEditSection_1 = !this.showEditSection_1;
        },
        editAvatar() {
            this.editsection = "Avatar";
            this.showEditSection_1 = !this.showEditSection_1;
        },
        editBanner() {
            this.editsection = "Banner";
            this.showEditSection_1 = !this.showEditSection_1;
        },
        editAboutMe() {
            this.editsection = "AboutMe";
            this.showEditSection_1 = !this.showEditSection_1;
        },
        uploadEdit() {
            const requestBody = {
                token: this.token,
                Id: this.Id,
                editsection: this.editsection,
                edit: this.edit,
            }
            this.update(requestBody);
        },
        update(requestBody) {
            const queryParams = new URLSearchParams(requestBody).toString();
            fetch(`http://localhost:3000/api/editAccount?${queryParams}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(error => {
                            throw new Error(error.message);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    this.$q.notify({
                        type: 'positive',
                        message: '更新成功',
                        position: 'top',
                        timeout: 3000
                    });
                    this.fetchAccountInfo();
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                })
                .catch(error => {
                    console.error('请求失败:', error);
                    this.$q.notify({
                        type: 'negative',
                        message: '请求失败：' + error.message,
                        position: 'top',
                        timeout: 3000
                    });
                });
        },
        back() {
            this.$router.go(-1);
        },
        changeEditSection_2() {
            this.showEditSection_2 =!this.showEditSection_2;
        },
    },

}
</script>
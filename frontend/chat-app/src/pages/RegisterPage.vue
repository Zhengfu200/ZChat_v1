<template>
    <q-layout>
        <q-bar class="bg-primary">
            <q-btn dense flat :icon="matArrowBack" color="white" @click="back" />
            <div class="text-weight-bold text-white">
                Register
            </div>
        </q-bar>
        <q-page-container>
            <q-page class="flex flex-center">
                <q-card style="width: 400px;">
                    <q-card-section>
                        <div class="text-h6">Register</div>
                    </q-card-section>

                    <q-card-section>
                        <q-input rounded outlined v-model="username" label="Username" />
                        <q-input style="padding-top: 10px;" rounded outlined v-model="password" label="Password"
                            type="password" />
                        <q-input style="padding-top: 10px;" rounded outlined v-model="confirmPassword"
                            label="Confirm Password" type="password" />
                        <q-input style="padding-top: 10px;" rounded outlined v-model="Avatar_url"
                            label="Please enter the url of your avatar(Optional)" />
                    </q-card-section>

                    <q-card-actions>
                        <q-btn label="Register" color="primary" @click="register" />
                    </q-card-actions>
                </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { matArrowBack } from '@quasar/extras/material-icons';
import axios from 'axios';

export default {
    data() {
        return {
            username: '',
            password: '',
            confirmPassword: '',
            Avatar_url: '',
            matArrowBack,
        };
    },
    methods: {
        register() {
            // 确保所有字段都有填写
            if (this.username && this.password && this.confirmPassword) {
                // 检查密码和确认密码是否一致
                if (this.password === this.confirmPassword) {
                    // 使用 axios 发送注册请求到后端
                    axios.post('http://localhost:3000/register', {
                        username: this.username,
                        password: this.password,
                        avatar_url: this.Avatar_url,
                    })
                        .then(response => {
                            console.log('Registration successful:', response.data);
                            // 注册成功后跳转到登录页面
                            this.$router.push('/login');
                        })
                        .catch(err => {
                            console.error('Registration failed:', err);
                            this.$q.notify({
                                color: 'negative',
                                message: err.response.data.error || 'Registration failed',
                                icon: 'error'
                            });
                        });
                } else {
                    this.$q.notify({
                        color: 'warning',
                        message: 'Passwords do not match.',
                        icon: 'warning'
                    });
                }
            } else {
                this.$q.notify({
                    color: 'warning',
                    message: 'Please fill in all fields.',
                    icon: 'warning'
                });
            }
        },
        back() {
            this.$router.go(-1);
        }
    }
};
</script>

<style scoped>
.text-h6 {
    font-weight: bold;
    font-size: 1.25rem;
}
</style>
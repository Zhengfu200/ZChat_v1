<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card style="width: 400px;">
          <q-card-section>
            <div class="text-h6">Login</div>
          </q-card-section>

          <q-card-section>
            <q-input rounded outlined v-model="username" label="Username" />
            <q-input style="padding-top: 10px;" rounded outlined v-model="password" label="Password" type="password" />
          </q-card-section>

          <q-card-actions>
            <q-btn label="Login" color="primary" @click="login" />
            <q-btn flat label="Register" @click="goToRegister" />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    login() {
      if (this.username && this.password) {
        axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password
        })
          .then(response => {
            // 登录成功，保存 token
            localStorage.setItem('token', response.data.token);
            this.$router.push('/'); // 重定向到主页
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.response.data.error,
              icon: 'error'
            });
          });
      } else {
        this.$q.notify({
          color: 'warning',
          message: 'Please enter username and password',
          icon: 'warning'
        });
      }
    },
    goToRegister() {
      this.$router.push('/register'); // 跳转到注册页面
    }
  }
};
</script>
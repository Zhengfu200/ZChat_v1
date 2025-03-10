import Login from 'pages/LoginPage.vue';
import RegisterPage from 'src/pages/RegisterPage.vue';
import ServerModerator from 'pages/ServerModerator.vue';
import AccountInfo from 'src/pages/AccountInfo.vue';

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }    ]
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: RegisterPage
  },
  {
    path: '/server-moderator',
    name: 'server-moderator',
    component: ServerModerator
  },
  {
    path: '/AccountInfo',
    name: 'AccountInfo',
    component: AccountInfo
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

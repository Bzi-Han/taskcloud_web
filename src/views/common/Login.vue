<script setup>
import network from '../../config/network'
import router from '../../config/router'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import sha1 from 'crypto-js/sha1'

const loading = ref(false);
const isLogin = ref(true);
const loginFormRef = ref();
const loginForm = reactive({
    username: '',
    password: '',
});
const registerFormRef = ref();
const registerForm = reactive({
    nickname: '',
    username: '',
    password: '',
    registerType: 0,
});
const commonRules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
        { min: 5, max: 32, message: '长度在 5 到 32 个字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
    registerType: [
        { required: true, message: '请选择注册类型', trigger: 'change' },
    ],
});

function login() {
    loginFormRef.value.validate(result => {
        if (!result)
            return;

        loading.value = true;
        
        const data = Object.assign({}, loginForm, {password: sha1(loginForm.password).toString()});
        network.put('/user/login', data).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            localStorage.setItem('userInfo', JSON.stringify(result.data));

            router.push('/home-status');
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}
function register() {
    registerFormRef.value.validate(result => {
        if (!result)
            return;

        loading.value = true;
        
        const data = Object.assign({}, registerForm, {password: sha1(registerForm.password).toString()});
        network.post('/user/register', data).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            isLogin.value = true;
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

</script>

<template>
    <div v-loading.fullscreen.lock="loading" style="background-image: url(background.jpg); width:100%; height:100%;">
        <el-row justify="space-between" align="middle" style="height:100%;">
            <el-col :span="1"></el-col>
            <el-col :xs="18" :sm="13" :md="11" :lg="7" :xl="6">
                <el-card v-if="isLogin" style="text-align: center;">
                    <h3 style="color: black; margin-bottom: 30px;">面板登陆</h3>

                    <el-form
                        ref="loginFormRef"
                        :model="loginForm"
                        :rules="commonRules"
                        label-position="right"
                        label-width="80px"
                        style="max-width: 360px; margin:auto; margin-bottom:30px;"
                    >
                        <el-form-item label="账户" prop="username">
                            <el-input v-model="loginForm.username" />
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input v-model="loginForm.password" type="password" />
                        </el-form-item>
                    </el-form>

                    <el-button type="primary" @click="login">登陆</el-button>
                    <el-button @click="isLogin = false">注册账号</el-button>
                </el-card>

                <el-card v-else style="text-align: center;">
                    <h3 style="color: black; margin-bottom: 30px;">账号注册</h3>

                    <el-form
                        ref="registerFormRef"
                        :model="registerForm"
                        :rules="commonRules"
                        label-position="right"
                        label-width="80px"
                        style="max-width: 360px; margin:auto; margin-bottom:30px;"
                    >
                        <el-form-item label="昵称">
                            <el-input v-model="registerForm.nickname" />
                        </el-form-item>
                        <el-form-item label="账户" prop="username">
                            <el-input v-model="registerForm.username" />
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input v-model="registerForm.password" type="password" />
                        </el-form-item>
                        <el-form-item label="注册类型" prop="registerType">
                            <el-select v-model="registerForm.registerType" placeholder="请选择注册的类型">
                                <el-option label="普通用户" :value="0" />
                                <el-option label="开发者" :value="1" />
                            </el-select>
                        </el-form-item>
                    </el-form>

                    <el-button type="primary" @click="register">注册</el-button>
                    <el-button @click="isLogin = true">返回</el-button>
                </el-card>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>
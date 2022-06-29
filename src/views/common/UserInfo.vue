<script setup>
import router from '../../config/router'
import network from '../../config/network'
import { UserState, UserType } from '../../config/types'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const self = undefined === router.currentRoute.value.params.id || '' === router.currentRoute.value.params.id;
const userId = self ? -1 : router.currentRoute.value.params.id;
const loading = ref(false);
const userInfo = ref({
    id: 0,
    nickname: '',
    username: '',
    registedTime: '',
    state: 3,
    type: 0,
});
const updateUserInfoDialog = ref(false);
const updateUserInfoFormRef = ref();
const commonRules = {
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur' },
    ],
};

loading.value = true;
network.get(`/user/detail/${userId}`).then(result => {
    userInfo.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});;

function handleUpdateUserInfo() {
    updateUserInfoFormRef.value.validate(result => {
        if (!result)
            return;

        loading.value = true;
        network.put('/user/update', userInfo.value).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            updateUserInfoDialog.value = false;
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

</script>

<style scoped>
.body {display: flex; flex-direction: column; align-items: center;}
.body .card-align {width: 90%; min-width:420px; margin-top: 20px;}
.body .card-align .div-align-row {display: flex; justify-content: space-between; align-items: center;}
.body .card-align .div-align-column {display: flex; flex-direction: column; align-items: center;}
.info-form {display: flex; flex-direction: column; align-items: flex-start; padding-left: 5px; padding-right: 5px; margin-top: 10px;}
.info-form span:first-child {color: #636466;}
.info-form span:last-child {font-size: 14px; color: #cfd3dc;}
</style>

<template>
    <div v-loading.fullscreen.lock="loading" class="body">
        <el-card header="头像" class="card-align" style="margin-top: 0;">
            <!-- TODO: 使用Gravatar生成头像 -->
            <div class="div-align-column">
                <el-avatar :size="80">
                    <el-icon><Avatar /></el-icon>
                </el-avatar>

                <span style="margin-top: 20px;">test@a.com</span>
            </div>
        </el-card>
        
        <el-card class="card-align">
            <template #header>
                <div class="div-align-row">
                    <span>个人信息</span>

                    <el-button v-if="self" link @click="updateUserInfoDialog = true">
                        <el-icon><EditPen /></el-icon>
                    </el-button>
                </div>
            </template>

            <div class="info-form" style="margin-top: 0;">
                <span>显示昵称</span>
                <span>{{ userInfo.nickname }}</span>
            </div>
            <div class="info-form">
                <span>账号</span>
                <span>{{ userInfo.username }}</span>
            </div>
            <div class="info-form">
                <span>注册日期</span>
                <span>{{ userInfo.registedTime }}</span>
            </div>
            <div class="info-form">
                <span>在线状态</span>
                <span>{{ UserState[userInfo.state] }}</span>
            </div>
            <div class="info-form">
                <span>用户类型</span>
                <span>{{ UserType[userInfo.type] }}</span>
            </div>

            <div v-if="self" style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <!-- TODO: 嘿嘿嘿 -->
                <el-button type="primary">重置密码</el-button>
            </div>
        </el-card>

    </div>

    <el-dialog v-model="updateUserInfoDialog" title="更新信息" width="70%">
        <el-form
            ref="updateUserInfoFormRef"
            :model="userInfo"
            :rules="commonRules"
        >
            <el-form-item label="显示昵称" label-width="100px" prop="nickname">
                <el-input v-model="userInfo.nickname" placeholder="请输入昵称"></el-input>
            </el-form-item>
        </el-form>

        <div style="margin-top: 40px; display:flex; justify-content: flex-end;">
            <el-button @click="updateUserInfoDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleUpdateUserInfo">确 定</el-button>
        </div>
    </el-dialog>

</template>
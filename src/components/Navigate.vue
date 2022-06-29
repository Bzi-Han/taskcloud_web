<script setup>
import router from '../config/router'
import store from '../config/store'
import { ref } from 'vue';
import { ElLoading } from 'element-plus'

const collapse = ref(false);
const currentPath = ref('/home-status');
const isDeveloper = ref(false);
const isAdmin = ref(false);

currentPath.value = router.currentRoute.value.path;
store.useUserInfo(userInfo => {
    isDeveloper.value = 1 === userInfo.type;
    isAdmin.value = 2 === userInfo.type;
});

function nativation(path) {
    if (path !== router.currentRoute.value.path) {
        const loadingHandle = ElLoading.service();
        router.push(path).then(() => {}).finally(() => loadingHandle.close());
    }
}

</script>

<template>
    <el-menu
        :collapse="collapse"
        :default-active="currentPath"
        style="height: 100%;"
        @select="nativation"
    >
        <el-sub-menu index="/home">
            <template #title>
                <el-icon><Coin /></el-icon>
                <span>数据处理中心</span>
            </template>

            <el-menu-item index="/home-status">状态摘要</el-menu-item>
            <el-menu-item index="/task-detail">任务详情</el-menu-item>
            <el-menu-item index="/task-log">任务日志</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/task">
            <el-icon><Tickets /></el-icon>
            <template #title>可用任务中心</template>
        </el-menu-item>
        
        <el-menu-item index="/package">
            <el-icon><Timer /></el-icon>
            <template #title>任务包管理中心</template>
        </el-menu-item>
        
        <el-menu-item index="/config">
            <el-icon><Postcard /></el-icon>
            <template #title>通行证配置中心</template>
        </el-menu-item>

        <el-menu-item index="/help">
            <el-icon><Compass /></el-icon>
            <template #title>帮助文章</template>
        </el-menu-item>
        
        <el-menu-item index="/user-info">
            <el-icon><User /></el-icon>
            <template #title>个人信息</template>
        </el-menu-item>

        <el-sub-menu v-if="isDeveloper" index="/developer">
            <template #title>
                <el-icon><Lightning /></el-icon>
                <span>开发者中心</span>
            </template>

            <el-menu-item index="/developer-task">任务管理</el-menu-item>
            <el-menu-item index="/developer-help">帮助管理</el-menu-item>
        </el-sub-menu>

    </el-menu>
</template>
<script setup>
import router from '../config/router'
import { ref } from 'vue'

const currentPath = ref('/review-task');

currentPath.value = router.currentRoute.value.path;

function nativation(path) {
    if (path !== router.currentRoute.value.path)
        router.push(path);
}

</script>

<style scoped>
.main-layout {width: 100%; height: 100%;}
.main-container {height: 100%;}
</style>

<template>
    <div class="main-layout">
        <el-container class="main-container">
            <el-header>
                <el-menu
                    :default-active="currentPath"
                    mode="horizontal"
                    @select="nativation"
                >
                    <el-menu-item index="/review-task">任务审核</el-menu-item>

                    <el-menu-item index="/review-help">帮助文章审核</el-menu-item>

                </el-menu>

            </el-header>

            <el-main>
                <router-view />
            </el-main>

        </el-container>
    </div>
</template>
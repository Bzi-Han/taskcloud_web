<script setup>
import { ref } from 'vue';
import Navigate from '../components/Navigate.vue'

const drawer = ref(false);
</script>

<style scoped>
.main-layout {width: 100%; height: 100%;}
.main-container {height: 100%;}
.main-header {display: flex; flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 1px solid #4c4d4f;}
.main-navigate {height: 100%; width: 200px;}
</style>

<template>
    <div class="main-layout">
        <el-drawer :with-header="false" v-model="drawer" direction="ltr" size="70%">
            <Navigate />
        </el-drawer>

        <el-container class="main-container">
            <el-header class="hidden-md-and-up main-header">
                <el-button style="font-size: 18px;" link @click="drawer = true">
                    <el-icon><Menu /></el-icon>
                    <span>Menu</span>
                </el-button>
            </el-header>

            <el-container>
                <el-aside class="hidden-sm-and-down main-navigate">
                    <Navigate />
                </el-aside>

                <el-main>
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>
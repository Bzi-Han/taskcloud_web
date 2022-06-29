<script setup>
import network from '../../config/network'
import { ref } from 'vue'

const loading = ref(false);
const taskLog = ref();

loading.value = true;
network.get('/taskLog/output/7').then(result => {
    taskLog.value.append(result.data);
}).catch(() => {}).finally(() => {
    loading.value = false;
});

</script>

<style scoped>
.console {
    width: 100%;
    color: rgb(199, 218, 179);
    background-color: rgb(30, 30, 30);
    min-height: 480px;
    outline: none;
    resize: none;
    border: 1px solid #909399;
}
</style>

<template>
    <el-card v-loading.fullscreen.lock="loading" header="任务日志" class="card-align">
        <textarea ref="taskLog" class="console" readonly="readonly"></textarea>
    </el-card>
</template>
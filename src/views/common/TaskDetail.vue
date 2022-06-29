<script setup>
import network from '../../config/network'
import { TaskState, TaskStateTagType } from '../../config/types'
import { ref } from 'vue'

const loading = ref(false);
const logData = ref([]);

loading.value = true;
network.get('/taskLog/items/31').then(result => {
    logData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

</script>

<template>
    <el-card v-loading.fullscreen.lock="loading" header="近31天的任务处理情况" class="card-align">
        <el-table :data="logData" row-key="id">
            <el-table-column
                column-key="executeOnTime"
                prop="executeOnTime"
                label="执行时间"
                sortable
            />

            <el-table-column prop="packageName" label="任务包名称" />
            
            <el-table-column prop="taskName" label="任务名称" />
            
            <el-table-column prop="taskVersion" label="任务版本" />
            
            <el-table-column prop="functions" label="执行方法" />
            
            <el-table-column
                :filters="[
                    { text: '等待中', value: 0 },
                    { text: '已投递', value: 1 },
                    { text: '任务成功', value: 5 },
                    { text: '任务失败', value: 6 },
                ]"
                :filter-method="(value, row) => row.state === value"
                prop="state"
                label="状态"
                filter-placement="bottom-end"
            >
                <template #default="scope">
                    <el-tag :type="TaskStateTagType[scope.row.state]">
                        {{ TaskState[scope.row.state] }}
                    </el-tag>
                </template>
            </el-table-column>
            
            <el-table-column prop="fromWhere" label="投递来源" />
        </el-table>
    </el-card>
</template>
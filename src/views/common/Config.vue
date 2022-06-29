<script setup>
import network from '../../config/network'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false);
const configData = ref({
    records: [],
    current: 1,
    pages: 0,
    size: 10,
    total: 0,
});

loading.value = true;
network.get(`/config/items/${configData.value.current}`).then(result => {
    configData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleSaveConfig(config) {
    loading.value = true;
    network.put('/config/update', config).then(result => {
        ElMessage({
            message: result.message,
            type: 'success',
        });
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleConfigPageChange() {
    loading.value = true;
    network.get(`/config/items/${configData.value.current}`).then(result => {
        configData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

</script>

<template>
    <el-table v-loading.fullscreen.lock="loading" :data="configData.records" row-key="id" style="margin-bottom: 20px;">
        <el-table-column prop="domain" label="主域名" />
        
        <el-table-column prop="passport" label="通行证">
            <template #default="scope">
                <el-input
                    v-model="scope.row.passport"
                    placeholder="请设置对应的通行证"
                    clearable
                />
            </template>
        </el-table-column>

        <el-table-column align="right" label="操作">
            <template #default="scope">
                <el-button size="small" type="primary" @click="handleSaveConfig(scope.row)">保存</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="configData.current"
        :page-size="configData.size"
        :total="configData.total"
        :disabled="1 >= configData.pages"
        class="hidden-xs-only"
        layout="prev, pager, next, jumper"
        background
        @current-change="handleConfigPageChange"
    />
    <el-pagination
        v-model:current-page="configData.current"
        :page-size="configData.size"
        :total="configData.total"
        :disabled="1 >= configData.pages"
        class="hidden-sm-and-up"
        layout="prev, pager, next, jumper"
        small
        @current-change="handleConfigPageChange"
    />
</template>
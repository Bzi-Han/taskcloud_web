<script setup>
import network from '../../config/network'
import { LuaTemplate, JavaScriptTemplate, PythonTemplate } from '../../config/template'
import { TaskType, TaskTypeTagType, TaskState, TaskStateTagType } from '../../config/types'
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MonacoEditor from '../../components/MonacoEditor.vue'

const loading = ref(false);
const keyword = ref('');
const currentPageData = ref({
    records: [],
    current: 1,
    pages: 0,
    size: 10,
    total: 0,
});
const isCreateTask = ref(false);
const showDetail = ref(false);
const showDetailFormRef = ref();
const showDetailData = ref({
    id: 0,
    name: '',
    description: '',
    warning: '',
    interfaces: '',
    domain: '',
    author: '',
    authorId: 0,
    type: 0,
    version: '',
    rating: 0,
    script: '',
    state: 0,
    stateMessage: '',
});
const commonRules = reactive({
    name: [
        { required: true, message: '请输入任务名称', trigger: 'blur' },
        { min: 1, max: 256, message: '任务名称长度在 1 到 256 个字符', trigger: 'blur' },
    ],
    description: [
        { required: true, message: '请输入任务描述', trigger: 'blur' },
        { min: 1, max: 1024, message: '任务描述长度在 1 到 1024 个字符', trigger: 'blur' },
    ],
    warning: [
        { required: true, message: '请输入警告信息', trigger: 'blur' },
        { min: 1, max: 256, message: '警告信息长度在 1 到 256 个字符', trigger: 'blur' },
    ],
    type: [
        { required: true, message: '请选择任务类型', trigger: 'blur' },
    ],
    version: [
        { max: 16, message: '任务版本长度在 0 到 16 个字符', trigger: 'blur' },
    ],
    script: [
        { required: true, message: '请输入任务脚本', trigger: 'blur' },
    ],
});

loading.value = true;
network.get('/task/devitems/' + currentPageData.value.current).then(result => {
    currentPageData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleDevTaskSearch() {
    if ('' === keyword.value) {
        currentPageData.value.current = 1;
        handleDevTaskPageChange();

        return;
    }

    loading.value = true;
    network.get(`/task/devsearch/${keyword.value}/${currentPageData.value.current}`).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleDevTaskPageChange() {
    if ('' !== keyword.value) {
        handleDevTaskSearch();

        return;
    }

    loading.value = true;
    network.get('/task/devitems/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleShowDetail(devTask) {
    isCreateTask.value = false;
    showDetailData.value = devTask;
    showDetail.value = true;
}

function handleCreateNewTask() {
    isCreateTask.value = true;
    showDetailData.value = {
        name: '',
        description: '',
        warning: '',
        type: 0,
        version: '',
        script: '',
    };
    showDetail.value = true;
}

function handleUpdateCommit() {
    showDetailFormRef.value.validate(valid => {
        if (!valid)
            return;
        if ('' === showDetailData.value.script) {
            ElMessage({
                message: '请输入任务脚本',
                type: 'error',
            });

            return;
        }

        // 判断是否为发布新任务
        if (isCreateTask.value) {

            // 发布新任务
            ElMessageBox.confirm(
                '是否确定发布新任务？',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info',
                }
            ).then(() => {
                
                loading.value = true;
                network.post('/task/publish', showDetailData.value).then(result => {
                    ElMessage({
                        message: '发布成功',
                        type: 'success',
                    });

                    currentPageData.value.total = currentPageData.value.records.unshift(result.data);
                }).catch(() => {}).finally(() => {
                    loading.value = false;
                });
                
            }).catch(() => {});

        } else {

            // 更新任务信息
            loading.value = true;
            network.put('/task/update', showDetailData.value).then(result => {
                ElMessage({
                    message: result.message,
                    type: 'success',
                });

                currentPageData.value.records.forEach((item, index) => {
                    if (item.id === showDetailData.value.id) {
                        currentPageData.value.records[index] = result.data;
                    }
                });
            }).catch(() => {}).finally(() => {
                loading.value = false;
            });

        }

    }).catch(() => {});
}

function handleCreateTemplate() {
    ElMessageBox.confirm(
        '是否确定更新编辑器内容？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        const type = showDetailData.value.type;
        const template = 0 === type ? LuaTemplate : 1 === type ? JavaScriptTemplate : PythonTemplate;

        showDetailData.value.script = template;
    }).catch(() => {});
}

</script>

<style scoped>
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;  
}
.task-brief {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.task-brief dt {margin-top: 6px;}
.fab-add {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 1px 1px 10px 2px rgba(255, 255, 255, 0.2);
  position: fixed;
  bottom: 20px;
  right: 20px;
  line-height: 50px;
  text-align: center;
  cursor: pointer;
  transition: all ease-in-out 0.2s;
}
.fab-add:hover {
  box-shadow: 1px 1px 10px 4px rgba(255, 255, 255, 0.2);
}
</style>

<template>
    <el-space v-if="!showDetail" v-loading.fullscreen.lock="loading" size="large" style="width: 100%;" wrap fill>
        <el-input
            v-model="keyword"
            placeholder="请输入关键词: 任务名称或创建者昵称进行搜索"
            size="large"
        >
            <template #append>
                <el-button @click="handleDevTaskSearch">
                    <el-icon><Search /></el-icon>
                </el-button>
            </template>
        </el-input>

        <el-card :key="index" v-for="(item, index) in currentPageData.records" style="min-width: 400px;">
            <div class="task-brief">
                <dl>
                    <dt>
                        {{ item.name }}
                        <el-tag :type="TaskTypeTagType[item.type]">{{ TaskType[item.type] }}</el-tag>
                        <el-tag type="info" style="margin-left: 5px;">{{ item.version }}</el-tag>
                        <el-tooltip
                            :content="item.stateMessage"
                            placement="top-start"
                        >
                            <el-tag :type="TaskStateTagType[item.state]" style="margin-left: 5px;">{{ TaskState[item.state] }}</el-tag>
                        </el-tooltip>
                    </dt>
                    <dd>
                        <el-rate
                            v-model="item.rating"
                            score-template="综合评分 {value}"
                            disabled
                            show-score
                        />
                    </dd>
                </dl>
                <el-button type="primary" link @click="handleShowDetail(item)">编辑</el-button> 
            </div>
        </el-card>

        <el-pagination
            v-model:current-page="currentPageData.current"
            :page-size="currentPageData.size"
            :total="currentPageData.total"
            :disabled="1 >= currentPageData.pages"
            class="hidden-xs-only"
            layout="prev, pager, next, jumper"
            background
            @current-change="handleDevTaskPageChange"
        />
        <el-pagination
            v-model:current-page="currentPageData.current"
            :page-size="currentPageData.size"
            :total="currentPageData.total"
            :disabled="1 >= currentPageData.pages"
            class="hidden-sm-and-up"
            layout="prev, pager, next, jumper"
            small
            @current-change="handleDevTaskPageChange"
        />
    </el-space>

    <el-space v-if="showDetail" size="large" style="width: 100%;" wrap fill>
        <el-button @click="showDetail = false">返回</el-button>

        <el-card>
            <template #header>
                <div class="task-header">
                    <span>基础信息</span>
                    <el-button type="primary" link @click="handleUpdateCommit">{{ isCreateTask ? '发布' : '保存' }}</el-button>
                </div>
            </template>

            <el-form
                ref="showDetailFormRef"
                :model="showDetailData"
                :rules="commonRules"
                label-width="80px"
            >
                <el-form-item label="任务名称" prop="name">
                    <el-input v-model="showDetailData.name" size="large" />
                </el-form-item>

                <el-form-item label="任务版本" prop="version">
                    <el-input v-model="showDetailData.version" size="large" />
                </el-form-item>

                <el-form-item label="任务描述" prop="description">
                    <el-input v-model="showDetailData.description" size="large" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }" />
                </el-form-item>

                <el-form-item label="任务警告" prop="warning">
                    <el-input v-model="showDetailData.warning" size="large" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }" />
                </el-form-item>

                <el-form-item label="任务类型" prop="type">
                    <el-select
                        v-model="showDetailData.type"
                        placeholder="请选择任务类型"
                    >
                        <el-option
                            :key="index"
                            v-for="(item, index) in TaskType"
                            :label="item"
                            :value="index"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card>
            <template #header>
                <div class="task-header">
                    <span>脚本</span>
                    <el-button type="primary" link @click="handleCreateTemplate">创建模板</el-button>
                </div>
            </template>

            <MonacoEditor
                :value="showDetailData.script"
                :language="TaskType[showDetailData.type].toLowerCase()"
                style="width: 100%; height: 700px;"
                @update:value="showDetailData.script = $event"
            />

        </el-card>

    </el-space>

    <div class="fab-add" @click="handleCreateNewTask">
        <el-icon><Plus /></el-icon>
    </div>

    <el-backtop :right="75" :bottom="65" />
</template>
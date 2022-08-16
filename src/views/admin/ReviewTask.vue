<script setup>
import network from '../../config/network'
import { LuaTemplate, JavaScriptTemplate, PythonTemplate } from '../../config/template'
import { TaskType, TaskTypeTagType, TaskState, TaskStateTagType } from '../../config/types'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
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
const showImportTasksDialog = ref(false);
const showImportTasksFormRef = ref();
const showImportTasksData = ref({
    repository: '',
    review: true,
});
const importTasksFromWhere = ref('fromRepository');
const uploadTasksRef = ref();
const uploadTasksNeedReview = ref(true);
const commonRules = reactive({
    stateMessage: [
        { max: 512, message: '任务状态信息长度在 0 到 512 个字符', trigger: 'blur' },
    ],
    repository: [
        { required: true, message: '仓库地址不能为空', trigger: 'blur' },
    ],
});

loading.value = true;
network.get('/task/items/' + currentPageData.value.current).then(result => {
    currentPageData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleReviewTaskSearch() {
    if ('' === keyword.value) {
        currentPageData.value.current = 1;
        handleReviewTaskPageChange();

        return;
    }

    loading.value = true;
    network.get(`/task/search/${keyword.value}/${currentPageData.value.current}`).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleReviewTaskPageChange() {
    if ('' !== keyword.value) {
        handleReviewTaskSearch();

        return;
    }

    loading.value = true;
    network.get('/task/items/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleShowDetail(Task) {
    showDetailData.value = Task;
    showDetail.value = true;
}

function handleReviewAccept() {
    showDetailFormRef.value.validate(valid => {
        if (!valid)
            return;

        // 审核通过任务信息
        loading.value = true;
        showDetailData.value.state = 3;
        network.put('/task/review', showDetailData.value).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            currentPageData.value.records = currentPageData.value.records.filter(item => item.id !== showDetailData.value.id);
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

function handleReviewReject() {
    showDetailFormRef.value.validate(valid => {
        if (!valid)
            return;

        // 审核拒绝任务信息
        loading.value = true;
        showDetailData.value.state = 4;
        network.put('/task/review', showDetailData.value).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            currentPageData.value.records = currentPageData.value.records.filter(item => item.id !== showDetailData.value.id);
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

function handleImportTasks() {
    if ('fromRepository' === importTasksFromWhere.value) {
        
        showImportTasksFormRef.value.validate(valid => {
            if (!valid)
                return;

            // 导入公开的任务仓库
            loading.value = true;
            network.post('/task/import', showImportTasksData.value).then(result => {
                ElMessage({
                    message: result.message,
                    type: 'success',
                });

                currentPageData.value.records = result.data.concat(currentPageData.value.records);
                currentPageData.value.total += result.data.length;
                showImportTasksDialog.value = false;
            }).catch(() => {}).finally(() => {
                loading.value = false;
            });

        }).catch(() => {});
        
    } else {

        // 上传文件
        uploadTasksRef.value.submit();
        
    }
}

function handleUploadTasksBeforeUpload() {
    loading.value = true;
}

function handleUploadTasksSuccess(response) {
    currentPageData.value.records = response.data.concat(currentPageData.value.records);
    currentPageData.value.total += response.data.length;
    loading.value = false;
    
    ElMessage({
        message: response.message,
        type: 'success',
    });
}

function handleUploadTasksError(error) {
    loading.value = false;

    if (-1 !== error.message.indexOf('"code"')) {
        const result = JSON.parse(error.message);

        ElMessage({
            message: result.message,
            type: 'error',
        });
    } else {
        ElMessage({
            message: error.message,
            type: 'error',
        });
    }

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
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.1);
  position: fixed;
  bottom: 20px;
  right: 20px;
  line-height: 68px;
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
                <el-button @click="handleReviewTaskSearch">
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
                <el-button type="primary" link @click="handleShowDetail(item)">详情</el-button> 
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
            @current-change="handleReviewTaskPageChange"
        />
        <el-pagination
            v-model:current-page="currentPageData.current"
            :page-size="currentPageData.size"
            :total="currentPageData.total"
            :disabled="1 >= currentPageData.pages"
            class="hidden-sm-and-up"
            layout="prev, pager, next, jumper"
            small
            @current-change="handleReviewTaskPageChange"
        />
    </el-space>

    <el-space v-if="showDetail" size="large" style="width: 100%;" wrap fill>
        <el-button @click="showDetail = false">返回</el-button>

        <el-card>
            <template #header>
                <div class="task-header">
                    <span>基础信息</span>
                    <div>
                        <el-button type="success" link @click="handleReviewAccept">接受</el-button>
                        <el-button type="danger" link @click="handleReviewReject">驳回</el-button>
                    </div>
                </div>
            </template>

            <el-form
                ref="showDetailFormRef"
                :model="showDetailData"
                :rules="commonRules"
                label-width="80px"
            >
                <el-form-item label="审核信息" prop="stateMessage">
                    <el-input v-model="showDetailData.stateMessage" size="large" />
                </el-form-item>

                <el-form-item label="任务名称" prop="name">
                    <el-input v-model="showDetailData.name" size="large" readonly disabled />
                </el-form-item>

                <el-form-item label="任务版本" prop="version">
                    <el-input v-model="showDetailData.version" size="large" readonly disabled />
                </el-form-item>

                <el-form-item label="任务描述" prop="description">
                    <el-input v-model="showDetailData.description" size="large" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }" readonly disabled />
                </el-form-item>

                <el-form-item label="任务警告" prop="warning">
                    <el-input v-model="showDetailData.warning" size="large" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }" readonly disabled />
                </el-form-item>

                <el-form-item label="任务类型" prop="type">
                    <el-select
                        v-model="showDetailData.type"
                        placeholder="请选择任务类型"
                        readonly
                        disabled
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

        <el-card header="脚本">
            <MonacoEditor
                :value="showDetailData.script"
                :language="TaskType[showDetailData.type].toLowerCase()"
                :readonly="true"
                style="width: 100%; height: 700px;"
                @update:value="showDetailData.script = $event"
            />

        </el-card>

    </el-space>

    <el-dialog v-model="showImportTasksDialog" title="导入脚本仓库">
        <el-tabs v-model="importTasksFromWhere">
            <el-tab-pane label="开源仓库" name="fromRepository">
                <el-form
                    ref="showImportTasksFormRef"
                    :model="showImportTasksData"
                    :rules="commonRules"
                    label-width="120px"
                >
                    <el-form-item label="脚本仓库地址" prop="repository">
                        <el-input v-model="showImportTasksData.repository" size="large" />
                    </el-form-item>

                    <el-form-item label="是否进行审核" prop="review">
                        <el-switch v-model="showImportTasksData.review" size="large" />
                    </el-form-item>
                </el-form>

            </el-tab-pane>

            <el-tab-pane label="上传压缩包" name="fromUpload">
                <span>
                    是否进行审核：<el-switch v-model="uploadTasksNeedReview" size="large" />
                </span>

                <el-upload
                    ref="uploadTasksRef"
                    :action="`${network.config.baseUrl}/task/import/upload/${uploadTasksNeedReview}`"
                    :auto-upload="false"
                    :headers="{ 'Authorization': network.config.jwtToken }"
                    :limit="1"
                    :before-upload="handleUploadTasksBeforeUpload"
                    :on-success="handleUploadTasksSuccess"
                    :on-error="handleUploadTasksError"
                    drag
                >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>

                    <template #tip>
                        <div class="el-upload__tip">
                            只能上传zip文件，且不能超过10MB
                        </div>
                    </template>

                </el-upload>
                
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div>
                <el-button @click="showImportTasksDialog = false">取消</el-button>
                <el-button type="primary" @click="handleImportTasks">导入</el-button>
            </div>
        </template>

    </el-dialog>

    <div class="fab-add" @click="showImportTasksDialog = true">
        <el-icon :size="26"><UploadFilled /></el-icon>
    </div>

    <el-backtop :right="75" :bottom="65" />
</template>
<script setup>
import network from '../../config/network'
import { TaskType, TaskTypeTagType, TaskState, TaskStateTagType } from '../../config/types'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false);
const keyword = ref('');
const currentPageData = ref({
    records: [],
    current: 1,
    pages: 0,
    size: 10,
    total: 0,
});
const expand = reactive(['1', '2', '3']);
const showDetail = ref(false);
const showDetailData = ref({
    domain: '',
    author: '',
    authorId: 0,
    description: '',
    id: 0,
    interfaces: '',
    name: '',
    rating: 0,
    type: 0,
    version: '',
    warning: '',
    comments: {
        records: [],
        current: 1,
        pages: 0,
        size: 10,
        total: 0,
    },
});
const commentFormRef = ref();
const commentForm = reactive({
  comment: '',
  rating: 0,
  taskId: 0
});
const appendToPackageDialog = ref(false);
const appendToPackageFormRef = ref();
const appendToPackageForm = reactive({
  taskId: 0,
  packageId: 0,
});
const commonRules = reactive({
    comment: [
        { required: true, message: '请输入评论内容', trigger: 'blur' },
    ],
    taskId: [
        { required: true, message: '请选择任务', trigger: 'change' },
    ],
    packageId: [
        { required: true, message: '请选择任务包', trigger: 'change' },
    ],
});
const availablePackages = ref([]);

loading.value = true;
network.get('/task/items/' + currentPageData.value.current).then(result => {
    currentPageData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleTaskSearch() {
    if ('' === keyword.value) {
        currentPageData.value.current = 1;
        handleTaskPageChange();

        return;
    }

    loading.value = true;
    network.get(`/task/search/${keyword.value}/${currentPageData.value.current}`).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleTaskPageChange() {
    if ('' !== keyword.value) {
        handleTaskSearch();

        return;
    }

    loading.value = true;
    network.get('/task/items/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleAuthorDetail(authorId) {
    window.open(`/user-info/${authorId}`, '_blank');
}

function handleShowDetail(task) {
    loading.value = true;
    network.get(`/taskComment/items/${task.id}/${showDetailData.value.comments.current}`).then(result => {
        showDetailData.value = task;
        showDetailData.value.comments = result.data;
        showDetail.value = true;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleSendComment() {
    commentFormRef.value.validate(result => {
        if (!result)
            return;

        loading.value = true;
        commentForm.taskId = showDetailData.value.id;
        network.post('/taskComment/send', commentForm).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            showDetailData.value.comments.total = showDetailData.value.comments.records.unshift(result.data);
            commentForm.comment = '';
            commentForm.rating = 0;
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

function handleCommentPageChange() {
    loading.value = true;
    network.get(`/taskComment/items/${showDetailData.value.id}/${showDetailData.value.comments.current}`).then(result => {
        showDetailData.value.comments = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleAppendToPackageOpenDialog(task) {
    loading.value = true;
    network.get('/package/available').then(result => {
        availablePackages.value = result.data;
        appendToPackageForm.taskId = task.id;
        appendToPackageForm.packageId = null;
        appendToPackageDialog.value = true;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleAppendToPackage() {
    appendToPackageFormRef.value.validate(result => {
        if (!result)
            return;

        loading.value = true;
        network.post('/package/append', appendToPackageForm).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            appendToPackageDialog.value = false;
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

</script>

<style scoped>
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-header dd {font-size: 14px;}
</style>

<template>
    <el-space v-if="!showDetail" v-loading.fullscreen.lock="loading" size="large" style="width: 100%;" wrap fill>
        <el-input
            v-model="keyword"
            placeholder="请输入关键词: 任务名称或创建者昵称进行搜索"
            size="large"
        >
            <template #append>
                <el-button @click="handleTaskSearch">
                    <el-icon><Search /></el-icon>
                </el-button>
            </template>
        </el-input>

        <el-card :key="index" v-for="(item, index) in currentPageData.records" style="min-width: 400px;">
            <template #header>
                <div class="task-header">
                    <dl>
                        <dt>
                            {{ item.name }}
                            <el-tag :type="TaskTypeTagType[item.type]">{{ TaskType[item.type] }}</el-tag>
                            <el-tag type="info" style="margin-left: 5px;">{{ item.version }}</el-tag>
                        </dt>
                        <dd><el-link type="info" @click="handleAuthorDetail(item.authorId)">创建者: {{ item.author }}</el-link></dd>
                    </dl>
                    <div>
                        <el-rate
                            v-model="item.rating"
                            score-template="综合评分 {value}"
                            disabled
                            show-score
                        />
                    </div>
                </div>
            </template>

            <div v-if="'' !== item.warning" style="color: #E6A23C; font-size: 14px; margin-bottom:20px;">注意事项：{{ item.warning }}</div>

            <el-collapse v-model="expand" style="margin-bottom: 20px;">
                <el-collapse-item name="1" title="任务摘要">
                    <div style="padding:0 10px;">
                        {{ item.description }}
                    </div>
                </el-collapse-item>

                <el-collapse-item title="任务方法" name="2">
                    <ul style="list-style: inside; margin-left: 12px;">
                        <li :key="index" v-for="(method, index) in item.interfaces.split(',')">
                            {{ method }}
                        </li>
                    </ul>
                </el-collapse-item>

            </el-collapse>

            <div style="display: flex; justify-content: space-between; align-content: center;">
                <el-button type="info" link @click="handleShowDetail(item)">详细信息</el-button>
                <el-button type="primary" link @click="handleAppendToPackageOpenDialog(item)">添加到包</el-button>
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
            @current-change="handleTaskPageChange"
        />
        <el-pagination
            v-model:current-page="currentPageData.current"
            :page-size="currentPageData.size"
            :total="currentPageData.total"
            :disabled="1 >= currentPageData.pages"
            class="hidden-sm-and-up"
            layout="prev, pager, next, jumper"
            small
            @current-change="handleTaskPageChange"
        />
    </el-space>

    <el-space v-if="showDetail" size="large" style="width: 100%;" wrap fill>
        <el-button @click="showDetail = false">返回</el-button>

        <el-card>
            <template #header>
                <div class="task-header">
                    <dl>
                        <dt>
                            {{ showDetailData.name }}
                            <el-tag :type="TaskTypeTagType[showDetailData.type]">{{ TaskType[showDetailData.type] }}</el-tag>
                            <el-tag type="info" style="margin-left: 5px;">{{ showDetailData.version }}</el-tag>
                        </dt>
                        <dd><el-link type="info" @click="handleAuthorDetail(showDetailData.authorId)">创建者: {{ showDetailData.author }}</el-link></dd>
                    </dl>
                    <div>
                        <el-rate
                            v-model="showDetailData.rating"
                            score-template="综合评分 {value}"
                            disabled
                            show-score
                        />
                    </div>
                </div>
            </template>

            <div v-if="'' !== showDetailData.warning" style="color: #E6A23C; font-size: 14px; margin-bottom:20px;">注意事项：{{ showDetailData.warning }}</div>

            <el-collapse v-model="expand" style="margin-bottom: 20px;">
                <el-collapse-item name="1" title="任务配置主域名">
                    <div style="padding:0 10px;">
                        <el-link :href="`https://${showDetailData.domain}`" target="_blank">{{ showDetailData.domain }}</el-link>
                    </div>
                </el-collapse-item>

                <el-collapse-item name="2" title="任务摘要">
                    <div style="padding:0 10px;">
                        {{ showDetailData.description }}
                    </div>
                </el-collapse-item>

                <el-collapse-item title="任务方法" name="3">
                    <ul style="list-style: inside; margin-left: 12px;">
                        <li :key="index" v-for="(method, index) in showDetailData.interfaces.split(',')">
                            {{ method }}
                        </li>
                    </ul>
                </el-collapse-item>

            </el-collapse>

            <div style="display: flex; justify-content: space-between; align-content: center;">
                <el-button type="primary" link @click="handleAppendToPackageOpenDialog(showDetailData)">添加到包</el-button>
            </div>
        </el-card>

        <el-card>
            <div style="margin-bottom: 30px;">
                <el-form
                    ref="commentFormRef"
                    :model="commentForm"
                    :rules="commonRules"
                    label-width="80px"
                >
                    <el-form-item label="评分">
                        <el-rate
                            v-model="commentForm.rating"
                            style="line-height:0;"
                        />
                    </el-form-item>

                    <el-form-item label="评论内容" prop="comment">
                        <el-input
                            v-model="commentForm.comment"
                            type="textarea"
                        />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="handleSendComment">提交评论</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-timeline>
                <el-timeline-item
                    :key="comment.authorId"
                    :timestamp="comment.publishTime"
                    v-for="comment in showDetailData.comments.records"
                    placement="top"
                >
                    <el-card>
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-content: center;">
                                <el-link type="primary" style="font-size: 18px;" @click="handleAuthorDetail(comment.authorId)">{{ comment.author }}</el-link>
                                <el-rate
                                    :show-score="false"
                                    v-model="comment.rating"
                                    disabled
                                />
                            </div>
                        </template>

                        <p>{{ comment.comment }}</p>
                    </el-card>
                </el-timeline-item>
            </el-timeline>

            <el-pagination
                v-model:current-page="showDetailData.comments.current"
                :page-size="showDetailData.comments.size"
                :total="showDetailData.comments.total"
                :disabled="1 >= showDetailData.comments.pages"
                class="hidden-xs-only"
                layout="prev, pager, next, jumper"
                background
                @current-change="handleCommentPageChange"
            />
            <el-pagination
                v-model:current-page="showDetailData.comments.current"
                :page-size="showDetailData.comments.size"
                :total="showDetailData.comments.total"
                :disabled="1 >= showDetailData.comments.pages"
                class="hidden-sm-and-up"
                layout="prev, pager, next, jumper"
                small
                @current-change="handleCommentPageChange"
            />

        </el-card>

    </el-space>

    <el-backtop :right="75" :bottom="65" />

    <el-dialog v-model="appendToPackageDialog" title="添加任务" width="70%">
        <el-form
            ref="appendToPackageFormRef"
            :model="appendToPackageForm"
            :rules="commonRules"
        >
            <el-form-item label="目标任务包" label-width="100px" prop="packageId">
                <el-select
                    v-model="appendToPackageForm.packageId"
                    placeholder="请选择要添加到的包"
                >
                    <el-option
                        :key="item.id"
                        v-for="item in availablePackages"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <div style="margin-top: 40px; display:flex; justify-content: flex-end;">
            <el-button @click="appendToPackageDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleAppendToPackage">确 定</el-button>
        </div>
    </el-dialog>
</template>
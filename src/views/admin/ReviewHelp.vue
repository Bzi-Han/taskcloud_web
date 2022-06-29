<script setup>
import network from '../../config/network'
import { HelpState, HelpStateTagType } from '../../config/types'
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
const showDetail = ref(false);
const showDetailFormRef = ref();
const showDetailData = ref({
    id: 0,
    title: '',
    author: '',
    authorId: 0,
    content: '',
    publishTime: '',
    state: 0,
    stateMessage: '',
});
const commonRules = reactive({
    stateMessage: [
        { max: 512, message: '任务状态信息长度在 0 到 512 个字符', trigger: 'blur' },
    ],
});

loading.value = true;
network.get('/help/items/' + currentPageData.value.current).then(result => {
    currentPageData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleReviewHelpSearch() {
    if ('' === keyword.value) {
        currentPageData.value.current = 1;
        handleReviewHelpPageChange();

        return;
    }

    loading.value = true;
    network.get(`/help/search/${keyword.value}/${currentPageData.value.current}`).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleReviewHelpPageChange() {
    if ('' !== keyword.value) {
        handleReviewHelpSearch();

        return;
    }

    loading.value = true;
    network.get('/help/items/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleShowDetail(Help) {
    showDetailData.value = Help;
    showDetail.value = true;
}

function handleReviewAccept() {
    showDetailFormRef.value.validate(valid => {
        if (!valid)
            return;

        // 审核通过帮助文章信息
        loading.value = true;
        showDetailData.value.state = 1;
        network.put('/help/review', showDetailData.value).then(result => {
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

        // 审核拒绝帮助文章信息
        loading.value = true;
        showDetailData.value.state = 2;
        network.put('/help/review', showDetailData.value).then(result => {
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

</script>

<style scoped>
.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;  
}
.help-brief {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.help-brief div {
  font-size:16px;
  margin-right: 5px;
  text-overflow:ellipsis;
  overflow:hidden;
  white-space:nowrap;
}
</style>

<template>
    <el-space v-if="!showDetail" v-loading.fullscreen.lock="loading" size="large" style="width: 100%;" wrap fill>
        <el-input
            v-model="keyword"
            placeholder="请输入关键词: 帮助文章标题或创建者昵称进行搜索"
            size="large"
        >
            <template #append>
                <el-button @click="handleReviewHelpSearch">
                    <el-icon><Search /></el-icon>
                </el-button>
            </template>
        </el-input>

        <el-card :key="index" v-for="(item, index) in currentPageData.records" style="min-width: 400px;">
            <div class="help-brief">
                <div>
                    <el-tooltip
                        :content="item.stateMessage"
                        placement="top-start"
                    >
                        <el-tag :type="HelpStateTagType[item.state]" style="margin-left: 5px;">{{ HelpState[item.state] }}</el-tag>
                    </el-tooltip>
                    {{ item.title }}
                </div>
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
            @current-change="handleReviewHelpPageChange"
        />
        <el-pagination
            v-model:current-page="currentPageData.current"
            :page-size="currentPageData.size"
            :total="currentPageData.total"
            :disabled="1 >= currentPageData.pages"
            class="hidden-sm-and-up"
            layout="prev, pager, next, jumper"
            small
            @current-change="handleReviewHelpPageChange"
        />
    </el-space>

    <el-space v-if="showDetail" size="large" style="width: 100%;" wrap fill>
        <el-button @click="showDetail = false">返回</el-button>

        <el-card>
            <template #header>
                <div class="help-header">
                    <span>文章审核</span>
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
                label-position="top"
                label-width="140px"
            >
                <el-form-item label="审核信息" prop="stateMessage">
                    <el-input v-model="showDetailData.stateMessage" size="large" />
                </el-form-item>

                <el-form-item label="帮助文章标题" prop="title">
                    <el-input v-model="showDetailData.title" size="large" readonly disabled />
                </el-form-item>

                <el-form-item label="内容" prop="content">
                    <div style="width: 100%;">
                        <quill-editor v-model:content="showDetailData.content" :readOnly="true" contentType="text" style="min-height: 700px; width: 100%;" />
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
    </el-space>

    <el-backtop :right="75" :bottom="65" />
</template>
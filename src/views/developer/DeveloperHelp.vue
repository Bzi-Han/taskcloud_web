<script setup>
import network from '../../config/network'
import { HelpState, HelpStateTagType } from '../../config/types'
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false);
const keyword = ref('');
const currentPageData = ref({
    records: [],
    current: 1,
    pages: 0,
    size: 10,
    total: 0,
});
const isCreateHelp = ref(false);
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
    title: [
        { required: true, message: '请输入帮助文章标题', trigger: 'blur' },
        { min: 1, max: 256, message: '帮助文章标题长度在 1 到 256 个字符', trigger: 'blur' },
    ],
    content: [
        { required: true, message: '请输入帮助文章内容', trigger: 'blur' },
    ],
});

loading.value = true;
network.get('/help/devitems/' + currentPageData.value.current).then(result => {
    currentPageData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleDevHelpSearch() {
    if ('' === keyword.value) {
        currentPageData.value.current = 1;
        handleDevHelpPageChange();

        return;
    }

    loading.value = true;
    network.get(`/help/devsearch/${keyword.value}/${currentPageData.value.current}`).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleDevHelpPageChange() {
    if ('' !== keyword.value) {
        handleDevHelpSearch();

        return;
    }

    loading.value = true;
    network.get('/help/devitems/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleShowDetail(devHelp) {
    isCreateHelp.value = false;
    showDetailData.value = devHelp;
    showDetail.value = true;
}

function handleCreateNewHelp() {
    isCreateHelp.value = true;
    showDetailData.value = {
        title: '',
        content: '',
    };
    showDetail.value = true;
}

function handleUpdateCommit() {
    showDetailFormRef.value.validate(valid => {
        if (!valid)
            return;

        // 判断是否为发布新帮助文章
        if (isCreateHelp.value) {

            // 发布新帮助文章
            ElMessageBox.confirm(
                '是否确定发布新帮助文章？',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info',
                }
            ).then(() => {
                
                loading.value = true;
                network.post('/help/publish', showDetailData.value).then(result => {
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

            // 更新帮助文章信息
            loading.value = true;
            network.put('/help/update', showDetailData.value).then(result => {
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
            placeholder="请输入关键词: 帮助文章标题或创建者昵称进行搜索"
            size="large"
        >
            <template #append>
                <el-button @click="handleDevHelpSearch">
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
            @current-change="handleDevHelpPageChange"
        />
        <el-pagination
            v-model:current-page="currentPageData.current"
            :page-size="currentPageData.size"
            :total="currentPageData.total"
            :disabled="1 >= currentPageData.pages"
            class="hidden-sm-and-up"
            layout="prev, pager, next, jumper"
            small
            @current-change="handleDevHelpPageChange"
        />
    </el-space>

    <el-space v-if="showDetail" size="large" style="width: 100%;" wrap fill>
        <el-button @click="showDetail = false">返回</el-button>

        <el-card>
            <template #header>
                <div class="help-header">
                    <span>{{ isCreateHelp ? '文章发布' : '文章编辑' }}</span>
                    <el-button type="primary" link @click="handleUpdateCommit">{{ isCreateHelp ? '发布' : '保存' }}</el-button>
                </div>
            </template>

            <el-form
                ref="showDetailFormRef"
                :model="showDetailData"
                :rules="commonRules"
                label-position="top"
                label-width="140px"
            >
                <el-form-item label="帮助文章标题" prop="title">
                    <el-input v-model="showDetailData.title" size="large" />
                </el-form-item>

                <el-form-item label="内容" prop="content">
                    <div style="width: 100%;">
                        <quill-editor v-model:content="showDetailData.content" contentType="text" style="min-height: 700px; width: 100%;" />
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
    </el-space>

    <div class="fab-add" @click="handleCreateNewHelp">
        <el-icon><Plus /></el-icon>
    </div>

    <el-backtop :right="75" :bottom="65" />
</template>
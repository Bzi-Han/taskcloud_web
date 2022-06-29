<script setup>
import router from '../../config/router'
import network from '../../config/network'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const browser = undefined === router.currentRoute.value.params.id || '' === router.currentRoute.value.params.id;
const helpId = browser ? -1 : router.currentRoute.value.params.id;
const loading = ref(false);
const keyword = ref('');
const showDetail = ref(false);
const currentPageData = ref({
    records: [],
    current: 1,
    pages: 0,
    size: 10,
    total: 0,
});
const showDetailData = ref({
    id: 0,
    title: '',
    author: '',
    authorId: 0,
    content: '',
    publishTime: '',
});

if (browser) {
    loading.value = true;
    network.get('/help/items/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
} else {
    loading.value = true;
    network.get('/help/detail/' + helpId).then(result => {
        showDetailData.value = result.data;
    }).catch(() => {
        router.push('/home-status');
    }).finally(() => {
        loading.value = false;
    });
}

function handleHelpSearch() {
    if ('' === keyword.value) {
        currentPageData.value.current = 1;
        handleHelpPageChange();

        return;
    }

    loading.value = true;
    network.get(`/help/search/${keyword.value}/${currentPageData.value.current}`).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleHelpPageChange() {
    if ('' !== keyword.value) {
        handleHelpSearch();

        return;
    }

    loading.value = true;
    network.get('/help/items/' + currentPageData.value.current).then(result => {
        currentPageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleShowDetail(help) {
    showDetailData.value = help;
    showDetail.value = true;
}

function handleMakeSharedLink(helpId, copyImplementer) {
    copyImplementer(`${window.location.origin}/help/${helpId}`);

    ElMessage({
        message: '已复制到剪贴板',
        type: 'success',
    });
}

</script>

<style scoped>
.li-align {display: flex; justify-content: space-between; margin-top: 10px;}
.li-align:first-child {margin-top: 0;}
.li-align .link-align {font-size:16px; margin-right: 5px; display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;}
.li-align .span-align {display: block; min-width: 160px;}
.help-header {display: flex; justify-content: space-between; align-items: center;}
.help-header div:first-child {display: flex; justify-content: flex-start; align-items: center; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;}
</style>

<template>
    <el-space v-if="!showDetail && browser" v-loading.fullscreen.lock="loading" size="large" style="width: 100%;" wrap fill>
        <el-input
            v-model="keyword"
            placeholder="请输入关键词: 帮助名称或创建者昵称进行搜索"
            size="large"
        >
            <template #append>
                <el-button @click="handleHelpSearch">
                    <el-icon><Search /></el-icon>
                </el-button>
            </template>
        </el-input>

        <el-card>
            <ul>
                <li :key="item.id" v-for="item in currentPageData.records" class="li-align">
                    <el-link class="link-align" @click="handleShowDetail(item)">{{ item.title }}</el-link>
                    <span class="span-align">{{ item.publishTime }}</span>
                </li>
            </ul>
        </el-card>

        <div style="display: flex; justify-content: flex-end;">
            <el-pagination
                v-model:current-page="currentPageData.current"
                :page-size="currentPageData.size"
                :total="currentPageData.total"
                :disabled="1 >= currentPageData.pages"
                class="hidden-xs-only"
                layout="prev, pager, next, jumper"
                background
                @current-change="handleHelpPageChange"
            />
            <el-pagination
                v-model:current-page="currentPageData.current"
                :page-size="currentPageData.size"
                :total="currentPageData.total"
                :disabled="1 >= currentPageData.pages"
                class="hidden-sm-and-up"
                layout="prev, pager, next, jumper"
                small
                @current-change="handleHelpPageChange"
            />
        </div>
    </el-space>

    <el-space v-if="showDetail || !browser" size="large" style="width: 100%;" wrap fill>
        <el-button v-if="browser" @click="showDetail = false">返回</el-button>

        <el-card>
            <template #header>
                <div class="help-header">
                    <div>
                        <el-icon style="font-size: 22px;"><Collection /></el-icon>
                        <h3>{{ showDetailData.title }}</h3>
                    </div>
                    <div>
                        <el-button
                            link
                            @click="handleMakeSharedLink(showDetailData.id, this.$copyText)"
                        >
                            <el-icon style="font-size: 22px;"><Share /></el-icon>
                        </el-button>
                    </div>
                </div>
            </template>

            <div>作者: {{ showDetailData.author }}</div>
            <div>发布时间: {{ showDetailData.publishTime }}</div>

            <div style="margin-top: 30px;">{{ showDetailData.content }}</div>
        </el-card>

    </el-space>

    <el-backtop :right="75" :bottom="65" />
</template>
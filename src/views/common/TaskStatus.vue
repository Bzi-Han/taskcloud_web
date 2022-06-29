<script setup>
import network from '../../config/network'
import { TaskState, TaskStateTagType } from '../../config/types'
import { ref, reactive, onMounted } from 'vue'
import * as echarts from 'echarts'

const loading = ref(false);
const logData = ref([]);
const processPercent = ref(0);       // 总任务处理进度
const fromManualPercent = ref(0);    // 手动投递百分比
const fromSystemPercent = ref(0);    // 系统投递百分比
const taskSucceedPercent = ref(0);   // 任务成功百分比
const taskFailedPercent = ref(0);    // 任务失败百分比
const notProcessedLogData = ref([]); // 未处理的任务日志数据
const processedLogData = ref([]);    // 已处理的任务日志数据
const resultMap = ref();             // 任务结果时间分布图
const resultMapOption = reactive({
    title: {
        text: '数据来源: 最近7天的任务日志',
    },
    grid: {
        left: '3%',
        right: '7%',
        bottom: '7%',
        containLabel: true
    },
    tooltip: {
        showDelay: 0,
        formatter: function (params) {
            if (params.value.length > 1) {
                return (
                    params.seriesName +
                    ' :<br/>' +
                    params.value[1].replace('1145-01-04', params.value[0])
                );
            } else {
                return (
                    params.seriesName +
                    ' :<br/>' +
                    params.name
                );
            }
        },
        axisPointer: {
            show: true,
            type: 'cross',
            lineStyle: {
                type: 'dashed',
                width: 1
            },
            label: {
                formatter: function (params) {
                    if ('y' === params.axisDimension)
                        return new Date(params.value).toLocaleTimeString();
                    else
                        return params.value;
                },
            },
        }
    },
    toolbox: {
        feature: {
            dataZoom: {},
            brush: {
                type: ['rect', 'polygon', 'clear']
            }
        }
    },
    brush: {},
    legend: {
        data: [
            {
                name: 'Succeed',
                itemStyle: {
                    color: '#13ce66',
                    borderWidth: 1,
                    borderType: 'dashed'
                }
            },
            {
                name: 'Failed',
                itemStyle: {
                    color: '#ff4949',
                    borderWidth: 1,
                    borderType: 'dashed'
                }
            },
        ],
        left: 'center',
        bottom: 10
    },
    xAxis: [
        {
            type: 'category',
            scale: true,
            splitLine: {
                show: true
            }
        }
    ],
    yAxis: [
        {
            type: 'time',
            scale: true,
            splitLine: {
                show: true
            }
        }
    ],
    series: [
        {
            name: 'Succeed',
            type: 'scatter',
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                color: '#13ce66',
                borderWidth: 1,
                borderType: 'dashed'
            },
            markArea: {
                silent: true,
                itemStyle: {
                    color: '#13ce6620',
                    borderWidth: 1,
                    borderType: 'dashed'
                },
                data: [[
                    {
                        name: 'Succeed Data Range',
                        xAxis: 'min',
                        yAxis: 'min'
                    },
                    {
                        xAxis: 'max',
                        yAxis: 'max'
                    }
                ]]
            },
            markPoint: {
                data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }
                ]
            },
            data: [],
        },
        {
            name: 'Failed',
            type: 'scatter',
            emphasis: {
                focus: 'series'
            },
            itemStyle: {
                color: '#ff4949',
                borderWidth: 1,
                borderType: 'dashed'
            },
            markArea: {
                silent: true,
                itemStyle: {
                    color: '#ff494920',
                    borderWidth: 1,
                    borderType: 'dashed'
                },
                data: [
                [
                    {
                        name: 'Failed Data Range',
                        xAxis: 'min',
                        yAxis: 'min'
                    },
                    {
                        xAxis: 'max',
                        yAxis: 'max'
                    }
                ]
                ]
            },
            markPoint: {
                data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }
                ]
            },
            data: [],
        }
    ]
});
let resultMapObject = undefined;
const taskLog = ref();

loading.value = true;
network.get('/taskLog/items/7').then(async (result) => {
    logData.value = result.data;

    notProcessedLogData.value = logData.value.filter(item => 0 === item.state || 1 === item.state);
    processedLogData.value = logData.value.filter(item => 0 !== item.state && 1 !== item.state);

    processPercent.value = (notProcessedLogData.value.length / logData.value.length * 100);
    fromManualPercent.value = (logData.value.filter(item => item.fromWhere.includes('手动投递')).length / logData.value.length * 100);
    fromSystemPercent.value = (100 - fromManualPercent.value);
    taskSucceedPercent.value = (processedLogData.value.filter(item => 5 === item.state).length / processedLogData.value.length * 100);
    taskFailedPercent.value = (100 - taskSucceedPercent.value);

    let succeedData = [];
    let failedData = [];
    for (let i = 0; i < result.data.length; i++) {
        const time = result.data[i].executeOnTime.split(' ');

        if (5 === result.data[i].state) {
            succeedData.push([
                time[0],
                `1145-01-04 ${time[1]}`
            ]);
        } else if (6 === result.data[i].state) {
            failedData.push([
                time[0],
                `1145-01-04 ${time[1]}`
            ]);
        }
    }

    resultMapOption.series[0].data = succeedData;
    resultMapOption.series[1].data = failedData;
    if (resultMapObject)
        resultMapObject.setOption(resultMapOption);

    // 继续获取用户任务执行的日志
    const taskLogs = await network.get('/taskLog/output/1');
    taskLog.value.append(taskLogs.data);
}).catch(() => {}).finally(() => {
    loading.value = false;
});


onMounted(() => {
    resultMapObject = echarts.init(resultMap.value);
    resultMapObject.setOption(resultMapOption);
});

</script>

<style scoped>
.card-align {margin-top: 30px;}
.progress-align {text-align: center;}
.console {
    width: 100%;
    color: rgb(199, 218, 179);
    background-color: rgb(30, 30, 30);
    min-height: 240px;
    outline: none;
    resize: none;
    border: 1px solid #909399;
}
</style>

<template>
    <el-card v-loading.fullscreen.lock="loading" header="处理进度">
        <el-row>
            <el-col :span="8" class="progress-align">
                <el-progress
                    v-if="100 === processPercent"
                    :percentage="processPercent"
                    type="circle"
                    status="success"
                ></el-progress>

                <el-progress
                    v-else
                    :percentage="processPercent"
                    type="circle"
                >
                    <template #default="{ percentage }">
                        <span class="percentage-value">{{ percentage.toFixed(2) }}%</span>
                    </template>
                </el-progress>
                
            </el-col>

            <el-col :span="8" class="progress-align">
                <el-progress
                    :percentage="fromManualPercent"
                    type="circle"
                    color="#5cb87a"
                >
                    <template #default="{ percentage }">
                        <span class="percentage-value">{{ percentage.toFixed(2) }}%</span>
                    </template>
                </el-progress>
            </el-col>

            <el-col :span="8" class="progress-align">
                <el-progress
                    :percentage="fromSystemPercent"
                    type="circle"
                    color="#6f7ad3"
                >
                    <template #default="{ percentage }">
                        <span class="percentage-value">{{ percentage.toFixed(2) }}%</span>
                    </template>
                </el-progress>
            </el-col>

        </el-row>
        
        <el-row style="margin-top: 10px;">
            <el-col :span="8" class="progress-align">总任务处理进度</el-col>
            <el-col :span="8" class="progress-align">主动投递</el-col>
            <el-col :span="8" class="progress-align">系统投递</el-col>
        </el-row>

    </el-card>

    <el-card header="处理状态" class="card-align">
        <el-row>
            <el-col :span="12" class="progress-align">
                <el-progress :percentage="taskSucceedPercent" type="dashboard" status="success">
                    <template #default="{ percentage }">
                        <span class="percentage-value">{{ percentage.toFixed(2) }}%</span>
                    </template>
                </el-progress>
            </el-col>

            <el-col :span="12" class="progress-align">
                <el-progress :percentage="taskFailedPercent" type="dashboard" status="exception">
                    <template #default="{ percentage }">
                        <span class="percentage-value">{{ percentage.toFixed(2) }}%</span>
                    </template>
                </el-progress>
            </el-col>

        </el-row>
        
        <el-row>
            <el-col :span="12" class="progress-align">任务成功</el-col>
            <el-col :span="12" class="progress-align">任务失败</el-col>
        </el-row>

    </el-card>

    <el-card header="结果时间分布图" class="card-align">
        <div ref="resultMap" style="width:100%; min-height:600px;"></div>
    </el-card>

    <el-card header="未处理的任务" class="card-align">
        <el-table :data="notProcessedLogData" row-key="id">
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

    <el-card header="已处理的任务" class="card-align">
        <el-table :data="processedLogData" row-key="id">
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

    <el-card header="简要任务日志" class="card-align">
        <textarea ref="taskLog" class="console" readonly="readonly"></textarea>
    </el-card>

</template>
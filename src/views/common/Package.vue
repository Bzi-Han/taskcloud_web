<script setup>
import network from '../../config/network'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false);
const packageData = ref({
    records: [],
    current: 1,
    pages: 0,
    size: 10,
    total: 0,
});
const addPackageDialog = ref(false);
const addPackageFormRef = ref();
const addPackageForm = reactive({
    name: '',
    activated: false,
    runEveryday: false,
    runOnTime: null,
});
const editPackage = ref(false);
const editPackageFormRef = ref();
const editPackageForm = ref({
    id: '',
    name: '',
    activated: false,
    runEveryday: false,
    runOnTime: null,
    tasksConfig: [],
});
const commonRules = reactive({
    name: [
        { required: true, message: "请输入任务包名称", trigger: "blur" }
    ],
    runOnTime: [
        { required: true, message: "请选择任务包执行的时间", trigger: "change" }
    ]
});
const timePickerShortcuts = reactive([
    {
        text: "30秒后",
        value() {
            const date = new Date();

            date.setTime(date.getTime() + 30000);

            return date;
        }
    }
]);

loading.value = true;
network.get(`/package/items/${packageData.value.current}`).then(result => {
    packageData.value = result.data;
}).catch(() => {}).finally(() => {
    loading.value = false;
});

function handleRunForNow(packageData) {
    loading.value = true;
    network.post(`/package/post/${packageData.id}`, {}).then(result => {
        ElMessage({
            message: result.message,
            type: 'success',
        });
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleEditPackage(packageData) {
    Object.assign(editPackageForm.value, packageData);
    
    if ('string' === typeof packageData.tasksConfig) {
        // searialize
        const remappingJson = JSON.parse(packageData.tasksConfig);
        editPackageForm.value.tasksConfig = [];

        for (let k in remappingJson) {
            let node = {
                id: k,
                name: remappingJson[k].name,
                domain: remappingJson[k].domain,
                run: [],
            };

            for (let v of remappingJson[k].run) {
                let state = Object.keys(v)[0];

                node.run.push({
                    function: v[state],
                    state: 'true' === state,
                });
            }

            editPackageForm.value.tasksConfig.push(node);
        }
    }
      
    editPackage.value = true;
}

function handlePackagePageChange() {
    loading.value = true;
    network.get(`/package/items/${packageData.value.current}`).then(result => {
        packageData.value = result.data;
    }).catch(() => {}).finally(() => {
        loading.value = false;
    });
}

function handleAddPackage() {
    addPackageFormRef.value.validate(result => {
        if (!result)
            return;

        loading.value = true;
        network.post('/package/add', addPackageForm).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            packageData.value.total = packageData.value.records.unshift(result.data);

            addPackageDialog.value = false;
            addPackageForm.name = '';
            addPackageForm.activated = false;
            addPackageForm.runEveryday = false;
            addPackageForm.runOnTime = null;
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

function handleUpdatePackage() {
    editPackageFormRef.value.validate(result => {
        if (!result)
            return;

        // deserialize
        let remappingJson = {};

        for (let v of editPackageForm.value.tasksConfig) {
            let node = {
                name: v.name,
                domain: v.domain,
                run: [],
            };

            for (let k of v.run)
                node.run.push({[k.state ? 'true' : 'false']: k.function});

            remappingJson[v.id] = node;
        }

        const updateData = Object.assign({}, editPackageForm.value);
        updateData.tasksConfig = JSON.stringify(remappingJson);

        loading.value = true;
        network.put('/package/update', updateData).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });

            for (let i = 0; i < packageData.value.records.length; i++) {
                if (packageData.value.records[i].id === updateData.id) {
                    packageData.value.records[i] = updateData;

                    break;
                }
            }

            editPackage.value = false;
        }).catch(() => {}).finally(() => {
            loading.value = false;
        });

    }).catch(() => {});
}

function handleRemoveTaskFromPackage(taskId) {
    for (let i = 0; i < editPackageForm.value.tasksConfig.length; i++) {
        if (editPackageForm.value.tasksConfig[i].id === taskId) {
            editPackageForm.value.tasksConfig.splice(i, 1);

            break;
        }
    }
}

</script>

<style scoped>
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
    <div v-if="!editPackage" v-loading.fullscreen.lock="loading">
        <el-table :data="packageData.records" row-key="id" style="margin-bottom: 20px;">
            <el-table-column prop="name" label="任务包名称" />
            
            <el-table-column prop="activated" label="是否激活">
                <template #default="scope">
                    <el-switch v-model="scope.row.activated" disabled />
                </template>
            </el-table-column>
            
            <el-table-column prop="runEveryday" label="是否每天运行">
                <template #default="scope">
                    <el-switch v-model="scope.row.runEveryday" disabled />
                </template>
            </el-table-column>

            <el-table-column
                column-key="runOnTime"
                prop="runOnTime"
                label="执行时间"
                sortable
            />

            <el-table-column align="right" label="操作">
                <template #default="scope">
                    <el-button size="small" type="success" @click="handleRunForNow(scope.row)">立即推送</el-button>
                    <el-button size="small" type="primary" @click="handleEditPackage(scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            v-model:current-page="packageData.current"
            :page-size="packageData.size"
            :total="packageData.total"
            :disabled="1 >= packageData.pages"
            class="hidden-xs-only"
            layout="prev, pager, next, jumper"
            background
            @current-change="handlePackagePageChange"
        />
        <el-pagination
            v-model:current-page="packageData.current"
            :page-size="packageData.size"
            :total="packageData.total"
            :disabled="1 >= packageData.pages"
            class="hidden-sm-and-up"
            layout="prev, pager, next, jumper"
            small
            @current-change="handlePackagePageChange"
        />

        <el-dialog v-model="addPackageDialog" title="添加新的任务包" width="70%">
            <el-form
                ref="addPackageFormRef"
                :model="addPackageForm"
                :rules="commonRules"
                label-width="100px"
            >
                <el-form-item label="任务包名称" prop="name">
                    <el-input v-model="addPackageForm.name" />
                </el-form-item>

                <el-form-item label="执行时间" prop="runOnTime">
                    <el-date-picker
                        v-model="addPackageForm.runOnTime"
                        :shortcuts="timePickerShortcuts"
                        type="datetime"
                        placeholder="选择日期时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                    />
                </el-form-item>

                <el-form-item label="是否激活" prop="activated">
                    <el-switch v-model="addPackageForm.activated" />
                </el-form-item>

                <el-form-item label="是否每天运行" prop="runEveryday">
                    <el-switch v-model="addPackageForm.runEveryday" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="addPackageDialog = false">取 消</el-button>
                <el-button type="primary" @click="handleAddPackage">提 交</el-button>
            </template>
        </el-dialog>

        <div class="fab-add" @click="addPackageDialog = true">
            <el-icon><Plus /></el-icon>
        </div>
    </div>

    <el-space v-if="editPackage" size="large" style="width: 100%;" wrap fill>
        <el-button @click="editPackage = false">返回</el-button>

        <el-card>
            <el-form
                ref="editPackageFormRef"
                :model="editPackageForm"
                :rules="commonRules"
                label-width="100px"
            >
                <el-form-item label="任务包名称" prop="name">
                    <el-input v-model="editPackageForm.name" />
                </el-form-item>

                <el-form-item label="执行时间" prop="runOnTime">
                    <el-date-picker
                        v-model="editPackageForm.runOnTime"
                        :shortcuts="timePickerShortcuts"
                        type="datetime"
                        placeholder="选择日期时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                    />
                </el-form-item>

                <el-form-item label="是否激活" prop="activated">
                    <el-switch v-model="editPackageForm.activated" />
                </el-form-item>

                <el-form-item label="是否每天运行" prop="runEveryday">
                    <el-switch v-model="editPackageForm.runEveryday" />
                </el-form-item>
            </el-form>

            <div style="display: flex; justify-content: flex-end;">
                <el-button type="primary" @click="handleUpdatePackage">提 交</el-button>
            </div>
        </el-card>

        <el-card>
            <el-table :data="editPackageForm.tasksConfig" row-key="id" style="width: 100%" default-expand-all>
                <el-table-column type="expand">
                    <template #default="props">
                        <div style="display: flex; flex-wrap: wrap;">
                            <div :key="v.id" v-for="v in props.row.run">
                                <span style="margin-left: 10px; margin-right: 5px;">{{ v.function }}</span>
                                <el-switch v-model="v.state" />
                            </div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="任务 ID" prop="id"></el-table-column>

                <el-table-column label="任务名称" prop="name"></el-table-column>

                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button @click="handleRemoveTaskFromPackage(scope.row.id)">移除此任务</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

    </el-space>
</template>
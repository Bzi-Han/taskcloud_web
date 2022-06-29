<script setup>
import { ref, defineProps, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
    value: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: 'javascript'
    },
    theme: {
        type: String,
        default: 'vs-dark'
    },
    formatOnSave: {
        type: Boolean,
        default: false
    },
    readonly: {
        type: Boolean,
        default: false
    },
});
const emit = defineEmits(['save', 'update:value']);
const editorContainerRef = ref();
let editor = null;

onMounted(() => {
    // 创建编辑器
    editor = monaco.editor.create(editorContainerRef.value, {
        value: props.value,
        language: props.language,
        theme: props.theme,
        readOnly: props.readonly,
    });

    // 注册 Ctrl + S 事件
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        if (props.formatOnSave)
        {
            editor.getAction('editor.action.formatDocument').run().then(() => {
                emit('save', editor.getValue());
            });
        }
        else
            emit('save', editor.getValue());
    });
    
    // 监听编辑器变化
    editor.getModel().onDidChangeContent(() => {
        emit('update:value', editor.getValue());
    });
});

// 监听 props 变化
watch(props, value => {
    if (editor) {
        const thisModel = editor.getModel();

        // 如果编辑器的语言和现行不一致，则设置编辑器的语言
        if (thisModel.getLanguageId() !== value.language)
            monaco.editor.setModelLanguage(thisModel, value.language);
        
        if (value.value !== thisModel.getValue())
            thisModel.setValue(value.value);
    }
});

</script>

<template>
    <div ref="editorContainerRef" style="height:100%; height: 700px;"></div>
</template>

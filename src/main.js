import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import VueClipboard from 'vue-clipboard2'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import router from './config/router'
import network from './config/network'

const app = createApp(App);

VueClipboard.config.autoSetContainer = true;

app.use(ElementPlus);
app.use(VueClipboard);
app.use(router);
app.config.globalProperties.$network = network;

app.config.globalProperties.utoa = str => {
    return btoa(unescape(encodeURIComponent(str)));
};
app.config.globalProperties.atou = str => {
    return decodeURIComponent(escape(atob(str)));
};

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.component('QuillEditor', QuillEditor);

app.mount('#app');

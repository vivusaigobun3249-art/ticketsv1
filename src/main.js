import 'intl-tel-input/build/css/intlTelInput.css'
import setupDisableDevtools from './utils/disable-devtools'
import { i18n } from "./i18n";
import { createApp } from 'vue'
import App from './App.vue'
// import router from './router'

const app = createApp(App);
app.use(i18n);
// app.use(router)
app.mount('#app')
setupDisableDevtools({
    enableDetector: true,
})

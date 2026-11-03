import { createApp } from 'vue'
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import './styles/main.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';

// Create Pinia instance
const pinia = createPinia();

// Create and mount the application
const app = createApp(App);
app.use(pinia);
app.mount('#app');
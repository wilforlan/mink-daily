import { BackgroundApp } from './app';
import { RegisteredModules } from './modules';

/** Bootstrap the app creation */
const app = new BackgroundApp(RegisteredModules);
app.init().then(async () => {
  console.info('App initialized');
});
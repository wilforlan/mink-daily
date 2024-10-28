import { BackgroundApp } from './app';
import { analytics } from './commons/analytics/segment';
import { RegisteredModules } from './modules';
import { userService } from './services';

/** Bootstrap the app creation */
const app = new BackgroundApp(RegisteredModules);
app.init().then(async () => {
  console.info('App initialized');
  const { email } = await userService.getAccountInfo();
  await analytics.init({ email });
});

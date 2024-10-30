import { BackgroundApp } from './app';
import { analytics } from './commons/analytics/segment';
import { RegisteredModules } from './modules';
import { userService } from './services';

/** Bootstrap the app creation */
const app = new BackgroundApp(RegisteredModules);
app.init().then(async () => {
  console.info('App initialized');
  const user = await userService.getAccountInfo();
  if (user) {
    await analytics.init({ email: user.email });
  }
});
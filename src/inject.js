// inject.js
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

// このクラスを既存の Notification と置き換える
class TauriNotification {
  constructor(title, options) {
    sendNotification({
      title,
      body: options?.body ?? '',
    });
  }

  static async requestPermission() {
    const result = await requestPermission();
    return result;
  }

  static get permission() {
    return isPermissionGranted().then(granted => granted ? 'granted' : 'default'); // 'denied' と返すと Web側が止まることがある
  }
}

// 上書き
window.Notification = TauriNotification;

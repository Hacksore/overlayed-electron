import { EventEmitter } from "events";
let instance;
class SettingsService extends EventEmitter {
    
  // write to file config    
  set(key: string, value: unknown) {
    window.electron.setConfigValue(key, value);
  }

  get(key: string) {
    const item = window.electron.getConfigValue(key);
    if (item) {
      return item;
    } else {
      return null;
    }
  }

}

if (!instance) {
  instance = new SettingsService();
}

export default instance as SettingsService;

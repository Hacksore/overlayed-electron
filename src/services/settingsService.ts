import { EventEmitter } from "events";

let instance;

class SettingsService extends EventEmitter {
  
  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    } else {
      return null;
    }
  }

}

if (!instance) {
  instance = new SettingsService();
}

export default instance as SettingsService;

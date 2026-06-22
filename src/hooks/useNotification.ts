export function useNotification() {
  async function permission() {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  }

  function send(title: string, message: string) {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  }

  return { permission, send };
}

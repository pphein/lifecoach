import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let deferredPrompt: any = null;

export function usePWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setCanInstall(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
      setCanInstall(false);
    }
    deferredPrompt = null;
  }

  return { canInstall, installed, install };
}

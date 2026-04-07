import { useConsoleStore, LogLevel } from "../store/consoleStore";

/**
 * Global Console Hijacker (Elite Bridge)
 * This utility intercepts all global console calls and redirects them
 * to the engine's internal UI console while maintaining original functionality.
 */
export const initConsoleBridge = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  const addLogToStore = (level: LogLevel, args: unknown[]) => {
    // Convert objects/arrays to readable strings
    const message = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return "[Unserializable Object]";
          }
        }
        return String(arg);
      })
      .join(" ");

    useConsoleStore.getState().addLog(level, message);
  };

  window.addEventListener('error', (_e) => {
      const consoleStore = useConsoleStore.getState();
      consoleStore.addLog('error', `Runtime Error: ${_e.message}`);
  });

  // Override Globals
  console.log = (...args: unknown[]) => {
    originalLog.apply(console, args);
    addLogToStore("info", args);
  };

  console.warn = (...args: unknown[]) => {
    originalWarn.apply(console, args);
    addLogToStore("warn", args);
  };

  console.error = (...args: unknown[]) => {
    originalError.apply(console, args);
    addLogToStore("error", args);
  };

  console.info = (...args: unknown[]) => {
    originalInfo.apply(console, args);
    addLogToStore("info", args);
  };

  // Catch Uncaught Exceptions
  window.onerror = (message, source, lineno, colno, _error) => {
    const errorMsg = `Uncaught Runtime Error: ${String(message)} at ${String(source)}:${lineno}:${colno}`;
    useConsoleStore.getState().addLog("error", errorMsg);
    return false; // Let browser handle it as well
  };

  // Catch Unhandled Promise Rejections
  window.onunhandledrejection = (event) => {
    const promiseError = `Unhandled Promise Rejection: ${String(event.reason)}`;
    useConsoleStore.getState().addLog("error", promiseError);
  };

  console.log("🛡️ Console Bridge: Professional Hijacking Engaged");
};

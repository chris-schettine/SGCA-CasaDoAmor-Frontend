import { toast, type ToastOptions, Bounce } from 'react-toastify';

/** Opções padrão para todos os toasts da aplicação.
 * Ajustadas para melhor experiência (autoClose maior, pausa ao perder foco, etc.).
 */
export const defaultToastOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 5000, // 5 segundos — tempo suficiente para ler a mensagem
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  draggable: true,
  progress: undefined,
  //theme: 'colored', // 'light', 'dark' ou 'colored'
  transition: Bounce,
};

/** Opções para toasts de operações críticas (cadastro, exclusão, etc.) */
export const criticalToastOptions: ToastOptions = {
  ...defaultToastOptions,
  autoClose: 8000, // 8 segundos para operações importantes
};

const toastSuccess = (message: string, options: ToastOptions = {}) => {
  toast.success(message, { ...defaultToastOptions, ...options });
};

/** Toast de sucesso para operações críticas (cadastro, exclusão, etc.) */
const toastSuccessCritical = (message: string, options: ToastOptions = {}) => {
  toast.success(message, { ...criticalToastOptions, ...options });
};

const toastError = (message: string, options: ToastOptions = {}) => {
  toast.error(message, { ...defaultToastOptions, ...options });
};

const toastErrorCritical = (message: string, options: ToastOptions = {}) => {
  toast.error(message, { ...criticalToastOptions, ...options });
};

const toastInfo = (message: string, options: ToastOptions = {}) => {
  toast.info(message, { ...defaultToastOptions, ...options });
};

const toastWarn = (message: string, options: ToastOptions = {}) => {
  toast.warn(message, { ...defaultToastOptions, ...options });
};

export { toast, toastSuccess, toastSuccessCritical, toastError, toastErrorCritical, toastInfo, toastWarn };

// EOF
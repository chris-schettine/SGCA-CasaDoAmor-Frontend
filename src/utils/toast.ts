import { toast, type ToastOptions, Bounce } from 'react-toastify';

/** Opções padrão para todos os toasts da aplicação.
 * Ajustadas para melhor experiência (autoClose maior, pausa ao perder foco, etc.).
 */
export const defaultToastOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 4000, // 4 segundos — tempo suficiente para ler a mensagem
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  draggable: true,
  progress: undefined,
  theme: 'colored', // 'light', 'dark' ou 'colored'
  transition: Bounce,
};

const toastSuccess = (message: string, options: ToastOptions = {}) => {
  toast.success(message, { ...defaultToastOptions, ...options });
};

const toastError = (message: string, options: ToastOptions = {}) => {
  toast.error(message, { ...defaultToastOptions, ...options });
};

const toastInfo = (message: string, options: ToastOptions = {}) => {
  toast.info(message, { ...defaultToastOptions, ...options });
};

const toastWarn = (message: string, options: ToastOptions = {}) => {
  toast.warn(message, { ...defaultToastOptions, ...options });
};

export { toast, toastSuccess, toastError, toastInfo, toastWarn };

// EOF
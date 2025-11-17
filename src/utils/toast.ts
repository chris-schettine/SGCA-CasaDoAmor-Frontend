import { toast, type ToastOptions, Bounce } from 'react-toastify';

/** Opções padrão para todos os toasts da aplicação.
 * Ajustadas para melhor experiência (autoClose maior, pausa ao perder foco, etc.).
 */
export const defaultToastOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 3000, // 3 segundos — tempo suficiente para ler a mensagem
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  draggable: true,
  theme: 'colored',
  progress: undefined,
  transition: Bounce,
};

/** Opções para toasts de operações críticas (cadastro, exclusão, etc.) */
export const criticalToastOptions: ToastOptions = {
  ...defaultToastOptions,
  autoClose: 5000, // 5 segundos para operações importantes
};

const toastSuccess = (message: string, options: ToastOptions = {}) => {
  const finalOptions = { ...defaultToastOptions, ...options };
  if (import.meta.env.DEV) {
    console.debug('[toastSuccess]', { 
      message, 
      providedOptions: options, 
      finalOptions,
      autoClose: finalOptions.autoClose,
      timestamp: Date.now() 
    });
  }
  toast.success(message, finalOptions);
};

/** Toast de sucesso para operações críticas (cadastro, exclusão, etc.) */
const toastSuccessCritical = (message: string, options: ToastOptions = {}) => {
  const finalOptions = { ...criticalToastOptions, ...options };
  if (import.meta.env.DEV) {
    console.debug('[toastSuccessCritical]', { 
      message, 
      providedOptions: options, 
      finalOptions,
      autoClose: finalOptions.autoClose,
      timestamp: Date.now() 
    });
  }
  toast.success(message, finalOptions);
};

const toastError = (message: string, options: ToastOptions = {}) => {
  const finalOptions = { ...defaultToastOptions, ...options };
  if (import.meta.env.DEV) {
    console.debug('[toastError]', { 
      message, 
      providedOptions: options, 
      finalOptions,
      autoClose: finalOptions.autoClose,
      timestamp: Date.now() 
    });
  }
  toast.error(message, finalOptions);
};

const toastErrorCritical = (message: string, options: ToastOptions = {}) => {
  const finalOptions = { ...criticalToastOptions, ...options };
  if (import.meta.env.DEV) {
    console.debug('[toastErrorCritical]', { 
      message, 
      providedOptions: options, 
      finalOptions,
      autoClose: finalOptions.autoClose,
      timestamp: Date.now() 
    });
  }
  toast.error(message, finalOptions);
};

const toastInfo = (message: string, options: ToastOptions = {}) => {
  const finalOptions = { ...defaultToastOptions, ...options };
  if (import.meta.env.DEV) {
    console.debug('[toastInfo]', { 
      message, 
      providedOptions: options, 
      finalOptions,
      autoClose: finalOptions.autoClose,
      timestamp: Date.now() 
    });
  }
  toast.info(message, finalOptions);
};

const toastWarn = (message: string, options: ToastOptions = {}) => {
  const finalOptions = { ...defaultToastOptions, ...options };
  if (import.meta.env.DEV) {
    console.debug('[toastWarn]', { 
      message, 
      providedOptions: options, 
      finalOptions,
      autoClose: finalOptions.autoClose,
      timestamp: Date.now() 
    });
  }
  toast.warn(message, finalOptions);
};

export { toast, toastSuccess, toastSuccessCritical, toastError, toastErrorCritical, toastInfo, toastWarn };

// EOF
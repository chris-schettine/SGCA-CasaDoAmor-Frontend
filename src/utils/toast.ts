import { toast, type ToastOptions, Bounce } from 'react-toastify';

const defaultToastOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 1000, // tempo para fechar a notificação = 1 segundos
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored", // 'light', 'dark' ou 'colored'
  transition: Bounce, // Animação
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
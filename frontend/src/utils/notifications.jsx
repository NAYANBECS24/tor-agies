import toast from 'react-hot-toast';

export const showNotification = (options) => {
  const { title, message, type = 'info', duration = 4000 } = options;
  
  const config = {
    duration,
    position: 'top-right',
  };
  
  const content = (
    <div>
      {title && <strong>{title}</strong>}
      {message && <div style={{ marginTop: '4px' }}>{message}</div>}
    </div>
  );
  
  switch (type) {
    case 'success':
      toast.success(content, config);
      break;
    case 'error':
      toast.error(content, config);
      break;
    case 'warning':
      toast(content, {
        ...config,
        icon: '⚠️',
        style: {
          background: '#ff9800',
          color: '#fff',
        },
      });
      break;
    case 'info':
    default:
      toast(content, config);
      break;
  }
};

export const showSuccess = (message, title = 'Success') => {
  showNotification({ title, message, type: 'success' });
};

export const showError = (message, title = 'Error') => {
  showNotification({ title, message, type: 'error' });
};

export const showWarning = (message, title = 'Warning') => {
  showNotification({ title, message, type: 'warning' });
};

export const showInfo = (message, title = 'Info') => {
  showNotification({ title, message, type: 'info' });
};
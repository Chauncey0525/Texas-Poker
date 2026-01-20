// utils/toast-util.js
// 统一的Toast提示工具

let toastComponent = null;

// 设置toast组件实例
function setToastComponent(component) {
  toastComponent = component;
}

// 显示Toast
function showToast(message, type = 'info', duration = 2000) {
  if (toastComponent) {
    toastComponent.show(message, type, duration);
  } else {
    // 降级到原生Toast
    const iconMap = {
      success: 'success',
      error: 'none',
      warning: 'none',
      info: 'none'
    };
    wx.showToast({
      title: message,
      icon: iconMap[type] || 'none',
      duration: duration
    });
  }
}

// 成功提示
function success(message, duration) {
  showToast(message, 'success', duration);
}

// 错误提示
function error(message, duration) {
  showToast(message, 'error', duration);
}

// 警告提示
function warning(message, duration) {
  showToast(message, 'warning', duration);
}

// 信息提示
function info(message, duration) {
  showToast(message, 'info', duration);
}

module.exports = {
  setToastComponent,
  showToast,
  success,
  error,
  warning,
  info
};

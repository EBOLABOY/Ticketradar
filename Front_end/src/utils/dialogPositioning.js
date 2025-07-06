/**
 * 对话框定位工具函数
 * 用于计算对话框在按钮附近的最佳位置
 */

/**
 * 计算对话框位置 - 在按钮附近居中显示
 * @param {HTMLElement} anchorEl - 锚点元素（按钮）
 * @param {Object} options - 配置选项
 * @param {number} options.dialogWidth - 对话框宽度，默认400
 * @param {number} options.dialogHeight - 对话框高度，默认300
 * @param {number} options.offset - 与按钮的距离，默认20
 * @returns {Object} 包含position、top、left、transform、margin的样式对象
 */
export const getDialogPosition = (anchorEl, options = {}) => {
  if (!anchorEl) return {};
  
  const {
    dialogWidth = 400,
    dialogHeight = 300,
    offset = 20
  } = options;
  
  const rect = anchorEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 计算按钮中心点
  const buttonCenterX = rect.left + rect.width / 2;
  const buttonCenterY = rect.top + rect.height / 2;
  
  // 计算对话框位置，使其在按钮附近居中
  let left = buttonCenterX - dialogWidth / 2;
  let top = rect.bottom + offset; // 优先显示在按钮下方
  
  // 如果下方空间不够，显示在按钮上方
  if (top + dialogHeight > viewportHeight - offset) {
    top = rect.top - dialogHeight - offset;
  }
  
  // 如果上方也不够，居中显示
  if (top < offset) {
    top = buttonCenterY - dialogHeight / 2;
  }
  
  // 水平方向边界检查
  if (left < offset) {
    left = offset;
  } else if (left + dialogWidth > viewportWidth - offset) {
    left = viewportWidth - dialogWidth - offset;
  }
  
  // 垂直方向边界检查
  top = Math.max(offset, Math.min(top, viewportHeight - dialogHeight - offset));
  
  return {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    transform: 'none',
    margin: 0,
  };
};

/**
 * 为表单对话框计算位置（较大的对话框）
 * @param {HTMLElement} anchorEl - 锚点元素
 * @returns {Object} 样式对象
 */
export const getFormDialogPosition = (anchorEl) => {
  return getDialogPosition(anchorEl, {
    dialogWidth: 600,
    dialogHeight: 500,
    offset: 20
  });
};

/**
 * 为确认对话框计算位置（较小的对话框）
 * @param {HTMLElement} anchorEl - 锚点元素
 * @returns {Object} 样式对象
 */
export const getConfirmDialogPosition = (anchorEl) => {
  return getDialogPosition(anchorEl, {
    dialogWidth: 400,
    dialogHeight: 200,
    offset: 20
  });
};

/**
 * 为通知对话框计算位置（中等大小的对话框）
 * @param {HTMLElement} anchorEl - 锚点元素
 * @returns {Object} 样式对象
 */
export const getNotificationDialogPosition = (anchorEl) => {
  return getDialogPosition(anchorEl, {
    dialogWidth: 350,
    dialogHeight: 150,
    offset: 15
  });
};

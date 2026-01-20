// components/confirm-dialog/confirm-dialog.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '确认操作'
    },
    content: {
      type: String,
      value: ''
    },
    confirmText: {
      type: String,
      value: '确认'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmColor: {
      type: String,
      value: '#0f3460'
    },
    cancelColor: {
      type: String,
      value: '#a0a0a0'
    }
  },

  methods: {
    onConfirm() {
      this.triggerEvent('confirm');
      this.setData({ show: false });
    },

    onCancel() {
      this.triggerEvent('cancel');
      this.setData({ show: false });
    },

    onMaskTap() {
      // 点击遮罩层不关闭，需要点击按钮
    }
  }
});

// components/toast/toast.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    message: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'info' // success, error, warning, info
    },
    duration: {
      type: Number,
      value: 2000
    }
  },

  data: {
    timer: null
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.startTimer();
      } else {
        this.clearTimer();
      }
    }
  },

  methods: {
    startTimer() {
      this.clearTimer();
      const timer = setTimeout(() => {
        this.setData({ show: false });
        this.triggerEvent('close');
      }, this.data.duration);
      this.setData({ timer });
    },

    clearTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.setData({ timer: null });
      }
    },

    onClose() {
      this.setData({ show: false });
      this.triggerEvent('close');
    }
  },

  lifetimes: {
    detached() {
      this.clearTimer();
    }
  }
});

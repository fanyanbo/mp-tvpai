
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toastDlgContents: {//对话弹窗标题、提示语及按钮名称
      type: Object,
      value: {
        title: {
          type: String,
          value: 'Title'
        },
        tips: {
          type: String,
          value: 'default dlg tips'
        },
        btnCancel: {
          type: String,
          value: 'Cancel'
        },
        btnConfirm: {
          type: String,
          value: 'Confirm'
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    triggerBtnCancel() {
      console.log("trigger cancel btn...");
      this.triggerEvent('toastdlgcancel', {});
    },
    triggerBtnConfirm() {
      console.log("trigger confirm btn...");
      this.triggerEvent("toastdlgconfirm", {});
    }
  }
})

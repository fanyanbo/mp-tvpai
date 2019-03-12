// components/toastPrompt/toastPrompt.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toastPromptContents:{//提示弹窗标题及按钮名称
      type:Object,
      value: {
        tips:{
          type: String,
          value: "default tips"
        },
        btnName:{
          type: String,
          value: "Confirm"
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
    triggerBtn(){
      console.log("toastPrompt trigger ...");
      this.triggerEvent("toastpromptevt", {})
    }
  }
})

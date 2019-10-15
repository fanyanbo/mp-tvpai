//用户相关api 测试代码
//todo 正式上线时删除

const user_package = require('./package');
const user_login = require('./login')
const user_pay = require('./pay')
const user_push = require('./push')

//push
user_push.getTVAcctInfo().then(res => console.log('getTVAcctInfo OK')).catch(err => console.error('getTVAcctInfo error'))
user_push.pushTvLogin().then(res => console.log('pushTvLogin OK')).catch(err => console.error('pushTvLogin error'))

//package
user_package.getProductSourceList().then(res => console.log('sourcelist OK')).catch(err => console.error('sourcelist error'))
user_package.getProductPackageList().then(res => console.log('productlist OK')).catch(err => console.error('productlist error'))
user_package.getAllowance().then(res => console.log('getAllowance OK')).catch(err => console.error('getAllowance error'))
user_package.getCoupones().then(res => console.log('getCoupones OK')).catch(err => console.error('getCoupones error'))

//pay
user_pay.genOrder().then(res => console.log('genOrder OK')).catch(err => console.error('genOrder error'))
user_pay.prePay()
  .then(res => {
    console.log('prePay OK')
    user_pay.startPay(res)
  })
  .catch(err => console.error('prePay error'))

//login
user_login.vcode('18138862527')
  .then( data => {
    user_login.mobLogin('18138862527', '610157')
  })
  .catch( err => console.error(err))
user_login.ccsubmit('15986809879', 'cc111111')

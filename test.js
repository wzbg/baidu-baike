/* 
* @Author: zyc
* @Date:   2016-02-18 14:39:14
* @Last Modified by:   zyc
* @Last Modified time: 2016-02-23 17:48:25
*/
'use strict'

const baike = require('./index')

// const query = 'seed'
// const query = '科技'
// const query = '太空'
// const query = '三体'
const query = 'Twitter'

baike(query).then(res => console.log(res)).catch(err => console.error(err))
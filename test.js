/* 
* @Author: zyc
* @Date:   2016-02-18 14:39:14
* @Last Modified by:   zyc
* @Last Modified time: 2016-02-22 23:03:33
*/
'use strict'

const baike = require('./index')

// const query = 'seed'
// const query = '科技'
// const query = '太空'
const query = '三体'

const result = baike(query)
console.log(result)

for (let content of result.contents) {
  console.log(content.title, content.content)
}
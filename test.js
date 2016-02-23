/* 
* @Author: zyc
* @Date:   2016-02-18 14:39:14
* @Last Modified by:   zyc
* @Last Modified time: 2016-02-23 14:26:25
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
  // console.log(content.title)
  // for (let con of content.content) {
  //   if (con.table) {
  //     console.log(con.type, con.table)
  //   }
  // }
}
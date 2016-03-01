/* 
* @Author: zyc
* @Date:   2016-02-18 14:39:14
* @Last Modified by:   zyc
* @Last Modified time: 2016-03-01 19:26:35
*/
'use strict'

const baike = require('./index')

// const query = 'seed'
// const query = '科技'
// const query = '太空'
// const query = '三体'
// const query = 'Twitter'
// const query = 'Android'
// const query = 'Nintendo'
// const query = 'Google'
// const query = 'Japan'
const query = 'Lamborghini'
// const query = 'CASABLANCA'

baike(query).then(res => {
  // console.log(res)
  // console.log(JSON.stringify(res))
  for (let content of res.contents) {
    // console.log(content.title)
    console.log(content.content)
    // for (let con of content.content) {
    //   if (con.name === 'table') {
    //     console.log(con.table)
    //   }
    // }
  }
}).catch(err => console.error(err))
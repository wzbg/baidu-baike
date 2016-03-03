/* 
* @Author: zyc
* @Date:   2016-02-18 14:06:33
* @Last Modified by:   zyc
* @Last Modified time: 2016-03-03 16:29:04
*/
'use strict'

const fetchUrl = require('fetch').fetchUrl
const cheerio = require('cheerio')
const isUrl = require('is-url')
const URL = require('url')

const base = 'http://baike.baidu.com/item/'

module.exports = query => (
  new Promise((resolve, reject) => {
    fetchUrl(isUrl(query) ? query : base + encodeURIComponent(query), (err, res, buf) => {
      if (err) return reject(err)
      const finalUrl = decodeURIComponent(res.finalUrl)
      if (finalUrl.endsWith('/error.html')) return reject(new Error('Not Found'))
      const $ = cheerio.load(buf)
      $('script,sup,.description,.album-list').remove() // 删除参考资料 & 描述 & 词条图册
      const result = {
        finalUrl, // 最终网址
        name: $('dd.lemmaWgt-lemmaTitle-title h1').text(), // 名称
        item: $('dd.lemmaWgt-lemmaTitle-title h2').text(), // 义项
        summary: $('div.lemma-summary').text().trim(), // 概要
        contents: [] // 内容
      }
      $('div.basic-info dl dt').each((index, element) => {
        result.basicInfo = result.basicInfo || [] // 基本信息
        result.basicInfo.push({
          name: $(element).text().replace(/\s+/g, ''),
          value: $(element).next().text().replace(/\s+/g, '')
        })
      })
      $('li.list-dot a,li.item a,li.item span').each((index, element) => {
        const node = $(element)
        const href = node.attr('href')
        result.items = result.items || [] // 义项
        result.items.push({
          name: node.text(),
          url: href ? URL.resolve(base, href) : finalUrl,
          current: href ? false : true
        })
      })
      $('span.taglist').each((index, element) => {
        result.tags = result.tags || [] // 词条标签
        result.tags.push($(element).text().replace(/\s+/g, ''))
      })
      const contents = []
      $('h2.para-title').each((index, element) => {
        const title = $(element).find('span.title-text').text()
        const content = []
        for (let node =  $(element).next(); node.get(0) && node.get(0).name !== 'h2'; node = node.next()) {
          content.push(getPara($, node))
        }
        contents.push({ title, content })
      })
      getPic($('div.summary-pic a').attr('href')).then(images => {
        result.images = images // 概要相册
        Promise.all(contents.map(content => (
          new Promise(resolve => {
            const title = content.title
            Promise.all(content.content).then(paras => {
              const content = []
              for (let para of paras) {
                if (para) content.push(para)
              }
              resolve({ title, content })
            })
          })
        ))).then(contents => {
          result.contents = contents
          if (result.contents.length) {
            return resolve(result)
          }
          const title = ''
          const content = []
          $('div.para').each((index, element) => {
            content.push(getPara($, $(element)))
          })
          Promise.all(content).then(paras => {
            const content = []
            for (let para of paras) {
              if (para) content.push(para)
            }
            result.contents.push({ title, content })
            resolve(result)
          })
        })
      })
    })
  })
)

const getPara = ($, node) => (
  new Promise(resolve => {
    const text = node.text().replace(/\s+/g, '')
    const para = { name: node.get(0).name }
    if (text) {
      if (para.name === 'table') {
        para.table = []
        node.find('tr').each((index, element) => {
          const tr = []
          para.table.push(tr)
          $(element).children().each((index, element) => {
            tr.push({
              name: element.name,
              text: $(element).text().replace(/\s+/g, '')
            })
          })
        })
      } else {
        para.text = text
      }
    }
    const promises = []
    node.find('a[href]').each((index, element) => {
      if (!$(element).find('img').length) return
      if (promises.length > 99) return
      promises.push(getPic($(element).attr('href')))
    })
    Promise.all(promises).then(images => {
      para.imgs = []
      for (let imgs of images) {
        for (let img of imgs) {
          para.imgs.push(img)
        }
      }
      resolve(text || para.imgs ? para : null)
    })
  })
)

const getPic = href => (
  new Promise(resolve => {
    if (!href) return resolve([])
    request(href).then($ => {
      if (!$) return resolve([])
      const pics = new Set()
      pics.add($('a.origin').attr('href'))
      if (!href.endsWith('ct=cover')) {
        return resolve(Array.from(pics))
      }
      const promises = []
      $('a.pic-item[href]').each((index, element) => {
        const origUrl = $(element).attr('href')
        promises.push(request(origUrl))
      })
      Promise.all(promises).then($$ => {
        for (let $ of $$) {
          pics.add($('a.origin').attr('href'))
        }
        resolve(Array.from(pics))
      })
    })
  })
)

const request = href => (
  new Promise(resolve => {
    fetchUrl(URL.resolve(base, href), (err, res, buf) => {
      resolve(buf ? cheerio.load(buf) : null)
    })
  })
)
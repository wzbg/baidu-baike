/* 
* @Author: zyc
* @Date:   2016-02-18 14:06:33
* @Last Modified by:   zyc
* @Last Modified time: 2016-02-23 22:46:58
*/
'use strict'

const fetchUrl = require('fetch').fetchUrl
const request = require('sync-request')
const cheerio = require('cheerio')
const URL = require('url')

const url = 'http://baike.baidu.com/item/'

module.exports = query => (
  new Promise((resolve, reject) => {
    fetchUrl(url + encodeURI(query), (err, res, buf) => {
      const finalUrl = decodeURI(res.finalUrl)
      if (finalUrl.endsWith('/error.html')) return reject(new Error(`[${query}] Not Found`))
      const $ = cheerio.load(buf)
      $('script,sup,.description,.album-list').remove() // 删除参考资料 & 描述 & 词条图册
      const result = {
        finalUrl, // 最终网址
        name: $('dd.lemmaWgt-lemmaTitle-title h1').text(), // 名称 
        item: $('dd.lemmaWgt-lemmaTitle-title h2').text(), // 义项
        summary: $('div.lemma-summary').text().trim(), // 概要
        images: getPic($('div.summary-pic a').attr('href')), // 概要相册
        contents: [] // 内容
      }
      $('div.basic-info dl dt').each((index, element) => {
        result.basicInfo = result.basicInfo || [] // 基本信息
        result.basicInfo.push({
          name: $(element).text().replace(/\s+/g, ''),
          value: $(element).next().text().replace(/\s+/g, '')
        })
      })
      $('li.item a,li.item span').each((index, element) => {
        const node = $(element)
        const href = node.attr('href')
        result.items = result.items || [] // 义项
        result.items.push({
          name: node.text(),
          url: href ? URL.resolve(url, href) : finalUrl,
          current: href ? false : true
        })
      })
      $('h2.para-title').each((index, element) => {
        const title = $(element).find('span.title-text').text()
        const content = []
        for (let node =  $(element).next(); node.get(0) && node.get(0).name !== 'h2'; node = node.next()) {
          const para = getPara($, node)
          if (para) content.push(para)
        }
        result.contents.push({ title, content })
      })
      if (!result.contents.length) {
        const title = ''
        const content = []
        $('div.para').each((index, element) => {
          const para = getPara($, $(element))
          if (para) content.push(para)
        })
        result.contents.push({ title, content })
      }
      $('span.taglist').each((index, element) => {
        result.tags = result.tags || [] // 词条标签
        result.tags.push($(element).text().replace(/\s+/g, ''))
      })
      resolve(result)
    })
  })
)

const getPara = ($, node) => {
  const text = node.text().replace(/\s+/g, '')
  const imgs = []
  node.find('a[href]').each((index, element) => {
    if (!$(element).find('img').length) return
    const href = $(element).attr('href')
    for (let img of getPic(href)) {
      imgs.push(img)
    }
  })
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
  if (imgs.length) para.imgs = imgs
  if (text || para.imgs) return para
}

const getPic = href => {
  const res = request('GET', URL.resolve(url, href))
  const $ = cheerio.load(res.body.toString())
  const pics = new Set()
  pics.add($('a.origin').attr('href'))
  if (href.endsWith('ct=cover')) {
    $('a.pic-item[href]').each((index, element) => {
      const origUrl = $(element).attr('href')
      const res = request('GET', URL.resolve(url, origUrl))
      const $$ = cheerio.load(res.body.toString())
      pics.add($$('a.origin').attr('href'))
    })
  }
  return Array.from(pics)
}
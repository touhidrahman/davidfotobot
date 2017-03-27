const fs = require('fs-extra')
const cheerio = require('cheerio')
const request = require('request')
const async = require('async')

// create assets dir if not available
var dir = './assets'
const base = 'http://davidfoto.com.ua/gallery/'
const gallery = 2
const url = base + gallery

if (!fs.existsSync(dir)) {
  console.log('assets directory not found, creating directory ...')
  fs.mkdirSync(dir)
}

const assetNames = []
// do work
request(url, function (err, response, body) {
  if (err) throw err

  const $ = cheerio.load(body)
  const links = $('.nu_center a img')
  links.each(function (i, elem) {
    const bits = elem.attribs.src.split('/')
    assetNames.push(bits[bits.length - 1].replace('_thumb', ''))
  })

  console.log('Found ' + assetNames.length + ' files')

  async.each(assetNames, function (name, callback) {
    // check file already exists 
    // if so, skip downloading
    let file = dir + '/' + name
    if (fs.existsSync(file)) {
      console.log('File ' + name + ' already exists! Skipping.')
    } else {
      console.log('Downloading... ' + name)
      request('http://davidfoto.com.ua/public/uploads/gallery/' + gallery + '/' + name).pipe(
        fs.createWriteStream(file)
      )
      callback()
    }
  }, function (err) {
    if (err) throw err
    console.log('Finished downloading ' + assetNames.length + ' files')
  })
})

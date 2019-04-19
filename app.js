const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const multer = require('multer')
const pdfFiller = require('pdffiller')
const app = express()

///working
app.use(cors())

app.use(express.static(path.resolve(__dirname, './client/build')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// app.use('/api/auth', auth)
// app.use('/api/coinbase', coinbase)

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage }).single('file')

//this created the initial document on the server
app.post('/create-pdf', async (req, res) => {
  upload(req, res, function(err) {
    // console.log(err)
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    // console.log('file', req.file)
    handlePdf(res, req.file)
    global.fileDact = req.file.filename
  })
})

//this fetches the document
app.get('/fetch-pdf', (req, res) => {
  res.sendFile(path.resolve(__dirname, `./output/${fileDact}`))
})

//this rebuilds the pdf after the text fields have been entered
app.post('/rebuild-pdf', async (req, res) => {
  let { data, file } = req.body
  console.log('body', req)
  upload(req, res, function(err) {
    // console.log(err)
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    // console.log('file', req.file)
    createPdf(res, data, file)
  })
})

//this handles grabbing the data out of the pdf and assinging numbers to hte fields
const handlePdf = (res, file) => {
  let { path } = file
  var sourcePDF = path

  // Override the default field name regex. Default: /FieldName: ([^\n]*)/
  var nameRegex = null

  var FDF_data = pdfFiller.generateFDFTemplate(sourcePDF, nameRegex, function(
    err,
    fdfData
  ) {
    if (err) throw err
    var n = 0
    for (var i in fdfData) {
      ++n
      fdfData[i] = n
    }
    // console.log(fdfData)
    createPdf(res, fdfData, file.filename)
    console.log('data dawg', fdfData)
  })
}

//this creates the actual PDF
const createPdf = (res, data, file) => {
  console.log('file', file)
  pdfFiller.fillForm(`public/${file}`, `./output/${file}`, data, function(err) {
    if (err) throw err
    return res.status(200).send({ data, file })
    console.log("In callback (we're done).")
  })
}

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

module.exports = app

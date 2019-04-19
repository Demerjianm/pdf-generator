import React, { useState } from 'react'
import axios from 'axios'

// const createAndDownloadPdf = () => {
//   axios.post('/api/auth/create-pdf', { hello: 'michael' })
// }

const App = () => {
  //this handles the values passed back from the original doc
  const [formValues, setValues] = useState(null)
  // this ahndles the generated text fields inputs
  const [values, setInputValues] = useState({})
  //this handles the file name passed nbacl
  const [fileName, setFile] = useState(null)
  const onChange = (name, value) => {
    console.log(name, value)
    setInputValues({ ...values, [name]: value })
  }

  //this send the original file down to the server
  const sendFile = file => {
    let data = new FormData()
    console.log(data)

    data.append('file', file)
    console.log(data)
    axios
      .post('/create-pdf', data)
      .then(function(res) {
        console.log(res)
        setValues(res.data.data)
        setFile(res.data.file)
        console.log('SUCCESS!!')
      })
      .then(() => axios.get('/fetch-pdf', { responseType: 'blob' }))
      .then(res => {
        const pdfBlob = new Blob([res.data], { type: 'application/pdf' })
        var fileURL = URL.createObjectURL(pdfBlob)
        window.open(fileURL)
      })
      .catch(function() {
        console.log('FAILURE!!')
      })
  }

  //this handles the file upload to the inpiut
  const handleFileUpload = event => {
    console.log(event.target)
    let file = event.target.files[0]
    console.log(file)
    sendFile(file)
  }

  //this handles rebuilding he file after the text fields have been completed
  const rebuildFile = () => {
    let body = { file: fileName, data: values }
    console.log(body)
    axios
      .post('/rebuild-pdf', body)
      .then(function(res) {
        console.log(res)

        console.log('SUCCESS!!')
      })
      .then(() => axios.get('/fetch-pdf', { responseType: 'blob' }))
      .then(res => {
        const pdfBlob = new Blob([res.data], { type: 'application/pdf' })
        var fileURL = URL.createObjectURL(pdfBlob)
        window.open(fileURL)
      })
      .catch(function() {
        console.log('FAILURE!!')
      })
  }
  console.log(formValues, fileName)
  console.log(values)
  return (
    <div>
      <h1>The Ultimate Document Builder</h1>
      <input type="file" onChange={handleFileUpload} />
      {formValues &&
        Object.keys(formValues).map((key, index) => (
          <div>
            {key}
            <input
              // name={key}
              value={values[key]}
              onChange={event => {
                event.preventDefault()
                onChange(key, event.target.value)
              }}
            />
          </div>
        ))}
      <button onClick={rebuildFile}>Re build New Form</button>
    </div>
  )
}

export default App

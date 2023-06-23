require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')

const PORT = process.env.PORT

app.use(express.json())



app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})


app.post('/api/notes', (request, response) => {
  const body = request.body

  const newNote = new Note({
    content: body.content,
    important: body.important || false,
  })

  newNote.save().then(result => {
    console.log('note saved!')
    response.json(result)
  }).catch(error => next(error))
})


app.get('/api/notes', (req, res) => {
  Note.find({}).then(result => {
    console.log(result)
    res.json(result)
  })
})


app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id).then(note => {
    if (note) {
      response.json(note)
    }
    else {
      response.status(404).end()
    }
  }).catch(err => next(err))
})

app.put('/api/notes/:id', (request, response, next) => {

  const { content, important } = request.body

  Note.findByIdAndUpdate(
    request.params.id,

    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })

  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan((tokens,request,response) => {
  let format = [
    tokens.method(request,response),
    tokens.url(request,response),
    tokens.status(request,response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms'
  ]

  if (request.method === 'POST'){
    format = format.concat([JSON.stringify(request.body)])
  }

  return format.join(' ')
}))

app.get('/',(request,response) => {
  response.send('<h1>Hello</h1>')
})

app.get('/api/persons', (request, response,next) => {
  Person.find({})
    .then(persons => {
      response.send(persons)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (request,response,next) => {
  Person.countDocuments({})
    .then(result => {
      const peopleString = `Phonebook has info for ${result} people`
      const dateTimeString = `${Date()}`
      const infoString = `${peopleString}<br/><br/>${dateTimeString}`
      response.send(infoString)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (request,response,next) => {
  const person_id = request.params.id
  Person.findById(person_id)
    .then(person => {
      if(person !== null) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request,response,next) => {
  const person_id = request.params.id
  Person.findByIdAndDelete(person_id)
    .then(() => {
      response.statusMessage = 'Deleted'
      response.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (request,response,next) => {
  // new_id = Math.floor(Math.random() * 65536)

  // if(!request.body.name){
  //     return response.status(404).send({error: 'person has no name'})
  // }
  // else if(!request.body.number){
  //     return response.status(404).send({error: 'person has no number'})
  // }
  // else if(persons.find(person => person.name === request.body.name)){
  //     return response.status(404).send({error: 'name already exists in phonebook'})
  // }

  const new_person = new Person({
    name: request.body.name,
    number: request.body.number,
  })

  new_person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  console.log('get works')
  Person.findByIdAndUpdate(request.params.id, request.body, {
    new: true, runValidators: true
  })
    .then(person => {
      console.log(person)
      if (person === null) {
        return response.status(404).end()
      }
      response.json(person)
    })
    .catch(error => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  if(error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformed id'
    })
  }
  if(error.name === 'ValidationError') {
    console.log('ValidationError')
    return response.status(400).json({
      error: error.message
    })
  }
  console.log('Error: ',error.message)
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`)
})
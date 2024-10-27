const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Password required')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@learn.oxmfu.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Learn`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const argc = process.argv.length

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person',personSchema)

if (argc > 3){
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(() => {
    console.log(`added ${person.name} ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}
else {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
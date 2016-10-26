const http = require('http')
const Bot = require('messenger-bot')

var bot = new Bot({
  token: 'EAATSm02f8EIBADcHQ3GSpvXvrFHsIJoXb2MQSiOKEDvibdyZCfMwaWNu5YAbmXBBELj65QsgrqOlZB4pgZCZCTfZCRPHBJFRTo43Rpb0FYIxbUVSZAnOqAFgmTLcmj4Cncd4A2hrs48DJx3sQGlkRnKOv1E9kZATYYiykjQ6L5JgQZDZD',
  verify: 'nande'
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  var text = payload.message.text + "!"

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name}               ${profile.last_name}: ${text}`)
    })
  })
})


http.createServer(bot.middleware()).listen(8080)
console.log('Echo bot server running at port 8080.')
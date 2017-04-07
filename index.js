'use strict'
const http = require('http');
const request = require('request');
const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const JexiaClient = require ('jexia-sdk-js').JexiaClient;
const expr = express();
const PAGE_ACCESS_TOKEN = 'EAATSm02f8EIBAE9FEhKFLjf7t8GTUxv3F2sch4kdiyt7fBiH5xV63TvlXsVfPumlKwbO8pQNlO7pVm25bVVOPn8ZAg4wp92YdMJZAO2i1C3e9S98rFC3OnMSChixmQzZAQ1xX2OKwmoYJN7RyrbLn39LtwAZAZAMmsaFP9DM7xgZDZD';
const HELP_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_HELP";
const FAQ_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_FAQ";
const DATA_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_DATA";
//var token;

expr.set('port', (process.env.PORT || 8080))
expr.use(bodyParser.urlencoded({extended: false}))
expr.use (bodyParser.json())
expr.get('/webhook', function(req, res){

  if(req.query['hub.verify_token'] === 'nande'){
    res.send(req.query['hub.challenge'])

  }
  res.send('Error, wrong token')
})
expr.listen(expr.get('port'), function(){

  console.log('running on port', expr.get('port'))
})


//Make data exchange between App and Facebook over the webhook possible
expr.post('/webhook', function (req, res) {
  var data = req.body;


 // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostbackMenu(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageReadConfirmation(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200).send;
  }
});


//Initialize Jexia Client
function initializeJexia() {
  var client = new JexiaClient({
      appId: '227f06b0-0e42-11e7-ae5d-89b2a570b795',
      appKey: '3b99952cd9ae9deea80fb27e2010710b',
      appSecret: 'f04ef99f9ecd872911fe53ed70ff96a04cf2f29f4017ffdf'
  });
  return client
}


//Message was delivered to the user
function receivedDeliveryConfirmation(messagingEvent) {
   var senderID = messagingEvent.sender.id;
   console.log('Received delivery confirmation from id: ', senderID)
}

//Received a payload
function receivedPostbackMenu(messagingEvent, userid){
  var senderID = messagingEvent.sender.id
  var payload = messagingEvent.postback.payload

  if(payload){
    var client = initializeJexia()
    client.then(function(app){
      var userRecord = getJexiaUserRecord(app, senderID);

      var userRec = userRecord.then(function(data){
      var jexiaRecordId = data.id;

      var deleteRecord = deleteJexiaRecord(app, userid, jexiaRecordId)
      var deleteRec = deleteRecord.then(function(data){
     	console.log("record was deleted")
     })

      searchAgain(senderID);


      }).catch(function(e){
        sendTextMessage(senderID, "Something went wrong")
        console.log(e)


      });


    })

  }
}
//Message was read by the user
function receivedMessageReadConfirmation(messagingEvent) {
   var senderID = messagingEvent.sender.id;
   console.log('Received message read confirmation from id: ', senderID)
}

//A message was received .
function receivedMessage(messagingEvent) {
  var senderID = messagingEvent.sender.id;
  var recipientID = messagingEvent.recipient.id;
  var timeOfMessage = messagingEvent.timestamp;
  var message = messagingEvent.message;
  var messageText = message.text;


    console.log('Received a message for user %d and page %d at %d with message:', senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    if (messageText == 'help') {
      showHelp(senderID)
      return
    } 
    if(messageText == 'no'){
      sendGoodBye(senderID)
      return
    }


    var client = initializeJexia()
    client.then(function(app){
      if (messageText == 'show history') {
        showHistory(app, senderID)
      } else {
        fillFirstEmptyJexiaField(app, senderID, messageText); 
      }
    });     
}


function sendGenericMessage(recipientId, message) {
  

  var messageData = {
    recipient: {
      id: recipientId
    },
    message
  };
  

  callSendAPI(messageData);
}




function createSearchResultMessage(data) {
  var length = data.length;
  var elements = [];
  for (var i = 0; i < length; i++) {
        var link = data[i].link;
        var image = data[i].image_url;
        var title = data[i].title;

        elements.push({
            title: title,
            image_url: image,
            buttons: [{
              type: "web_url",
              url: link,
              title: "Open Web URL"
            },
            {
              type: "postback",
              payload: "new search" ,
              title: "New Search"
            }

            ]
          });
  }

  var message = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: elements
      }
    }
  }

  return message;
}


function sendTextMessage(recipientId, messageText){

  var messageData = {

    'recipient': {
      'id':recipientId

    },
    'message': {
      'text': messageText
    }
  };

  callSendAPI(messageData);

}


//question 1
function sendGreetingMessage(senderID){

      sendTextMessage(senderID, "Hi I am your Real Estate assistent, I am here to help you find a suitable property. Please give me the name of the city you want me to look");

}

function sendWelcomeBack(senderID){

      sendTextMessage(senderID, "Welcome back ")

}
//question 2
function sendLocationMessage(senderID){

    sendTextMessage(senderID, "Please give me the name of the city you want me to look")

}
//question 3
function sendPropertyTypeMessage(senderID){

   sendTextMessage(senderID, "Are you looking for an appartment, house or studio?")
}
//question 4
function sendRoomNumberMessage(senderID){

  sendTextMessage(senderID, "What is the minimal amount of rooms your property should have?")
}
//question 5
function sendMaxPriceMessage(senderID){

  sendTextMessage(senderID, "What is your maximum price?")
}

//say start
function sendStartMessage(senderID){
  sendTextMessage(senderID, "Type start to make me start searching")
}
//search
function sendResultMessage(senderID){
  sendTextMessage(senderID, "I found results for you")
}

//Can't find a record
function sendNoRecord(senderID){
  sendTextMessage(senderID, "Sorry I couldn't find any result")
}
//Search again
function searchAgain(senderID){
  sendTextMessage(senderID, "Do you want to search again?")
}
//Say GoodBye
function sendGoodBye(senderID){
  sendTextMessage(senderID, "OK Bye Bye")
}



//callsendAPI calls the Send API
function callSendAPI(messageData) {
  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': {access_token: PAGE_ACCESS_TOKEN},
    'method': 'POST',
    'json': messageData

  }, function(error, response, body){

    if(!error && response.statusCode == 200){

      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      console.log("successfully sent message with id &s to recipient %s", messageId, recipientId);
    }else{
    
      console.error(error);
    }
  });
}


function showHistory(app, userid) {
  sendTextMessage(userid, "In the future, a list of recent searches will be shown here.");
}

function showHelp(userid) {
  sendTextMessage(userid, "help: This help.\nshow history: Show recent searches.\n(default): Fill search field.");
}


//Check first empty field
function fillFirstEmptyJexiaField(app, userid, message) {

  var promise = getJexiaUserRecord(app, userid);
  promise.then(function(data){  
    if(data == undefined) {
      sendGreetingMessage(userid);
      createJexiaUserRecord(app, userid);
      return;
    }

    var userRecorddata = data.user_id;
    var userRecordPostcode = data.postcode;
    var userRecordType = data.type;
    var userRecordRooms = data.rooms;
    var userRecordPrice = data.price;
    var jexiaRecordId = data.id;
    console.log("userRecordPostcode" + userRecordPostcode)
    console.log("userRecordType" + userRecordType)
    console.log("userRecordRooms" + userRecordRooms)
    console.log("userRecordPrice" + userRecordPrice)


  if((userRecordPostcode == undefined) || (userRecordPostcode == null)){
    storePostcode(app, userid, message, jexiaRecordId);
    sendPropertyTypeMessage(userid);


    }else if((userRecordType == undefined) || (userRecordType == null)){

      storePropertyType(app, userid, message, jexiaRecordId)
      sendRoomNumberMessage(userid)

    }else if((userRecordRooms == undefined) || (userRecordRooms == null)){
      storeRoomNumber(app, userid, message, jexiaRecordId)
      sendMaxPriceMessage(userid);


    }else if ((userRecordPrice == undefined) || (userRecordPrice == null)){
      storeMaxPrice(app, userid, message, jexiaRecordId)
      sendStartMessage(userid);

    }else {

      var promise = startSearch(app, userid, userRecordPostcode, userRecordType, userRecordRooms, userRecordPrice)
      promise.then(function(data){

        if(data.length == 0){
          sendNoRecord(userid);
          deleteJexiaRecord(app, userid, jexiaRecordId)
          searchAgain(userid);
          return

        }

        console.log("I found this" + JSON.stringify(data))

        sendResultMessage(userid)          
        var message = createSearchResultMessage(data)
        sendGenericMessage(userid, message)
        storeFinalUserData(app, userid, userRecordPostcode, userRecordType, userRecordRooms, userRecordPrice);


      
      }).catch(function(e){
          console.log("Something went wrong: " + e)
          sendGenericMessage(userid, "I've made a mistake. I'm sorry.")
      })


    }
  });
}


//Delete the user Record
function deleteJexiaRecord(app, userid, jexia_id){

   return new Promise (function(resolve, reject){

    var messages = app.dataset('User');
    messages
      .delete(jexia_id)
      .then(function(message) {
        var userRecord = JSON.stringify(message)
        resolve(userRecord[0]);
    });
  });

}


//Get the Jexia record for the user
function getJexiaUserRecord(app, userid){
  return new Promise (function(resolve, reject){
    var users = app.dataset('User');
    users
      .query({
        user_id: userid
      })
      .then(function(message) {
        console.log("this is the body" + JSON.stringify(message))
        resolve(message[0]);
      });
  });
}

//create a record and store userid in Jexia.
function createJexiaUserRecord(app, userid){
  var useridasstring = userid.toString()

  var messages = app.dataset('User');
  messages    
    .create({
        'user_id':useridasstring
    })
    .then(function(message) {
      var userRecord = JSON.stringify(message[0])
      console.log(userRecord);
    });
}
//Store final user data
function storeFinalUserData(app, userid, postcode, type, rooms, price){

 
  var messages = app.dataset('History');
  messages
    .create({
        'user_id': userid,
        'city': postcode,
        'price': price,
        'type': type,
        'rooms': rooms
    })
    .then(function(message){
      var finalRecord = JSON.stringify(message[0])
      console.log(finalRecord);

    });


}



//Store Postcode field
function storePostcode(app, userid, messageText, jexia_id){

  var messages = app.dataset('User');

  messages
    .update(jexia_id, {
        'postcode':messageText
    })
    .then(function(message) {

        console.log(message);
    });
}

//Store the property type
function storePropertyType(app, userid, messageText, jexia_id){

  var messages = app.dataset('User');

  messages
    .update(jexia_id, {
        'type':messageText
    })
    .then(function(message) {
        console.log(message);
    });
}

//Store Room Number 
function storeRoomNumber(app, userid, messageText, jexia_id){

  var messages = app.dataset('User');

  messages
    .update(jexia_id, {
        'rooms':messageText
    })
    .then(function(message) {
        console.log(message);
    });
}

//Store Max Price
function storeMaxPrice(app, userid, messageText, jexia_id){
  var data = {'price': messageText}

  var messages = app.dataset('User');
  messages
    .update(jexia_id, {
        'price': messageText

    })
    .then(function(message) {
        console.log(message);
    });
}



//Start searching for houses.
function startSearch(app, userid, postcode, type, rooms, price){

  return new Promise(function (resolve, reject){

  var messages = app.dataset('Property');
  messages
      .query({
          where: {
            'price' : {"<=": price },
            'type': type,
            'postcode': postcode
          }
      })
      .then(function(propertyRecord) {

        console.log("this is the body of startSearch" + propertyRecord)
        resolve(propertyRecord);
      });
    });
}
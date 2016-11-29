'use strict'
const http = require('http');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PAGE_ACCESS_TOKEN = 'EAATSm02f8EIBAGswWyy7ZCQVy3BvtVMedw6pYZAQMy5kIdrpvyDNWvw2ZAKcbW9OlyQPNFSu6YoGKHPdMJ4IwZAMr1dZCHU5CczZCEGQUWd9ZAKZC4HDnEA3HpODEZBQ6kBwtIZAF7ANFcBFjtFROZChQpH5C4XoM4UyYZBIDiF9j96OTAZDZD';
const HELP_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_HELP";
const FAQ_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_FAQ";
const DATA_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_DATA";
var token;
var text;
var prop_city;
var prop_type;
var prop_rooms;
var prop_price;
var jexia_user_id;

app.set('port', (process.env.PORT || 8080))
app.use(bodyParser.urlencoded({extended: false}))
app.use (bodyParser.json())
app.get('/', function(req, res){
  res.send(req.query['hub.challenge'])

})

//Make data exchange between App and Facebook over the webhook possible
app.post('/webhook', function (req, res) {
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
    res.sendStatus(200);
  }
});


app.get('/webhook', function(req, res){

  if(req.query['hub.verify_token'] === 'nande'){
    res.send(req.query['hub.challenge'])

  }
  res.send('Error, wrong token')
})
app.listen(app.get('port'), function(){

  console.log('running on port', app.get('port'))
})


  

//Authentication Jexia
function getAuth(callback){

var headers = {
  key:'79514f8aa35fb6d41723f08ef044d699', 
  secret:'308d06f94e966e5dadee5afdcfe94b7c1e2bfbe260d193a7'

}

var options = {
url:' https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com ',
method: 'POST',
form: headers 
}


  function callBack(error, response, body){

     
   var body = JSON.parse(body);

   token = body.token;
   var refreshtoken = body.refresh_token
   console.log("token" + token);
   console.log("refreshtoken" + refreshtoken)
  
  
    }
    request(options, callBack)

}

getAuth();



//Creating and posting menu items 
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/json" -d'
}

var menu_object = {
  "setting_type" : "call_to_actions",
  "thread_state" : "existing_thread",
  "call_to_actions":[
    {
      "type":"postback",
      "title":"Help",
      "payload":HELP_BUTTON
    },
  {
    "type":"postback",
    "title":"FAQ",
    "payload":FAQ_BUTTON
  },
  {
    "type":"postback",
    "title":"Data",
    "payload":DATA_BUTTON
  }
  ]
}
var options = {
  url: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + PAGE_ACCESS_TOKEN,
  method: 'POST',
  headers: headers,
  form: menu_object
}
request(options, function (error, response, body){
  if(!error && response.statusCode == 200){
    //print response body
    console.log(body);
  }

})



//Authentication was received
function receivedAuthentication(messagingEvent) {
  var senderID = messagingEvent.sender.id;
   console.log('Received authentication from id: ', senderID)
}


//A message was received and echoed.
function receivedMessage(messagingEvent) {
  var senderID = messagingEvent.sender.id;
  var recipientId = messagingEvent.recipient.id;

   console.log('Received a message from id: ', senderID + recipientId)
    let message = messagingEvent.message;
    text = messagingEvent.message.text.toLowerCase();
    console.log("Dit is de tekst" + text)
    var senderID = messagingEvent.sender.id;
    
     function handleUserInput(){


        if (text && message) {
        var greets = ['hi', 'hello', 'hi there', 'good morning', 'good afternoon', 'good evening'] 
        var city = ['nijmegen', 'amsterdam', 'arnhem']
        var type = ['appartment', 'house', 'studio']
        var rooms = ['1' , '2' , '3', '4' , '5', '6', '7']
        var price = ['250000', '350000', '450000']
           if(greets.indexOf(text) > -1) {
           sendMessage(senderID, "Hi I am your Real Estate assistent, please let me know in which city you are looking for a place");
           }else if (city.indexOf(text) > -1){
            prop_city = text;

            sendMessage(senderID, "So you are looking for a place in " + text + ".Tell me if you are looking for appartment, studio or house")  
           }else if (type.indexOf(text) > -1){
            prop_type = text;
            //console.log("property_type" + prop_type)
            sendMessage(senderID, "You are looking for " + text + "Tell me the number of rooms your ideal place should have")
           }else if(rooms.indexOf(text) > -1){
            prop_rooms = text;

            sendMessage(senderID, "The number of rooms is "  + text + " What would be your maximum price?")

           }else if(price.indexOf(text) > -1){
            prop_price = text;

            sendMessage(senderID, "Ok, I have got that, let me see what I can find for you...")
             var data = {user_id:senderID, city:prop_city, type:prop_type, rooms:prop_rooms, price:prop_price};
             var headers = {
            'Authorization':'Bearer ' + token
              }
              var options = {
              url: 'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/User',
              headers: headers,
              form: data
              };


             // Store the user_id and the message in Jexia.
            request.post(options, callbackUserId)

           }else{
            sendMessage(senderID, "Sorry I am not that smart yet, no sentences please, only give me the name of city, type of house and number of rooms")

           }

        }
        


     } 




     handleUserInput();


   


   //Get user Data from Jexia
  function getUserData(userid){

  var headers = {
    'Authorization':'Bearer ' + token
    }
  var options = {

    url: 'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/user?user_id=' + userid,
    method: 'GET',
    headers: headers
    
  }
  request.get(options, userDataCallBack)
  }

  function userDataCallBack(error, response, body){


   jexia_user_id = response ;

   console.log("USERID" + JSON.stringify(jexia_user_id));

    console.log("SENDERID" + senderID);

  }




getUserData('1197247203681649');


}




function callbackUserId(error, response, body){
    if(!error && response.statusCode == 200){
          var body = body

      }else{

          console.log("this is the body" + body)

      }

  } 


//Message was delivered to the user
function receivedDeliveryConfirmation(messagingEvent) {
  var senderID = messagingEvent.sender.id;
   console.log('Received delivery confirmation from id: ', senderID)
}

//Message was read by the user
function receivedMessageReadConfirmation(messagingEvent) {
  var senderID = messagingEvent.sender.id;
   console.log('Received message read confirmation from id: ', senderID)
}

//Postback for the menu 
function receivedPostbackMenu(messagingEvent) {
  var senderID = messagingEvent.sender.id;
    console.log('Received postback from id: ', senderID)

    var payload = messagingEvent.postback.payload
    console.log("This is the payload" + payload)

    if(payload == HELP_BUTTON) {
      console.log('Help button pushed for user ' + senderID);
      var text = "This messenger bot helps you find properties for sale based on your needs. Please tell me the city where you are looking for a property";
      sendMessage(senderID, text);

    } else if(payload == FAQ_BUTTON) {
      console.log('FAQ button pushed for user ' + senderID);
      sendGenericMessage(senderID);
      
    } else if(payload == DATA_BUTTON) {
      console.log('Data button pushed for user ' + senderID);
      getUserData(senderID);
    }
}

//send a message to the user
function sendMessage(recipientId, messageText) {
    var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}


//send a generic template with picture and some buttons
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}




function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}




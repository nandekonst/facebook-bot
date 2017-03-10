'use strict'
const http = require('http');
const request = require('request');
const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const app = express();
const querystring = require('query-string');
const PAGE_ACCESS_TOKEN = 'EAATSm02f8EIBAE9FEhKFLjf7t8GTUxv3F2sch4kdiyt7fBiH5xV63TvlXsVfPumlKwbO8pQNlO7pVm25bVVOPn8ZAg4wp92YdMJZAO2i1C3e9S98rFC3OnMSChixmQzZAQ1xX2OKwmoYJN7RyrbLn39LtwAZAZAMmsaFP9DM7xgZDZD';
const HELP_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_HELP";
const FAQ_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_FAQ";
const DATA_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_DATA";
var token;

app.set('port', (process.env.PORT || 8080))
app.use(bodyParser.urlencoded({extended: false}))
app.use (bodyParser.json())


app.get('/webhook', function(req, res){

  if(req.query['hub.verify_token'] === 'nande'){
    res.send(req.query['hub.challenge'])

  }
  res.send('Error, wrong token')
})
app.listen(app.get('port'), function(){

  console.log('running on port', app.get('port'))
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
    res.sendStatus(200).send;
  }
});


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

//A message was received .
function receivedMessage(messagingEvent) {
  var senderID = messagingEvent.sender.id;
  var recipientID = messagingEvent.recipient.id;
  var timeOfMessage = messagingEvent.timestamp;
  var message = messagingEvent.message;
  var messageText = message.text;
  



  console.log('Received a message for user %d and page %d at %d with message:', senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  fillFirstEmptyJexiaField(senderID, messageText);


    
  }


function sendGenericMessage(recipientId, result, image, title) {
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
            title: title,
            image_url: image,
            buttons: [{
              type: "web_url",
              url: result,
              title: "Open Web URL"
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
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
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
      //var senderID = senderID;

      sendTextMessage(senderID, "Hi I am your Real Estate assistent, I am here to help you find a suitable property. Please give me the postcode of the city you want me to look");

}

function sendWelcomeBack(senderID){
      //var senderID = senderID

      sendTextMessage(senderID, "Welcome back ")

}
//question 2
function sendLocationMessage(senderID){
    //var senderID = senderID;

    sendTextMessage(senderID, "Please give me the postcode of the city you want me to look")

}
//question 3
function sendPropertyTypeMessage(senderID){

   sendTextMessage(senderID, "Are you looking for an appartment, house or studio?")
}
//question 4
function sendRoomNumberMessage(senderID){

  sendTextMessage(senderID, "How many rooms should your property have?")
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
  sendTextMessage(senderID, "I found this result for you")
}

//Can't find a record
function sendNoRecord(senderID){
  sendTextMessage(senderID, "Sorry I couldn't find any result")
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
      //console.error("Unable to send message");
      //console.error(response);
      console.error(error);
    }
  });
}


//Authentication Jexia
function getAuth(callback){

var headers = {
  'key':'79514f8aa35fb6d41723f08ef044d699', 
  'secret':'308d06f94e966e5dadee5afdcfe94b7c1e2bfbe260d193a7'

}

var options = {
'url':' https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com ',
'method': 'POST',
'form': headers 
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

//Cfheck first empty field
function fillFirstEmptyJexiaField(userid, message) {

 var userRecord = getJexiaUserRecord(userid);
  
   var userRec = userRecord.then(function(data){
  
      if(data[0] == undefined) {
        sendGreetingMessage(userid);
        createJexiaUserRecord(userid);
        return;
      }

      var userRecorddata = data[0].user_id;
      var userRecordPostcode = data[0].postcode;
      var userRecordType = data[0].type;
      var userRecordRooms = data[0].rooms;
      var userRecordPrice = data[0].price;
      var jexiaRecordId = data[0].id;
      console.log("userRecordPostcode" + userRecordPostcode)
      console.log("userRecordType" + userRecordType)
      console.log("userRecordRooms" + userRecordRooms)
      console.log("userRecordPrice" + userRecordPrice)


    if(userRecordPostcode == undefined){
      storePostcode(userid, message, jexiaRecordId);
      sendPropertyTypeMessage(userid);


      }else if(userRecordType == undefined){

        storePropertyType(userid, message, jexiaRecordId)
        sendRoomNumberMessage(userid)

      }else if(userRecordRooms == undefined){
        storeRoomNumber(userid, message, jexiaRecordId)
        sendMaxPriceMessage(userid);


      }else if (userRecordPrice == undefined){
        storeMaxPrice(userid, message, jexiaRecordId)
        sendStartMessage(userid);

      }else {


        var result = startSearch(userid, userRecordPostcode, userRecordType, userRecordRooms, userRecordPrice)
        var endresult = result.then(function(data){
        var resultrecord = data[0].link;
        var resultimg = data[0].image_url;
        var result_title = data[0].title;
        sendResultMessage(userid, resultrecord)
        
          sendGenericMessage(userid, resultrecord, resultimg, result_title)          
        
          console.log("I found this" + JSON.stringify(data))
 
        
        }).catch(function(e){
            sendNoRecord(userid, message)

        })


      }

  })


}

//Get the Jexia record for the user
function getJexiaUserRecord(userid){

  return new Promise(function (resolve, reject){

    request({
      url:'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/user?user_id=' + userid,
      method:'GET',
      json:true,
      headers: {'Authorization': 'Bearer ' + token}

    }, function(error, response, body){
        if(error){

          console.log(error)
        }if(body.length === 0){
          resolve(body);

        }else{
           var userRecord = body
           console.log("this is the body" + userRecord)
           resolve(userRecord);

        }
   })
  })
}



//create a record and store userid in Jexia.
function createJexiaUserRecord(userid){
    var useridasstring = userid.toString()
    var data = {'user_id': useridasstring}  
    var headers = {
    'Authorization': 'Bearer ' + token
    }

    var options = {
    'url': 'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/User',
    'headers': headers,
    'form': data
    };


    
    request.post(options, getJexiaRecordCallback)

    function getJexiaRecordCallback(error, response, body){

      var jexia_user_id = JSON.parse(body)
      console.log(jexia_user_id);
    }
    

}


//Store Postcode field
function storePostcode(userid, messageText, jexia_id){

  var data = {'postcode':messageText}
  var headers = {
      'Authorization': 'Bearer ' + token
    }
    var options = {
      'url':'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/User/' + jexia_id,
      'headers': headers,
      'form': data
    };

    request.put(options, function(err, response, body){

      console.log(body)
    })


}
//Store the property type
function storePropertyType(userid, messageText, jexia_id){

  var data = {'type': messageText}
  var headers = {
      'Authorization': 'Bearer ' + token
    }
    var options = {
      'url':'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/User/' + jexia_id,
      'headers': headers,
      'form': data
    };

    request.put(options, function(err, response, body){

      console.log(body)

    })

  }

//Store Room Number 
function storeRoomNumber(userid, messageText, jexia_id){

  var data = {'rooms': messageText}
  var headers = {
      'Authorization': 'Bearer ' + token
  }
  var options = {
    'url':'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/User/' + jexia_id,
    'headers': headers,
    'form': data
  };

  request.put(options, function(err, response, body){

      console.log(body)
  })


}

//Store Max Price
function storeMaxPrice(userid, messageText, jexia_id){
  var data = {'price': messageText}
  var headers = {
      'Authorization': 'Bearer ' + token
  }
  var options = {
     'url': 'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/User/' + jexia_id,
     'headers': headers,
     'form': data

  };

  request.put(options, function(err, response, body){
      
      console.log(body)
  })

}

//Start searching for houses.
function startSearch(userid, postcode, type, rooms, price){

  var searchresult = [];
  var url = 'https://afe21f70-58ac-11e6-9400-bf08cc0779e0.app.jexia.com/Property?where={"price" : {"<=":"'+ price +'"}, "type":"'+ type +'", "postcode":"' + postcode +'"}'
  //var query = querystring.stringify({postcode:[postcode], type:[type], rooms:[rooms], price:[price]})
  console.log("This is the query" + url)

return new Promise(function (resolve, reject){

    request({
      url:url, 
      method:'GET',
      json:true,
      headers: {'Authorization': 'Bearer ' + token}

    }, function(error, response, body){
        if(error){

          console.log(error)

        }if(body.length === 0){
          resolve(body);


        }else{
           var propertyRecord = body

                console.log("this is the body of startSearch" + propertyRecord)

                resolve(propertyRecord);

            }
            
           
        
   })
  })


}


'use strict'
const http = require('http');
const request = require('request');
const express = require('express');
const rp = require('request-promise');
var Promise = require('promise'); 
const bodyParser = require('body-parser');
const app = express();
const PAGE_ACCESS_TOKEN = 'EAATSm02f8EIBAE9FEhKFLjf7t8GTUxv3F2sch4kdiyt7fBiH5xV63TvlXsVfPumlKwbO8pQNlO7pVm25bVVOPn8ZAg4wp92YdMJZAO2i1C3e9S98rFC3OnMSChixmQzZAQ1xX2OKwmoYJN7RyrbLn39LtwAZAZAMmsaFP9DM7xgZDZD';
const HELP_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_HELP";
const FAQ_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_FAQ";
const DATA_BUTTON = "DEVELOPER_DEFINED_PAYLOAD_FOR_DATA";
var token;

var EmptyFieldEnum = {

  noEmptyField : 0,
  locationField : 1, 
  propertyTypeField : 2,
  roomNumberField : 3,
  maxPriceField : 4,

}


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



  





  
 //var emptyField = getFirstEmptyField(userRecord);
  


  /*switch (emptyField){
    case locationField:
      if(!checkLocationValue(messageText))
        sendLocationMessage(senderID);
      else {
        storeLocation(messageText);
        sendPropertyTypeMessage(senderID);
      }
    break;
    case propertyTypeField:
      sendPropertyTypeMessage(senderID);
    break;
    case roomNumberField:
      sendRoomNumberMessage(senderID);
    break;
    case maxPriceField:
      sendMaxPriceMessage(senderID);
    break;
    case noEmptyField:
    break;
  }*/

  //var messageId = message.mid;
  //var messageAttachments = message.attachments;


    

    /*if(messageText){
      //if we receive a text message, check to see if it matches a keyword and send back the example,
      //otherwise just echt the text we received.
      switch (messageText){
        case 'generic':
          sendGenericMessage(senderID);
          break;
        default:
          sendTextMessage(senderID, messageText);
      }

    } else if (messageAttachments){
          sendTextMessage(senderID, "Message with attachment received");
    }*/
    






function sendGenericMessage(recipientId, messageText){
  sendTextMessage(senderID, "This is a generic message")
  console.log("this is a generic message")
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

      sendTextMessage(senderID, "Hi I am your Real Estate assistent, I am here to help you find a suitable property. Please give me the postcode of the city you want me to look ");

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
  //var senderID = senderID;

   sendTextMessage(senderID, "Are you looking for an appartment, house or studio?")
}
//question 4
function sendRoomNumberMessage(senderID){
  //var senderID = senderID;

  sendTextMessage(senderID, "How many rooms should your property have?")
}
//question 5
function sendMaxPriceMessage(senderID){
  //var senderID = senderID;

  sendTextMessage(senderID, "What is your maximum price?")
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


function fillFirstEmptyJexiaField(userid, message) {

 var userRecord = getJexiaUserRecord(userid);
  
   var userRec = userRecord.then(function(data){
  
      if(data[0] == undefined) {
        console.log("userRecorddata ID is an empty field")
        sendGreetingMessage(userid);
        createJexiaUserRecord(userid);
        return;
      }else{
      		sendLocationMessage(userid);

      }

      var userRecorddata = data[0].user_id;
      var userRecordPostcode = data[0].postcode;
      var userRecordType = data[0].type;
      var userRecordRooms = data[0].rooms;
      var userRecordPrice = data[0].price;
      var jexiaRecordId = data[0].id;

      console.log("userRecordPostcode" + userRecordPostcode)
      console.log("userRecorddata"+ userRecorddata)
      console.log("userRecordType" + userRecordType)
      console.log("userRecordRooms" + userRecordRooms)
      console.log("userRecordPrice" + userRecordPrice)
      console.log("Jexia Record ID" + jexiaRecordId)

  

	  if(userRecordPostcode == undefined){
	  	storePostcode(userid, message, jexiaRecordId);

      }else if(userRecordType == undefined){
        sendPropertyTypeMessage(userid);

      	//storePropertyType(userid, message)

      }else if(userRecordRooms == undefined){
      	
      	sendRoomNumberMessage(userid);

      //storeRooms(userid, message)

      }else if (userRecordPrice == undefined){
      	sendMaxPriceMessage(userid);

      	//storeMaxPrice(userid, message)

      }
         //sendSearchingMessage(userid)

  })


}


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
    	console.log("BODY" + body)
    })


 
  console.log("postcode" + messageText)


}








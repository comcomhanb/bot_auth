"use strict";
var staticCounter = 0;
var http = require("http");
var https = require('https');
var querystring = require('querystring');
var originalCode = getRandomArbitrary(1000,9999);



function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function callNotification(randomNum) {

        var postData = JSON.stringify(
            {
                "message":"안녕하세요 인증코드는 ["+ randomNum + "] 입니다.",
                //"tag":"Incidents",
                "notificationTokens":[
                "eyXr1__rPqg:APA91bEnZIBU3dNrsQLQhnk5CpV8kIw97XGRebdLIpgY_MyQaBF0KZ5kdIjR4jxjGX84uE8sculzXDhHOXS5cJmdh6KYGXScUKBAN9QmNdwWegFRNacALDwTvWa9drrMXpeSF19SwS1z"
                ]
            }
        );
        var headersJSON = {
            'Content-Type' : 'application/json',
            'Oracle-Mobile-Backend-ID' : '186ae657-0ef8-4947-a1bd-2b9c7b95592c',
            'Authorization' : 'Basic c2toMWNsb3VkQGdtYWlsLmNvbTpIeW5peCo5MA=='
        };
        var options = {
            host: 'skmobile-a515187.mobileenv.us2.oraclecloud.com',
            port: 443,
            method: 'POST',
            path: '/mobile/system/notifications/notifications',
            headers: headersJSON,
            body : postData
        };


 
        // request object
        var req = https.request(options, function (res) {
        var result = '';
        res.on('data', function (chunk) {
            result += chunk;
        });
        res.on('end', function () {
            console.log(result);
        });
        res.on('error', function (err) {
            console.log(err);
        })
    });
 
    // req error
    req.on('error', function (err) {
        console.log(err);
    });
 
    //send request witht the postData form
    req.write(postData);
    req.end();

}

module.exports = {

        metadata: () => (
        {
            "name": "authService",
            "properties": {
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        var userInput = conversation.messagePayload().text;
        var isNumber = userInput.match(new RegExp('^[0-9]*$'));

        if(isNumber !=null && userInput != originalCode ){
            staticCounter++;
            if(staticCounter < 4){
                conversation.reply("죄송합니다. 입력하신 번호 : " + userInput + "(은)는 인증코드가 아닙니다. 다시 시도 해 주세요. 재발송을 원하시면, 아무 문자열을 입력해 주세요. 오류횟수(" + (staticCounter-1) + " / 3)");
            }else if(staticCounter >= 4){
                conversation.reply("죄송합니다. 입력하신 번호 : " + userInput + "(은)는 인증코드가 아닙니다. 오류횟수를 초과하셔서 새로운 인증번호를 발송해 드렸습니다.");
                originalCode = getRandomArbitrary(1000,9999);
                callNotification(originalCode);
            }
            conversation.keepTurn(false);

            done();               
        }
        else if(staticCounter != 0 &&isNumber ==null){
            originalCode = getRandomArbitrary(1000,9999);
            callNotification(originalCode);
            conversation.reply("앱을 통해 재발송을 해 드렸습니다. 받으신 인증코드를 입력 해 주세요.");
            staticCounter = 0;
            done();
        }else if(userInput == originalCode){    
            conversation.reply("성공적으로 인증되었습니다.");
            conversation.transition();
            staticCounter = 0;        
            done();
        }else if(staticCounter == 0){
            conversation.reply("인증번호가 발송되었습니다 발송된 인증번호를 입력해 주세요.");
            staticCounter++
            callNotification(originalCode);
            done();
        }
    }
};

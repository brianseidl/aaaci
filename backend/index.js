const Alexa = require('ask-sdk');

const cheerio = require('cheerio')
const requesto = require('request')


const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
   // handlerInput.responseBuilder.speak("Welcome to the Adelphi Academic Calendar")
   // return NavigateHomeHandler.handle(handlerInput)
    
    return handlerInput.responseBuilder
      .speak("Welcome to the Adelphi Academic Calendar")
      .reprompt(HELP_REPROMPT)
      .getResponse();
    
  },
};

//CHECK EVENT
const CheckDurationHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'CheckDuration';
    
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const event = request.intent.slots.event.value;
    const term = request.intent.slots.time.value;
    var nab;
    var response = "UNF"
    
    
    var termSpeak = term.substring(term.length-2,term.length)//Gets last two characters
    
    
    switch(termSpeak){
      case "SP":
        termSpeak = "Spring ";
        break;
      case "SU":
        termSpeak = "Summer ";
        break;
      case "FA":
        termSpeak = "Fall ";
        break;
      case "WI":
        termSpeak = "Winter ";
        break;
      
      default:
        return handlerInput.responseBuilder
        .speak(INVALID_TERM)
        .getResponse();
    }
    
    termSpeak = termSpeak.concat(term.substring(0,4));
      
      
    await parsedata().then(function(val) {
      nab = val;
      //Not sure why this is here, doesn't actually use this line?
      // return handlerInput.responseBuilder
      //  .speak("Check Day Response: " + value)
      // .getResponse();
    }).catch(function(error) {
      console.error(error);
    });
    
    nab = JSON.parse(JSON.stringify(nab))
    
    response = checkEvent(event, .5, term, nab)
    if(response != "UNF")
      response = checkDaysRemaining(response)
    

    var eventNum = response.length - 1;
    
    //Output based on Findings
    if(response == "UNF"){
      return handlerInput.responseBuilder
        .speak("I could not find any events Matching " + event + " in " + termSpeak)
        .getResponse();
    } else if (eventNum == 1) {
      //Single Duration
      return handlerInput.responseBuilder
        .speak("For the term of  " + termSpeak + ", I found the event: " + response)
        .getResponse();
    } else {
      //Many Events
        var outSpeak = "For the term of  " + termSpeak + ", I found " + eventNum + " events: ";
        for (var i = 0; i < response.length; i++){
          outSpeak = outSpeak.concat(response[i]);
          if (i < response.length-2)
            outSpeak = outSpeak.concat( ", And ");
        }
        
        
        
        return handlerInput.responseBuilder
        .speak(outSpeak)
        .getResponse();
    }
  },
};

const CheckEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'CheckEvent';
    
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const event = request.intent.slots.event.value;
    const term = request.intent.slots.time.value;
    var nab;
    var response = "UNF"
    
    var termSpeak = term.substring(term.length-2,term.length)//Gets last two characters
    
    switch(termSpeak){
      case "SP":
        termSpeak = "Spring ";
        break;
      case "SU":
        termSpeak = "Summer ";
        break;
      case "FA":
        termSpeak = "Fall ";
        break;
      case "WI":
        termSpeak = "Winter ";
        break;
        
      default:
        return handlerInput.responseBuilder
        .speak(INVALID_TERM)
        .getResponse();
    }
    
    termSpeak = termSpeak.concat(term.substring(0,4));
      
    await parsedata().then(function(val) {
      nab = val;
      //Not sure why this is here, doesn't actually use this line?
      // return handlerInput.responseBuilder
      //  .speak("Check Day Response: " + value)
      // .getResponse();
    }).catch(function(error) {
      console.error(error);
    });
    
    nab = JSON.parse(JSON.stringify(nab))
    response = checkEvent(event, .5, term, nab)
    
    var eventNum = response.length - 1;
    
    //Output based on Findings
    if(response == "UNF"){
      return handlerInput.responseBuilder
        .speak("I could not find any events Matching " + event + " in " + termSpeak)
        .getResponse();
    } else if (eventNum == 1) {
      //Single Event
      return handlerInput.responseBuilder
        .speak("For the term of  " + termSpeak + ", I found the event: " + response)
        .getResponse();
    } else {
      //Many Events
        var outSpeak = "For the term of  " + termSpeak + ", I found " + eventNum + " events: ";
        for (var i = 0; i < response.length; i++){
          outSpeak = outSpeak.concat(response[i]);
          if (i < response.length-2)
            outSpeak = outSpeak.concat( ", And ");
        }
        
        
        
        return handlerInput.responseBuilder
        .speak(outSpeak)
        .getResponse();
    }
  },
};

//CHECK DAY
const CheckDayHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'CheckDay';
    
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    var day = request.intent.slots.day.value;

    if(day.length == 4){
      return handlerInput.responseBuilder
        .speak("I'm sorry, you will have to be more specific than " + day)
        .getResponse();
    }

    var fDay = dateToJS(day); //FORMATS THE DAY

    
    var endDay;
    var fEndDay; 
    

    //Ugly, But neccesary, apparently
    if(typeof (request.intent.slots.endDay) !== "undefined"){
      if(typeof (request.intent.slots.endDay.value) !== "undefined")
        endDay = request.intent.slots.endDay.value;
      if(typeof (request.intent.slots.endDay.value) !== "undefined")
        fEndDay = dateToJS(endDay);
    } 

    
    if(endDay !== undefined){
      if(fEndDay.length == 4){
        return handlerInput.responseBuilder
          .speak("I'm sorry, you will have to be more specific than " + endDay)
          .getResponse();
      }
    } 
    
    var nab;  //JSON
    var value;


    var response = "UNF";
    var year = day.substring(0,4)

    
    if(typeof endDay === "undefined"){
      endDay = day;
      fEndDay = fDay;
    } 
    await parsedata().then(function(val) {
      nab = val;  //Get JSON
      //Not sure why this is here, doesn't actually use this line?
      return handlerInput.responseBuilder
      .speak("Check Day Response: " + value)
      .getResponse();
    }).catch(function(error) {
      console.error(error);
    });
    
    //day is in Year-Month-Day format
    /*
    //term: [TERM, IN SEASON YEAR FORMAT]
      //Ex. 'Summer 2020'
    //date: [DATE, IN MONTH / DAY FORMAT]
      //Ex. ' May 26'
    //description: [EVENT ON DAY]
      //Ex. ' First Day of Classes - Summer I 2020'
    */

    //Checks if we've been given a week or not
    var weekBool = day.includes("W");
    var monthBool = day.length == 7; //No day
    
    const millInDay = 60*60*24*1000
    const millInWeek = 7*millInDay
    
    if(weekBool){
      //We're looking for a specific week
      
      var firstDayOfYear = new Date(year);
      var offset = firstDayOfYear.getDay();
      var firstWeekOfYear = new Date(firstDayOfYear.getTime()-(offset*millInDay));
      
      fDay = new Date(firstWeekOfYear.getTime() + ((day.substring(day.length-2,day.length))*millInWeek))
      endDay = new Date(fDay.getTime() + millInWeek);
      day = "The Week of " + dateToAlexa((fDay.toISOString()).substring(0,10));
      //Format the Date Objects Correctly
      
      fDay = dateToJS(fDay.toISOString().substring(0,10))

      fEndDay= dateToJS(endDay.toISOString().substring(0,10))
        
    } else if (monthBool){
      
      //We're looking for a specifc month
      fDay = (fDay.replace("-NaN" , "")).concat("-01");
      //day = dateToAlexa(fDay);
      var monthNum = fDay.substring(5,7);
      monthNum = parseInt(monthNum) + 1;
      
      if(monthNum<10){
        monthNum = "0" + monthNum;
      } else if (monthNum > 12){
        monthNum = monthNum % 12;
        monthNum = "0" + monthNum;
      }
      
      
      fEndDay = year.concat("-",monthNum, "-01");
      
      day = formatDay(day) + year;
    }
    
    
    nab = JSON.parse(JSON.stringify(nab))
    response = checkRange(fDay, fEndDay, nab)
    
    var eventNum = response.length - 1;
    
    var maybeOnDuring = " on "
    if(fDay !== fEndDay){
      var maybeOnDuring = " during "
    }
    
    //Output based on Findings
    if(response == "UNF"){
      return handlerInput.responseBuilder
        .speak("I could not find anything" + maybeOnDuring + day)
        .getResponse();
    } else if (eventNum == 1) {
      return handlerInput.responseBuilder
        .speak("I found the Event:  " + response + maybeOnDuring + day)
        .getResponse();
    } else {
        var outSpeak = "I found " + eventNum + " Events" + maybeOnDuring + day +": ";
        for (var i = 0; i < response.length; i++){
          outSpeak = outSpeak.concat(response[i]);
          if (i < response.length-2)
            outSpeak = outSpeak.concat( ", And ");
        }
        
        return handlerInput.responseBuilder
        .speak(outSpeak)
        .getResponse();
    }
  },
};

//NAVIGATE HOME
const NavigateHomeHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'AMAZON.NavigateHomeIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Returning to Home")
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("I'm sorry, I'm having trouble understanding you, Let's start over")
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Goodbye")
      .getResponse();
  },
};

const CancelHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Let's try again")
      .withShouldEndSession(false)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const ErrorHandler = {
  
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    const request = handlerInput.requestEnvelope.request;
    //const value = request.intent.slots.event.value;
    const value = request.intent.name;

    return handlerInput.responseBuilder
      
      .speak('Sorry, an error occurred.')
      .reprompt(value)
      .getResponse();
  },
};

const SKILL_NAME = 'Adelphi Academic Calendar';
const HELP_MESSAGE = 'I can help you find information about the Adelphi Academic Calendar. Ask me when an event is, or what is going on during a certain day... You may have to specify an Academic term such as Fall 2019';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const INVALID_TERM = 'Sorry, that is not a valid academic term';


const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    NavigateHomeHandler,
    CheckEventHandler,
    FallbackHandler,
    CheckDurationHandler,
    CheckDayHandler,
    LaunchHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    CancelHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();


//dataFetch.js
const https = require('https');
const URL = 'https://silly-python.herokuapp.com/'                 //JSON GRAB
const vURL = 'http://35.222.70.19/'                               //USES VM
const aURL = 'https://registrar.adelphi.edu/academic-calendar/'   //ADELPHI CALENDAR
const tURL = 'https://silly-python.herokuapp.com/test/'           //TEST URL
var data = "";

//USES CHEERIO FOR SILLY PYTHON
var sillyHTML = function(web){
  const $= cheerio.load(web)
  return cheerio.text($('body'));
}

//Parses HTML Data, Currently Used
function parsedata(){

    //URL is Current
    //tURL is Test
    return new Promise(function(resolve, reject){
        requesto(vURL, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                //resolve(parseHTML(body))  //For AU Calendar
                resolve(sillyHTML(body))    //For Silly Python
            } catch(e) {
                reject(e);
            }
        });
        
    });
    
  
}

//Format Date to Month/Day
function formatDay(inDay){
  //YYYY-MM-DD
  //Takes in AMAZON.DATE, outputs into plain english for comparison 
  var day = inDay.substring(8,10)
  var month = parseInt(inDay.substring(5,7))
  var out = "ERROR";
  
  if(day === "NaN"){
    day = "";
  } //If no day, keep no day
  
  switch(month){
    case 1:
      out = " January " + day;
      break;
    case 2:
      out = " Febuary " + day;
      break;
    case 3:
      out = " March " + day;
      break;
    case 4:
      out = " April " + day;
      break;
    case 5:
      out = " May " + day;
      break;
    case 6:
      out = " June " + day;
      break;
    case 7:
      out = " July " + day;
      break;
    case 8:
      out = " August " + day;
      break;
    case 9:
      out = " September " + day;
      break;
    case 10:
      out = " October " + day;
      break;
    case 11:
      out = " November " + day;
      break;
    case 12:
      out = " December " + day;
      break;
    
  }//End Switch
  
  return out;
}

function checkRange(fromDate, toDate, myJSON){
	myJSON = JSON.parse(myJSON);
  var eventsLength = myJSON.events.length;
	var rangeFrom = fromDate.split("-");
	var rangeTo = toDate.split("-");
	var answer = "";
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	var rangeFromDate = new Date(Number(rangeFrom[0]), Number(rangeFrom[1] ), Number(rangeFrom[2]));
	rangeFromDate.setHours(0, 0, 0, 0);
	var rangeFromTime = rangeFromDate.getTime();

	var rangeToDate = new Date(Number(rangeTo[0]), Number(rangeTo[1] ), Number(rangeTo[2]));
	rangeToDate.setHours(0, 0, 0, 0);
	var rangeToTime = rangeToDate.getTime();
	
	for(var i = 0; i < eventsLength; i++){

    
    var maybeEndDate = "";
		var maybeOnFrom = "";
		
		
		if (fromDate != toDate)
		  maybeOnFrom = " is on " + myJSON.events[i].date.start_date;

		if(myJSON.events[i].date.range == false){
			var tempDate = new Date(myJSON.events[i].date.start_date);
			tempDate.setHours(0, 0, 0, 0);
			var tempTime = tempDate.getTime();

			if (rangeFromTime <= tempTime && tempTime <= rangeToTime){
				//Event is not range
				answer += myJSON.events[i].description + maybeOnFrom + "\n";
			}
		}else if(myJSON.events[i].date.range == true){
  		  maybeEndDate = " to " + myJSON.events[i].date.end_date; //If there is no end date, will be blank.
        maybeOnFrom = "from "	;
		  
				var innerRangeFrom = myJSON.events[i].date.start_date.split("-");
				var innerRangeTo = myJSON.events[i].date.end_date.split("-");
				
				var innerRangeFromDate = new Date(Number(innerRangeFrom[0]), Number(innerRangeFrom[1] -1), Number(innerRangeFrom[2]));
				innerRangeFromDate.setHours(0, 0, 0, 0);
				var innerRangeFromTime = innerRangeFromDate.getTime();

				var innerRangeToDate = new Date(Number(innerRangeTo[0]), Number(innerRangeTo[1] - 1), Number(innerRangeTo[2]));
				innerRangeToDate.setHours(0, 0, 0, 0);
				var innerRangeToTime = innerRangeToDate.getTime();
				
				if(fromDate != toDate){
				  if (rangeFromTime <= innerRangeToTime && innerRangeToTime <= rangeToTime){
						//Checking Range
						answer += myJSON.events[i].description + " is " + maybeOnFrom + myJSON.events[i].date.start_date + maybeEndDate + "\n";
					}
				  else if (rangeFromTime <= innerRangeFromTime && innerRangeFromTime <= rangeToTime){
						//Checking Range
						answer += myJSON.events[i].description + " is " + maybeOnFrom + myJSON.events[i].date.start_date + maybeEndDate + "\n";
					}
				}
				else if (fromDate == toDate){
          if(myJSON.events[i].date.start_date == myJSON.events[i].date.end_date){
					  if (innerRangeFromTime <= rangeFromTime && rangeToTime <= innerRangeToTime){
						  //Niether check date nor event are ranges
						  answer += myJSON.events[i].description + "\n";
				  	}
          }
          else{
            if (innerRangeFromTime <= rangeFromTime && rangeToTime <= innerRangeToTime){
						  //Check date is not range, but event is
						  answer += myJSON.events[i].description + " is " + maybeOnFrom + myJSON.events[i].date.start_date + maybeEndDate  + "\n";
				  	}
          }
				}
				else{
				  //Unreachable
					answer = "UNF";
				}
			}else{
			//Unreachable
			answer = "UNF";
			}
			
	}//end for

	if (answer == "")
		answer = "UNF";


  answer = answer.split("\n")
  
  return answer
}

//Decriments Day and month by 1 to appease Javascript
function dateToJS(inDate){
  //YYYY-MM-DD
  
  var day = parseInt(inDate.substring(8,10));
  var month = parseInt(inDate.substring(5,7));
  var year = inDate.substring(0,4)
  //day--;    //No Idea why we don't have to do this, but causes errors if we do
  month--;
 
 var outDate =  "" + year + "-" + month + "-" + day;
 return outDate;
}

//Incriments Day and Month by 1 to appease Alexa
function dateToAlexa(inDate){
  var day = parseInt(inDate.substring(8,10));
  var month = parseInt(inDate.substring(5,7));
  var year = inDate.substring(0,4)
  //day--;    //No Idea why we don't have to do this, but causes errors if we do
  month++;
 
 var outDate =  "" + year + "-" + month + "-" + day;
 return outDate;
}

function checkEvent(eventDescription, accuracyThreshold, requestedTerm, myJSON){
  myJSON = JSON.parse(myJSON)
  var answer = "";//default

  var eventsLength = myJSON.events.length;
  

  var keyWords = (eventDescription.toLowerCase()).split(" ");
  var keyWordsLength = keyWords.length;
  
  for (var i = 0; i < keyWordsLength; i++){
      keyWords[i] = keyWords[i];
  }
  
  
      for(var i = 0; i < eventsLength; i++){
          var eventDescription = myJSON.events[i].description.toLowerCase();
          var accuracyCount = 0;
          var eventStartDate = myJSON.events[i].date.start_date;
          var eventEndDate = myJSON.events[i].date.end_date;
          var nonKeyWords =  myJSON.events[i].description.toLowerCase().split(" ");
          var nonKeyWordsLength = nonKeyWords.length;
          
          if (myJSON.events[i].term == requestedTerm){
              for(var j = 0; j < keyWordsLength; j++){
                  for(var k = 0; k < nonKeyWordsLength; k++){
                      if(nonKeyWords[k] == keyWords[j])
                      accuracyCount++;
                  }        
              }
          }
          
          if((accuracyCount / keyWordsLength) >= accuracyThreshold){
              if(eventStartDate == eventEndDate)
                  answer += eventDescription + " is on " + eventStartDate + "\n";
              else
                  answer += eventDescription + " is from " + eventStartDate + " to " + eventEndDate + "\n";
  
          }
      }
      
    answer = answer.split("\n")
      
      
    if (answer == "")
      answer = "UNF";
        
  return answer;

}

function checkDaysRemaining(checkEventResponse){

  var daysToCompareTo = checkEventResponse

	daysToCompareTo.pop(); //might need to get rid of but this is for initial testing

	
	var daysToCompareToLength = daysToCompareTo.length;
	var answer = [];
	const DAYINMILLISECONDS = 86400000;
	var DESCRIPTIONCHARSTOSUBTRACT;
	var currentDate;
	var isRangeReply;
	
	for(var i = 0; i < daysToCompareToLength; i++){
	  
		if (daysToCompareTo[i].substring(daysToCompareTo[i].length - 13, daysToCompareTo[i].length - 11) == "to"){
			DESCRIPTIONCHARSTOSUBTRACT = 33;
			currentDate = daysToCompareTo[i].substring(daysToCompareTo[i].length - 24, daysToCompareTo[i].length - 14);
			isRangeReply = " starts on ";
		}
		else{
			DESCRIPTIONCHARSTOSUBTRACT = 17;
			currentDate = daysToCompareTo[i].substring(daysToCompareTo[i].length - 10, daysToCompareTo[i].length);
			isRangeReply = " which is on ";
			
		}	

			//declarations
			var currentDescription = daysToCompareTo[i].substring(0, daysToCompareTo[i].length - DESCRIPTIONCHARSTOSUBTRACT);
			var requestedYear = currentDate.substring(0, currentDate.length - 6);
			var isLeapYear = (requestedYear % 4 == 0);			
			var leapDay = new Date(requestedYear + "-2-29");			
			var dateObj = new Date(currentDate);	
			var todayObj = new Date();

			//set the hours for accurate calculations
			dateObj.setHours(0, 0, 0, 0);		
			todayObj.setHours(0, 0, 0, 0);
			
			if (leapDay.getTime() < dateObj.getTime())
				todayObj.setDate(todayObj.getDate() );
			
			todayObj.setDate(todayObj.getDate()-1); //Fixes thinking it's tomorrow.
			
			var currentTime = dateObj.getTime();
			var todayTime = todayObj.getTime();

			var timeDifference = Math.ceil((currentTime - todayTime) / DAYINMILLISECONDS);


			//display the output
			if(timeDifference < 0){
				//do nothing
				//Date already past
			}
			else if(timeDifference == 0){
				answer.push(currentDescription + " is today");
			}
			else if(timeDifference == 1){
				answer.push(currentDescription + " which is tomorrow");
			}
			else{
				answer.push(currentDescription + isRangeReply + currentDate + " is in " + timeDifference + " days");
			}
		}
	answer.push("")
	return answer;
}
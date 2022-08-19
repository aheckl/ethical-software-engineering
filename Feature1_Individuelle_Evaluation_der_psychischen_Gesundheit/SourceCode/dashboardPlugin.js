/**
* @file
* Functionality of the ethical analysis dashboard plugin.
*/

var global_csv;
//const fetch = require("node-fetch");
var userName;
var highestID = 0;


/** 
 * 
  ------------------------------------------------- ab hier berechnende Methoden ---------------------------------------------------------------------------------------------------------------------
 */

/**
 * Calculates/ Determines wether taking action to is indicated, based on the total score (=> 55)
 * 
 * @param {Array} employeeTestResultsArray
 * 		Array (length 18) that contains the score from each question on the burnout test for a given employee
 * @returns {Number} total score on burnout-test
 */
function totalPointsOnBurnoutTest(employeeTestResultsArray) {

    var sum = 0;
    if (employeeTestResultsArray.length == 18) {

        for (var i = 0; i < employeeTestResultsArray.length; i++) {
            sum += employeeTestResultsArray[i];
        }
    }
    return sum;
}


/**
 * Calculates total points in "Distanziertheit" >= 19
 * 
 * @param {Array} employeeTestResultsArray
 * 		Array (length 18) that contains the score from each question on the burnout test for a given employee
 * @returns {Number} total points scored in "Distanziertheit"
 */
function totalPointsDistanziertheit(employeeTestResultsArray) {

    var sum = 0;

    if (employeeTestResultsArray.length == 18) {

        for (var i = 0; i < 6; i++) {
            sum += employeeTestResultsArray[i];
        }

        /* if (sum >= 19) {
            console.log("Die Auswertung Ihrer Antworten für Distanziertheit ergibt " + sum + ". Dieser Wert ist stark erhöht! Es wird dringend empfohlen so schnell wie möglich professionelle Hilfe aufzusuchen.");
        } else {
            console.log("Die Auswertung Ihrer Antworten für Distanziertheit ergibt " + sum + ". Dieser Wert liegt im grünen Bereich!");
        } */
    }

    return sum;


}

/**
 * Calculates total points in "Emotionale Erschöpfung" >= 19
 * 
 * @param {Array} employeeTestResultsArray
 * 		Array (length 18) that contains the score from each question on the burnout test for a given employee
 * @returns {Number} total points scored in "Emotionale Erschöpfung"
 */
function totalPointsEmotionaleErschöpfung(employeeTestResultsArray) {

    var sum = 0;

    if (employeeTestResultsArray.length == 18) {

        for (var i = 6; i < 12; i++) {
            sum += employeeTestResultsArray[i];
        }

        /* if (sum >= 19) {
            console.log("Die Auswertung Ihrer Antworten für Emotionale Erschöpfung ergibt " + sum + ". Dieser Wert ist stark erhöht! Es wird dringend empfohlen so schnell wie möglich professionelle Hilfe aufzusuchen.");
        } else {
            console.log("Die Auswertung Ihrer Antworten für Emotionale Erschöpfung ergibt " + sum + ". Dieser Wert liegt im grünen Bereich!");
        } */
    }

    return sum;


}


/**
 * Calculates total points in "Misserfolge" >= 19
 * 
 * @param {Array} employeeTestResultsArray
 * 		Array (length 18) that contains the score from each question on the burnout test for a given employee
 * @returns {Number} total points scored in "Misserfolge"
 */
function totalPointsMisserfolge(employeeTestResultsArray) {

    var sum = 0;

    if (employeeTestResultsArray.length == 18) {

        for (var i = 12; i < 18; i++) {
            sum += employeeTestResultsArray[i];
        }
    }

    return sum;


}




/** 
 * 
  ------------------------------------------------- ab hier Methoden die Daten für die Grafiken bereitstellen---------------------------------------------------------------------------------------------------------------------
 */



/**
 * returns resultArray for mood-graphic (most recent one at [0])
 * @param {Array} sortedArray
 * 		Array of records that contains the date, the answers of the burnouttest and the answers for the mood since last survey question
 * @returns {Array} an array with all the moods sorted by date (most recent answer at [0])
 */
function lastTwelveMoods(sortedArray) {
    var moodArray = [];
    for (var i = 0; i < 12; i++) {
        moodArray.push(sortedArray[i].moodSinceLastSurvey);
    }

    return moodArray;
}




/**
 * returns resultArray for burn-out-graphic (most recent one at [0])
 * @param {Array} sortedArray
 * 		Array of records that contains the date, the answers of the burnouttest and the answers for the mood since last survey question
 * @returns {Array} an array with all the testscores on the burnouttest sorted by date (most recent answer at [0])
 */
function lastTwelveScoresOnBurnoutTest(sortedArray) {
    var BurnOutTestResultsArray = [];
    for (var i = 0; i < 12; i++) {
        BurnOutTestResultsArray.push(totalPointsOnBurnoutTest(sortedArray[i].points));
    }

    return BurnOutTestResultsArray;
}


/**
 * -------------------------------------- Methoden für die Textausgaben -----------------------------------------------
 */


/**
 * returns resultArray: most recent score and score before that: burn-out-test (most recent one at [0])
 * @param {Array} sortedArray
 * 		Array of records that contains the date, the answers of the burnouttest and the answers for the mood since last survey question
 * @returns {Array} an array with the total score of the two latest burnouttest scores (most recent answer at [0])
 */
function lastTwoScores(sortedArray) {
    var BurnOutTestResultsArray = [0, 0];
    for (var i = 0; i < 2; i++) {
        BurnOutTestResultsArray[i] = totalPointsOnBurnoutTest(sortedArray[i].points);
    }

    return BurnOutTestResultsArray;
}


/**
 * returns resultArray: most recent score and score before that: Misserfolge (most recent one at [0])
 * @param {Array} sortedArray
 * 		Array of records that contains the date, the answers of the burnouttest and the answers for the mood since last survey question
 * @returns {Array} an array with the total score of the two latest burnouttest: Misserfolge scores (most recent answer at [0])
 */
function lastTwoScoresMisserfolge(sortedArray) {
    var resultsArray = [0, 0];
    for (var i = 0; i < 2; i++) {
        resultsArray[i] = totalPointsMisserfolge(sortedArray[i].points);
    }

    return resultsArray;
}


/**
 * returns resultArray: most recent score and score before that: Distanziertheit (most recent one at [0])
 * @param {Array} sortedArray
 * 		Array of records that contains the date, the answers of the burnouttest and the answers for the mood since last survey question
 * @returns {Array} an array with the total score of the two latest burnouttest: Distanziertheit scores (most recent answer at [0])
 */ 
function lastTwoScoresDistanziertheit(sortedArray) {
    var resultsArray = [0, 0];
    for (var i = 0; i < 2; i++) {
        resultsArray[i] = totalPointsDistanziertheit(sortedArray[i].points);
    }

    return resultsArray;
}



/**
 * returns resultArray: most recent score and score before that: EmotionaleErschöpfung (most recent one at [0])
 * @param {Array} sortedArray
 * 		Array of records that contains the date, the answers of the burnouttest and the answers for the mood since last survey question
 * @returns {Array} an array with the total score of the two latest burnouttest: EmotionaleErschöpfung scores (most recent answer at [0])
 */ 
function lastTwoScoresEmotionaleErschöpfung(sortedArray) {
    var resultsArray = [0, 0];
    for (var i = 0; i < 2; i++) {
        resultsArray[i] = totalPointsEmotionaleErschöpfung(sortedArray[i].points);
    }

    return resultsArray;
}



/**
 * -------------------------------------- Methoden zum sortieren (nach Datum: 4)/ gebrauchte Daten extrahieren(1, 3) -----------------------------------------------
 */




/**
 * matches the logged-in user with his answers data 
 * 
 * @param {Number} userName 
 *    the id number of the employeer for whom the testscores will be determined
 * @param {Array} CsvData
 *    contains all the records from the fetched data: employee-ID, date when test was answered, answers for the online test, answer for mood-question
 * @returns {Array} an array of records where the employee-ID matches the userName
 */
function matchUserToUserId(userName, CsvData) {

    var employeeData = [];

    for (var i = 0; i < CsvData.length; i++) {

        if (userName == CsvData[i].MitarbeiterID) {
            employeeData.push(CsvData[i]);
        }

    }
    return employeeData;
}



/**
 * aus feature4 übernommen
 * 
 * converts a String of the format DD.MM.YYYY to a String of the format YYYY-MM-DD
 * 
 * @param {String} str 
 *    a String in the format DD.MM.YYYYY
 * @returns {String} a String of the format YYYY-MM-DD
 */
function convertToISOdateString(str) {
    var year = str.substring(6, 10);
    var month = str.substring(3, 5);
    var day = str.substring(0, 2);
    return year + "-" + month + "-" + day;

}




/**
 * extracts all the needed data and changes the format
 * 
 * 
 * @param {Array} data
 *    an array of records containing all the data of an employee (all his answers from multiple dates)
 * @returns {Array} an array of records with the date (converted to ISO format), Array of the scores on the burnout test and the answer for the mood-question
 */
function surveyAnswersAsArray(data) {

    var resultArray = [];

    for (var i = 0; i < data.length; i++) {

        var tempDate = data[i]['Datum und Zeit'].substring(0, 10);
        const date = new Date(convertToISOdateString(tempDate));

        var tempArray = { date: date, points: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], moodSinceLastSurvey: 0 };
        tempArray.points[0] = data[i]['Meine Arbeit ist für mich nur noch Routine, ich habe keinen persönlichen Bezug dazu.'];
        tempArray.points[1] = data[i]['Es fällt mir immer schwerer, mich bei der Arbeit auf andere Menschen einzustellen.'];
        tempArray.points[2] = data[i]['Ich kann anderen Menschen bei meiner Arbeit immer weniger Wertschätzung entgegen bringen.'];
        tempArray.points[3] = data[i]['Meine Kunden/Kollegen sind mir zunehmend gleichgültig.'];
        tempArray.points[4] = data[i]['Ich bemerke, dass ich in meinem Arbeitsalltag immer zynischer werde.'];
        tempArray.points[5] = data[i]['Ich lasse nichts mehr an mich herankommen.'];
        tempArray.points[6] = data[i]['Ich fühle mich häufig müde oder ausgelaugt.'];
        tempArray.points[7] = data[i]['Es fällt mir schwer, mich zu meiner Arbeit aufzuraffen.'];
        tempArray.points[8] = data[i]['Ich bin oft gereizt.'];
        tempArray.points[9] = data[i]['Ich fühle mich häufig körperlich geschwächt.'];
        tempArray.points[10] = data[i]['Meine Arbeit macht mir keine Freude mehr'];
        tempArray.points[11] = data[i]['Ich fühle mich häufig emotional erschöpft.'];
        tempArray.points[12] = data[i]['Ich erhalte kaum positive Rückmeldungen über meine Arbeitsleistung.'];
        tempArray.points[13] = data[i]['Ich zweifle häufig daran, dass meine Arbeit sinnvoll ist.'];
        tempArray.points[14] = data[i]['Die Anforderungen an mich sind in den letzten Jahren immer höher geworden'];
        tempArray.points[15] = data[i]['Ich habe das Gefühl, dass ich immer mehr mache und trotzdem immer weniger bewältige.'];
        tempArray.points[16] = data[i]['Egal, wie sehr ich mich bemühe, ich erreiche nichts.'];
        tempArray.points[17] = data[i]['Ich glaube, dass alle meine Anstrengungen letztlich wirkungslos bleibe'];
        tempArray.moodSinceLastSurvey = data[i]['6. Auf einer Skala von 1 (sehr schlecht) bis 10 (sehr gut) würde ich meine Stimmung seit der letzten Umfrage wie folgt bewerten:'];

        resultArray.push(tempArray);

    }

    return resultArray;
}


/**
 * sorts answers by date for an employee (most recent one at [0])
 * 
 * 
 * @param {Array} EmployeeAnswersArray
 *    an array of records with the date (converted to ISO format), Array of the scores on the burnout test and the answer for the mood-question
 * @returns {Array} the same array just sorted by date (most recent one at [0])
 */

function sortAnswersByDate(EmployeeAnswersArray) {

    var sortedByDate = EmployeeAnswersArray.sort((a, b) => b.date - a.date);
    return sortedByDate;
}




function getLatestMonth(csv){
	var latestDate = "1999.01.01";	

	for(let record of csv){
		let dateOfRecord = convertToISOdateString(record["Datum und Zeit"].substring(0,10));
		if(dateOfRecord>latestDate)
			latestDate = dateOfRecord;
	}
	return Number(latestDate.substring(5,7));
}

function getLast12Months(latestMonth){
	let months = [];
	for(let i = 1; i<13;i++){
		if((i+latestMonth)%12 ===0)
			months.push(12);
		else
			months.push((i+latestMonth)%12);
	}
	return months;
}

function getLabelsLast12Months(csv){
	var months = getLast12Months(getLatestMonth(csv));
	var mapping = {1: "Jan", 2: "Feb", 3:"Mär", 4:"Apr", 5:"Mai", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Okt", 11:"Nov", 12:"Dez"};
	var labels = [];
	for(let month of months){
		labels.push(mapping[month]);
	}
	return labels;

}



/** 
 * 
  ------------------------------------------------- ab hier beginnt die Vorlage ---------------------------------------------------------------------------------------------------------------------
 */


/** [ETHICAL_SSE] Example function how to use fetch() to retrieve data. */
function fetchData() {
    // Send some data in your request
    var formData = new FormData();
    formData.append("app", "jira");

    // Send a "POST" (may also be e.g. "GET") request
    var fetchBody = {
        method: "POST",
        mode: "no-cors",
        body: formData
    };

    fetch("http://httpbin.org/post", fetchBody);
};


/** [ETHICAL_SSE] Example function showing how to access the Jira API.
    Also an example that shows how to call a function only *after* a specific field has been set. */
function getCurrentlyLoggedInUserThen(execute_function) {
    // Recursion end condition: currentUser is set
    if (currentUser !== undefined && currentUser !== "") {
        execute_function();
        return;
    }

    // Access the Jira API
    fetch("/jira/rest/auth/1/session")
        .then(function (result) {
            if (result.ok) {
                // Successful request: Return the JSON payload
                return result.json();
            } else {
                // Request error: Log and return undefined
                console.error("JIRA API call failed");
                return undefined;
            }
        })
        .then(function (resultJson) {
            if (resultJson !== undefined && resultJson !== "") {
                // In JavaScript, you can directly access JSON properties
                currentUser = resultJson.name;

                // Recursion / reentrance
                // After we have finished, we recursively call this function again,
                // this time calling the function to execute. Why this two-step
                // process? If we call this function again later, it will
                // immediately call the given function.
                getCurrentlyLoggedInUserThen(execute_function);
            }

            // In case we did not receive a valid user, we don't execute the function.
            return;
        });

    // Recursion / reentrance happens in the callback above
    return;
};


// [ETHICAL_SSE] Below are three example functions how to create HTML elements in JavaScript


/**
 * Creates an HTML <div> element styled as an alert with the given level and text.
 * 
 * @param {String} warning_level
 *   Either "warning" or "danger"
 * @param {Array} warning_text_children
 *   The HTML elements describing the warning text.
 */
function createHtmlAlert(warning_level, warning_text_children) {
	// Wurde auskommentiert, um auch successes anzeigen zu können
    //if (["warning", "danger"].indexOf(warning_level) < 0) {
    //    throw "warning_level has to be either \"warning\" or \"danger\"";
    //}

    var alert = document.createElement("DIV");
    alert.className = "alert alert-" + warning_level;
    alert.setAttribute("role", "alert");
    warning_text_children.forEach(function (warning_text_child) {
        alert.appendChild(warning_text_child);
    });

    return alert;
};


/**
 * Creates an HTML <a> element linking to the given user.
 * 
 * @param {String} username
 *   The username (may not contain "@")
 */
function createUserLink(username) {
    if (username.includes("@")) {
        throw "user_name may not contain \"@\"";
    }

    var a = document.createElement("A");
    a.setAttribute("target", "_parent"); // This ensures that we open the relative link in Jira, not in our plugin.
    a.setAttribute("href", "/jira/secure/ViewProfile.jspa?name=" + username);
    a.className = "alert-link";
    a.innerHTML = "@" + username;

    return a;
};


/** Creates an HTML <span> element containing the given text. */
function createSpan(text) {
    var s = document.createElement("SPAN");
    s.innerHTML = text;
    return s;
};


/** Here, we simply populate the interface with some dummy elements. */
/* function populate() {
    // 1. Load warnings
    console.warn("WARNINGS ARE CURRENTLY FAKE!");
    var warnings = [
        { level: "danger", children: [createSpan("(!) Debug code – warnings are fake (!)")] },
        { level: "warning", children: [createUserLink("frauke"), createSpan(" worked overtime three days in a row.")] },
        { level: "danger", children: [createUserLink("admin"), createSpan(" has violated the policy \"no-work-during-holidays\"!")] },
        { level: "danger", children: [createUserLink("frauke"), createSpan(" worked overtime five days in a row.")] },
        { level: "warning", children: [createSpan("There are 10 open and overdue tasks!")] },
    ];

    // Select the HTML element with the ID "alertlist"
    var alertlist = document.querySelector("#alertlist");

    // 2. Remove "Loading..." placeholder
    if (alertlist.childElementCount != 1) {
        throw "Invalid DOM state!";
    }
    alertlist.removeChild(alertlist.children[0]);

    // 3. Populate interface
    warnings.forEach(function (warning) {
        var warning_alert = createHtmlAlert(warning.level, warning.children);
        alertlist.appendChild(warning_alert);
    });
};

// [ETHICAL_SSE] If you want to immediately run a function when importing the JavaScript, simply trigger it here.
// Alternatively, you may also let them be called from the HTML, e.g. when pressing a button: https://www.w3schools.com/jsref/event_onclick.asp
populate();
 */

/** 
 *  ------------------------------------------------- Ende der Vorlage -----------------------------------------------------------------------------------------------
 */



function createFirstChart(sortedData){
	// Webchart
	var webchart = document.getElementById("spiderchart_subcategories");
	webchart.height = 800;
	webchart.width = 800;
	var myChart = new Chart(webchart, {
		type: 'radar',
		data: {
			labels: ["Distanziertheit", "Misserfolge", "Emotionale Erschöpfung"],
			datasets: [{
		// current week's data
				label: 'aktueller Monat',
				data: [	totalPointsDistanziertheit(sortedData[1].points), 
						totalPointsMisserfolge(sortedData[1].points),
						totalPointsEmotionaleErschöpfung(sortedData[1].points)],
				backgroundColor: "rgba(200,0,0,0.2)"
				},
		{
		// last week's data
				label: 'letzter Monat',
		// Ergebnisse werden mittels extround auf 2 Nachkommastellen gerundet
				data: [	totalPointsDistanziertheit(sortedData[0].points), 
						totalPointsMisserfolge(sortedData[0].points),
						totalPointsEmotionaleErschöpfung(sortedData[0].points)],
		backgroundColor: "rgba(0,0,200,0.2)"
				}]
		},
	options:{
		responsive: false,
		title:{
		display:true,
		text:'Analyse der Subkategorien',
		fontSize:25
		},
		layout:{
			padding:{
				left: 50,
				right: 50
			}
		},
		scale: {
			ticks: {
				beginAtZero: true,
				min: 0,
				//max: 1,
				stepSize: 1
			}
		}
	} 		  
	});
}
function createSecondChart(sortedData, csv){
	// gather data
	var labels_twelve_months = getLabelsLast12Months(csv);
	var data_twelve_months = lastTwelveScoresOnBurnoutTest(sortedData);
	//create Chart
	var total_score_chart = document.getElementById("chart_total_score");
	total_score_chart.height = 500;
	total_score_chart.width = 800;
	myChart = new Chart(total_score_chart, {
		type: 'bar',
		data: {
			labels: labels_twelve_months,
			datasets: [{
				label: 'Ergebnisse der Analyse über 12 Monate',
				data: data_twelve_months,
				backgroundColor: 'rgba(75,192,192,0.6)'
			}],
		},
		options:{
			responsive: false,
			title:{
				display:true,
				text:'Verlauf des Gesamtergebnisses',
				fontSize:25
			},
			legend: {
				display: false
			},
			layout:{
				padding:{
					left: 50,
					right: 50
				}
			},
			scales: {
				xAxes: [{
					scaleLabel:{
						display: true,
						labelString: 'Monat'
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						stepSize: 1,
						min: 0
						//max: 10
					},
					scaleLabel:{
						display: true,
						labelString: 'Gesamtergebnis'
					}
				}]
			}
		} 		  
	});
}

function createThirdChart(sortedData, csv){
	// gather Data
	var labels_twelve_months = getLabelsLast12Months(csv);
	var data_twelve_months = lastTwelveMoods(sortedData);
	// create Chart	
	var Moodchart = document.getElementById("chart_mood");
	Moodchart.height = 500;
	Moodchart.width = 800;
	myChart = new Chart(Moodchart, {
		type: 'line',
		data: {
			labels: labels_twelve_months,
			datasets: [{
				label: 'Ergebnisse der Stimmung über 12 Monate',
				data: data_twelve_months,
				backgroundColor: 'rgba(255,159,64,0.6)'
			}],
		},
		options:{
			responsive: false,
			elements: {
				line: {
					tension: 0
				}
			},
			title:{
				display:true,
				text:'Verlauf der Stimmung',
				fontSize:25
			},
			legend: {
				display: false
			},
			layout:{
				padding:{
					left: 50,
					right: 50
				}
			},
			scales: {
				xAxes: [{
					scaleLabel:{
						display: true,
						labelString: 'Monat'
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						stepSize: 1,
						min: 0
						//max: 10
					},
					scaleLabel:{
						display: true,
						labelString: 'Stimmung'
					}
				}]
			}
		} 		  
	});
}

/** 
 * Here we fetch the csv-file the site of the survey returns.
 * Each Object corresponds to one record in the file.
 */
async function fetchCsvData() {
    const response = await fetch('http://localhost:8080/feature1');
    let data = await response.json()
    return data;
}
/** 
 * Here we fetch the employees that work in our company/team as an Array of Objects.
 * Each Object corresponds to one row in the employees database.
 */
async function fetchEmployees() {
    const response = await fetch('http://localhost:8080/employees');
    let data = await response.json()
    highestID = data.length;
    return data;
}



//$(document).ready(function(){

    fetchEmployees()
    .then(function (emp) {
		//simulates a user id 
		// returns a valid userId from 0 to the highest existing ID
       userName = Math.floor(Math.random() * highestID) + 1;
    })

    .catch(function () {
        console.log("Ups, something went wrong....");
    })
fetchCsvData()
    .then(function (csv) {
	   
		//gets currently logged in User; cannot use it here to simmulate effectively because we only have one user
		//users and their IDs are simulated above with a Math.random function
        /** AJS.$.get("/jira/rest/auth/1/session", function (data) {
            userName = data.name;
        }); */

 
        var x = matchUserToUserId(userName, csv);
        //console.log(x);
        var data = surveyAnswersAsArray(x);
        //console.log(data);
        var sortedData = sortAnswersByDate(data);
        //console.log(sortedData);
		
		
		// **** Erstellen der Strings für die angezeigten Meldungen ganz oben im Dashboard ****
        // Totalscore ausgabe Burnout Test
        var totalscoreBurnOut = lastTwoScores((sortedData));
        if (totalscoreBurnOut[1] >= 55) {
            totalScoreString = ("Die Auswertung Ihrer Antworten ergibt " + totalscoreBurnOut[1] + ". Dieser Wert ist erhöht und bedeutet, dass es ratsam für sie wäre sich mit dem Thema Burnout zu  beschäftigen. Es wird empfohlen professionelle Hilfe aufzusuchen.");
			totalScoreLevelString = "danger";
        } 
		else {
            totalScoreString = ("Die Auswertung Ihrer Antworten ergibt " + totalscoreBurnOut[1] + ". Dieser Wert liegt im grünen Bereich!");
			totalScoreLevelString = "success";
        }
		
		// Distanziertheit
		var string_distanziertheit;
		var level_distanziertheit;
		if (((lastTwoScoresDistanziertheit(sortedData)[0])) >= 19){
			string_distanziertheit = ("Ihr Wert im Bereich Distanziertheit beträgt: " + String (lastTwoScoresDistanziertheit(sortedData)[0]) + ". Dieser Wert ist erhöht, bitte suchen sie Hilfe auf. Die Vertrauensperson unseres Unternehmens hilft Ihnen gerne.");
			level_distanziertheit = "danger";
		}
		else{
			string_distanziertheit = ("Ihr Wert im Bereich Distanziertheit beträgt: " + String (lastTwoScoresDistanziertheit(sortedData)[0]) + ". Dieser Wert liegt im Normalbereich.");
			level_distanziertheit = "success";
		}
		
		// Misserfolge
		var string_misserfolge;
		var level_misserfolge;
		if (((lastTwoScoresMisserfolge(sortedData)[0])) >= 19){
			string_misserfolge = ("Ihr Wert im Bereich Misserfolge beträgt: " + String (lastTwoScoresMisserfolge(sortedData)[0]) + ". Dieser Wert ist erhöht, bitte suchen sie Hilfe auf. Die Vertrauensperson unseres Unternehmens hilft Ihnen gerne.");
			level_misserfolge = "danger";
		}
		else{
			string_misserfolge = ("Ihr Wert im Bereich Misserfolge beträgt: " + String (lastTwoScoresMisserfolge(sortedData)[0]) + ". Dieser Wert liegt im Normalbereich.");
			level_misserfolge = "success";
		}
		
		// Emotionale Erschöpfung
		var string_EE;
		var level_EE;
		if (((lastTwoScoresEmotionaleErschöpfung(sortedData)[0])) >= 19){
			string_EE = ("Ihr Wert im Bereich Emotionale Erschöpfung beträgt: " + String (lastTwoScoresEmotionaleErschöpfung(sortedData)[0]) +  ". 	Dieser Wert ist erhöht, bitte suchen sie Hilfe auf. Die Vertrauensperson unseres Unternehmens hilft Ihnen gerne.");
			level_EE = "danger";
		}
		else{
			string_EE = ("Ihr Wert im Bereich Emotionale Erschöpfung beträgt: " + String (lastTwoScoresEmotionaleErschöpfung(sortedData)[0]) + ". Dieser Wert liegt im Normalbereich.");
			level_EE = "success";
		}
		
		/* // Auswertung des NLP Scores
		var string_NLP;
		var level_NLP;
		// TODO NLP Werte abfragen und Schwellenwert anpassen
		var NLP_value = 2;
		if (NLP_value >= 3){
			string_NLP = ("Ihr Wert bei der Auswertung der Freifelder beträgt " + String(NLP_value) +  ". 	Dieser Wert ist erhöht, bitte suchen sie Hilfe auf. Die Vertrauensperson unseres Unternehmens hilft Ihnen gerne.");
			level_NLP = "danger";
		}
		else{
			string_NLP = ("Ihr Wert bei der Auswertung der Freifelder beträgt " + String(NLP_value) + ". Dieser Wert liegt im Normalbereich.");
			level_NLP = "success";
		}
		 */
		 
		
		var warnings = [
			{ level: totalScoreLevelString, children: [createSpan(totalScoreString)] },
			{ level: level_distanziertheit, children: [createSpan(string_distanziertheit)] },
			{ level: level_misserfolge, children: [createSpan(string_misserfolge)] },
			{ level: level_EE, children: [createSpan(string_EE)] }
		//	{ level: level_NLP, children: [createSpan(string_NLP)]}
		];

		// Select the HTML element with the ID "alertlist"
		var alertlist = document.querySelector("#alertlist");

		// 2. Remove "Loading..." placeholder
		if (alertlist.childElementCount != 1) {
			throw "Invalid DOM state!";
		}
		alertlist.removeChild(alertlist.children[0]);

		// 3. Show the Warnings
		warnings.forEach(function (warning) {
			var warning_alert = createHtmlAlert(warning.level, warning.children);
			alertlist.appendChild(warning_alert);
		});


        // Grafik 1 - Spiderchart of Subcategories
	    createFirstChart(sortedData);
		// Grafik 2 - Gesamtscore Verlauf über die letzten 12 Monate
		createSecondChart(sortedData, csv);
		// Grafik 3 - Persönliche Stimmung der letzten 12 MOnate
		createThirdChart(sortedData,csv);
		
		
		// Fill Free Text for NLP resultsArray
		//var free_text = document.getElementById("NLP_texts");
		//free_text.appendChild(createSpan("TODO Hier kann die Auswertung von NLP als Text rein"));
		//free_text.innerHTML = createSpan("TODO Hier kann die Auswertung von NLP als Text rein");
		
		

    })
    //.catch(function () {
    //    console.log("Ups, something went wrong....");
    //});






 //});

src = "libraries/chartjs-plugin-annotation.js"


/**
 * @file
 * Functionality of the ethical analysis dashboard plugin.
 */

 /**
  * sets the right month in the headline of the gadget
  * 
  * @param {Number} month
  *    the month we want to set in the headline  
  */
  
function setHeadline(latestMonth, months){
	var mapping = {1: "Januar", 2: "Februar", 3:"März", 4:"April", 5:"Mai", 6:"Juni", 7:"Juli", 8:"August", 9:"September", 10:"Oktober", 11:"November", 12:"Dezember"};
	//updating the headig of the table
	var h = document.getElementById("headline");
	h.innerHTML = "Auswertung: Fragebogen zur Teamarbeit - " + mapping[latestMonth];

	var mapping2 = {1: "Jan", 2: "Feb", 3:"Mär", 4:"Apr", 5:"Mai", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Okt", 11:"Nov", 12:"Dez"};
	for(var i = 1;i<=12;i++){
		let s = "month" + i;
		document.getElementById(s).innerHTML= mapping2[months[i-1]];
	}

}


/**
 * Rounds % numbers
 * 
 * @param {Number} numb 
 *    the number to be rounded
 * @param {Number} n_position 
 *    specifies positions after decimal point
 */
function extround(zahl,n_stelle) {
zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}


/** 
 * Here we fetch the survey data csv file as an array of objects. 
 * Each object corresponds to one record in the survey data csv file.
 * The csv file always contains data of the last 12 months.
 */
async function fetchCsvData(){
    const response = await fetch('http://localhost:8080/feature2');
    let data = await response.json();
    return data;
}


/**
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure.
 * @returns {Array} Array of twelve strings. Each string is one of the 12 questions about the team in the survey.
 */
function getAllTeamQuestions(csv){
	//just take the first object in the csv and get its keys
	let allKeys =  Object.keys(csv[0]);
	let keys= [];
	//The questions we want are from index 11 to 22
	for(let i =7;i<=18;i++)
		keys.push(allKeys[i]);

	return keys;
}


/**
 * @param {Number} latestMonth 
 * 		a number between 1 and 12 for the respective month
 * @returns {Array} an Array of twelve Numbers, each of them between 1 and 12. 
 * 		e.g. if the parameter latestMonth is 3, the following array is returned:
 * 		[4,5,6,7,8,9,10,11,12,1,2,3]
 */
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


/**
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure.
 * @returns {Number} the latest month in the specified array
 */
function getLatestMonth(csv){
	var latestDate = "1999.01.01";	

	for(let record of csv){
		let dateOfRecord = convertToISOdateString(record["Datum und Zeit"].substring(0,10));
		if(dateOfRecord>latestDate)
			latestDate = dateOfRecord;
	}
	return Number(latestDate.substring(5,7));
}


/** converts a String of the format DD.MM.YYYY to a String of the format YYYY-MM-DD
* 
* @param {String} str 
*    a String in the format DD.MM.YYYYY
* @returns {String} a String of the format YYYY-MM-DD
*/
function convertToISOdateString(str){
	var year = str.substring(6,11);
	var month = str.substring(3,5);
	var day = str.substring(0,2);
	return year + "-" + month + "-" + day;
}


/**
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure.
 * @returns {Array}  an Array of 12 Numbers. Each Number is the average Mood in the company of the corresponding month
 * 	  and thus has a value between 1 and 10
 */
function getAVGCompanyMoods12Months(csv){
	var lastMonth = getLatestMonth(csv);
	let moods = [0,0,0,0,0,0,0,0,0,0,0,0];

	//get the last 12 months in correct order:
	let months = getLast12Months(lastMonth);

	for(var i =0;i<months.length; i++){
		var answerCounter = 0;
		for(let record of csv){
			if(Number(record["Datum und Zeit"].substring(3,5))===months[i]){
				answerCounter++;
				moods[i] += record["6. Wie wohl fühlen Sie sich im Team auf einer Skala von 1 (sehr unwohl) bis 10 (sehr wohl)"];
			}
		}
		//calc the average mood of the corresponding month
		moods[i] = Number((moods[i]/answerCounter).toFixed(1));
	}
	return moods;
}


/**
 * calculates the average score of each of the 12 Teamquestions in the survey and returns the scores in an array
 * 
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure. 
 * @param {Number} month
 * 	  a number between 1 and 12 for the respective month
 * @returns {Array} an Array of 12 Numbers. Each Number ist the Average Score of the corresponding question in the specified month.
 * 	  
 */
function calcAVGsOfTeamquestions(csv, month){
	//this variable counts how many employees took part in the survey in the specified month
	let answerCounter=0;
	
    //creating an Array with the texts of the questions in the survey
	let keys = Object.keys(csv[0]);
	
	//this will contain the average scores for each of the 12 questions
    let answerArr= [0,0,0,0,0,0,0,0,0,0,0,0];
    
     for(let record of csv){
        if(Number(record["Datum und Zeit"].substring(3,5))===month){
            answerCounter++;
            let keyIndex = 0;
            let answerIndex = 0;//indexes fpr the answerArray, so that is has not so many empty fields
            for(answer in record){//durch die Eigenschaften eines Datensatzes iterieren
                if(keyIndex >= 7 && keyIndex <= 18){
                    answerArr[answerIndex] += record[answer];
                    answerIndex++;
                }
                keyIndex++;
			}      
        }
	} 
	answerArr = answerArr.map(x => Number((x / answerCounter).toFixed(1)));
    return answerArr;
}


/**
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure. 
 * @param {Number} month
 * 	  a number between 1 and 12 for the respective month
 * @returns {Array} an Array of 5 Numbers (the average scores of the regular employees (not the managers!) on the last 5 of the 12 questions on the team).
 */
function getTeamOpinionOnManager(csv, month){
	//this variable counts how many employees took part in the survey in the specified month
	let answerCounter=0;

    //creating an Array with the texts of the questions in the survey
	let keys = Object.keys(csv[0]);

	//this will contain the average scores for each of the last 5 of the 12 questions on the team
    let answerArr= [0,0,0,0,0];
    
     for(let record of csv){
        if(Number(record["Datum und Zeit"].substring(3,5))===month && record["1. Welche Rolle haben Sie?"] == "Mitarbeiter"){
            answerCounter++;
            let keyIndex = 0;
            let answerIndex = 0;
            for(answer in record){
                if(keyIndex >= 14 && keyIndex <= 18){
                    answerArr[answerIndex] += record[answer];
                    answerIndex++;
                }
                keyIndex++;
			}      
        }
	} 
	answerArr = answerArr.map(x => Number((x / answerCounter).toFixed(1)));
    return answerArr;
}


/**
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure. 
 * @param {Number} month
 * 	  a number between 1 and 12 for the respective month
 * @returns {Array} an Array of 5 Numbers (the average scores of the managers (not the regular employees!) on the last 5 of the 12 questions on the team).
 */
function getManagerOpinionOnManager(csv, month){
	//this variable counts how many employees took part in the survey in the specified month
	let answerCounter=0;

    //creating an Array with the texts of the questions in the survey
	let keys = Object.keys(csv[0]);

	//this will contain the average scores for each of the last 5 of the 12 questions on the team
    let answerArr= [0,0,0,0,0];
    
     for(let record of csv){
        if(Number(record["Datum und Zeit"].substring(3,5))===month && record["1. Welche Rolle haben Sie?"] == "Teamleiter"){
            answerCounter++;
            let keyIndex = 0;
            let answerIndex = 0;
            for(answer in record){
                if(keyIndex >= 14 && keyIndex <= 18){
                    answerArr[answerIndex] += record[answer];
                    answerIndex++;
                }
                keyIndex++;
			}  
        }
	} 
	answerArr = answerArr.map(x => Number((x / answerCounter).toFixed(1)));
    return answerArr;
}


/**
 * @param {Array} csv 
 *	  contains all the records from the survey data csv file. Each record is an Object of the same structure.
 * @returns {Array} an Array of Strings. Each Strign is a short name for one of the last 12 months.
 */
function getLabelsLast12Months(csv){
	var months = getLast12Months(getLatestMonth(csv));
	var mapping = {1: "Jan", 2: "Feb", 3:"Mär", 4:"Apr", 5:"Mai", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Okt", 11:"Nov", 12:"Dez"};
	var labels = [];
	for(let month of months)
		labels.push(mapping[month]);
	
	return labels;
}

function createFirstGraph(csv){
	// gather Data
	let labels_twelve_questions = ["1","2","3","4","5","6","7","8","9","10","11","12"];
	let labels_twelve_questions_full = getAllTeamQuestions(csv);

	let month = getLatestMonth(csv);
	let data_12_questions = calcAVGsOfTeamquestions(csv, month);
	let prev_month = (month === 1) ? 12 : (month-1);
	let data_12_questions_one_month_before = calcAVGsOfTeamquestions(csv, prev_month);
		
	// create chart
	var questionchart = document.getElementById("questionChart");
	questionchart.height = 500;
	questionchart.width = 700;
	myChart = new Chart(questionchart, {
		type: 'bar',
		data: {
			labels: labels_twelve_questions,
			datasets: [{
				label: 'Teamdurchschnitt aktueller Monat',
				data: data_12_questions,
				backgroundColor: 'rgba(255,99,132,0.6)'
			},
			{
				label: 'Teamdurchschnitt Vormonat',
				data: data_12_questions_one_month_before,
				backgroundColor: 'rgba(255,159,64,0.6)'
			}],
		},
		options:{
			responsive: false,
			title:{
				display:true,
				text:'Durchschnittsergebnisse der 12 IPT Fragen ',
				fontSize:15
			},
			legend: {
				display: true
			},
			// show the specific question when hovering over the bars
			tooltips: {
				callbacks: {
					label: function(tooltipItem) {
						return labels_twelve_questions_full[tooltipItem.index];
					},
					afterLabel: function(tooltipItem) {
						return "Teamdurchschnitt: " + Number(tooltipItem.yLabel);
					}
				}
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
						labelString: 'Nr. der Frage'
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						stepSize: 1,
						min: 0,
						max: 5
					},
					scaleLabel:{
						display: true,
						labelString: 'Level der Zustimmung'
					}
				}]
			},
			// add the threshold line --> Works in HTML, does not work when using Jira :(
			annotation: {
				drawTime: 'afterDatasetsDraw',
							annotations: [{
								id: 'hline',
								type: 'line',
								mode: 'horizontal',
								scaleID: 'y-axis-0',
								value: 3,
								borderColor: 'red',
								borderWidth: 3,
								label: {
									backgroundColor: 'red',
									content: 'Threshold',
									position: 'left',
									enabled: true
								}
							}]
			}
		} 		  
	});
}

function createThiGraph(csv){
	// gather Data
	labels_twelve_months = getLabelsLast12Months(csv);
	data_mood_company_twelve_months = getAVGCompanyMoods12Months(csv);
		
	// create Chart
	var teamchart = document.getElementById("teamChart");
	teamchart.height = 400;
	teamchart.width = 700;
	myChart = new Chart(teamchart, {
		type: 'line',
		data: {
			labels: labels_twelve_months,
			datasets: [{
				label: 'Wie wohl fühlen Sie sich im Team auf einer Skala von 1 bis 10',
				data: data_mood_company_twelve_months,
				backgroundColor: 'rgba(75,192,192,0.6)'
			}],
		},
		options:{
			responsive: false,
			title:{
				display:true,
				text:'Verlauf des Wohlbefindens im Team',
				fontSize:15
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
			elements:{
				line: {tension:0}
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
						min: 0,
						max: 10
					},
					scaleLabel:{
						display: true,
						labelString: 'Wohlfühlen im Team'
					}
				}]
			}
		} 		  
	});		
}

function createSecGraph(csv){
	// gather data
	labels_manager_chart = ["8","9","10","11","12"];
	data_last_five_questions_team = getTeamOpinionOnManager(csv, getLatestMonth(csv));
	data_last_five_questions_manager = getManagerOpinionOnManager(csv,getLatestMonth(csv));
	let labels_twelve_questions_full = getAllTeamQuestions(csv);

	
	// create Chart
	var managerchart = document.getElementById("managerChart");
	managerchart.height = 500;
	managerchart.width = 700;
	myChart = new Chart(managerchart, {
		type: 'bar',
		data: {
			labels: labels_manager_chart,
			datasets: [{
				label: 'Einschätzung des Teams',
				data: data_last_five_questions_team,
				backgroundColor: 'rgba(54,162,235,0.6)'
			},
			{
				label: 'Einschätzung des Managements',
				data: data_last_five_questions_manager,
				backgroundColor: 'rgba(255,159,64,0.6)'
				
			}],
			
		},
		options:{
			responsive: false,
			title:{
				display:true,
				text:'Vergleich Teameinschätzung mit Managementeinschätzung',
				fontSize:15
			},
			legend: {
				display: true
			},
			layout:{
				padding:{
					left: 50,
					right: 50
				}
			},
			// show the specific question when hovering over the bars
			tooltips: {
				callbacks: {
					label: function(tooltipItem) {
						return labels_twelve_questions_full[tooltipItem.index +7];
					},
					afterLabel: function(tooltipItem) {
						return "Ergebnis: " + Number(tooltipItem.yLabel);
					}
				}
			},
			scales: {
				xAxes: [{
					scaleLabel:{
						display: true,
						labelString: 'Nr. der Frage'
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						stepSize: 1,
						min: 0,
						max: 5
					},
					scaleLabel:{
						display: true,
						labelString: 'Level der Zustimmung'
					}
				}]
			}
		} 		  
	});
}



function generateTable(table, tableData) {
	
	for(var i = 0;i<tableData.length;i++){

	  let row = table.insertRow();
	  for(var j = -1; j<tableData[i].length;j++){
		let cell = row.insertCell();
		let text = "";
		if(j===-1){
				if(i===0)
					text = document.createTextNode("kritisch");
				if(i===1)
					text = document.createTextNode("neutral");
				if(i===2)
					text = document.createTextNode("positiv");
				
		} else
			text = document.createTextNode(tableData[i][j]);


		cell.appendChild(text);
		if(j===-1)
			cell.style.backgroundColor="LightGrey";
	  }
	}
  
	table.className="table table-responsive";
}


function calcCriticalPercentage(month, csv){
	let answerCounter = 0;
	let criticalCounter = 0;

	for(let record of csv){
		if(Number(record["Datum und Zeit"].substring(3,5))===month){
			answerCounter++;
			if(record["NLP_score"]<= -1.5)
				criticalCounter++;
		}
	}

	return (criticalCounter/answerCounter*100).toFixed(0);
}


function calcPositivePercentage(month, csv){
	let answerCounter = 0;
	let positiveCounter = 0;

	for(let record of csv){
		if(Number(record["Datum und Zeit"].substring(3,5))===month){
			answerCounter++;
			if(record["NLP_score"]>= 1.5)
				positiveCounter++;
		}
	}

	return (positiveCounter/answerCounter*100).toFixed(0);
}


function calcNeutralPercentage(month, csv){
	let answerCounter = 0;
	let neutralCounter = 0;

	for(let record of csv){
		if(Number(record["Datum und Zeit"].substring(3,5))===month){
			answerCounter++;
			if(record["NLP_score"]< 1.5 && record["NLP_score"]> -1.5 )
				neutralCounter++;
		}
	}


	return (neutralCounter/answerCounter*100).toFixed(0);
}


// [ETHICAL_SSE] If you want to immediately run a function when importing the JavaScript, simply trigger it here.
// Alternatively, you may also let them be called from the HTML, e.g. when pressing a button: https://www.w3schools.com/jsref/event_onclick.asp
	 
fetchCsvData()
	.then(function(csv){ 
	//Fill the Headline
	let latestMonth = getLatestMonth(csv);	
	var months = getLast12Months(latestMonth);
	setHeadline(latestMonth, months);

	//Create the three Charts
	createFirstGraph(csv);
	createThiGraph(csv);
	createSecGraph(csv);


	//creating the NLP Table
	let critical = [];
	let neutral = [];
	let positive = [];
	for(let month of months){
		critical.push(calcCriticalPercentage(month, csv));
		neutral.push(calcNeutralPercentage(month, csv));
		positive.push(calcPositivePercentage(month, csv));
	}

	var tableData = [critical, neutral, positive];

	var table = document.getElementById("NLPtable");
	generateTable(table, tableData);

    });

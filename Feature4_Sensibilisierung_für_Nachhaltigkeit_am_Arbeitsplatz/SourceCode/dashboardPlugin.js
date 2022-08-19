/**
 * @file
 * Functionality of the ethical analysis dashboard plugin.
 */

// will contain all IDs, First Names and Last Names of all the employees after fetching
var allEmployees = [];

//will be an array of objects that represents the logfile of the coffee machine after fetch
var global_csv;

// will be used to check, if the graph already exists (update it) or not (create it)
var first_creation;

// Chart for the chart over 12 months
var myChart;

// variable for the chosen mode of the second dropdown menu
var chosen_mode;

// variable for the chosen employee of the first dropdown menu
var chosen_employee;

/**
 * Sets the global variable to the according value chosen by the user
 *
 * @param {Number} mode
 *    Indicates the chosen mode by the user
 */
function set_global_mode (mode){
	chosen_mode = Number(mode);
}


/**
 * Sets the global variable to the according ID chosen by the user
 *
 * @param {String} ID
 *    Indicates the chosen ID by the user
 */
function set_current_employee(ID){
	chosen_employee = Number (ID)
}


/**
 * Rounds % numbers
 *
 * @param {Number} numb
 *    the number to be rounded
 * @param {Number} n_position
 *    specifies positions after decimal point
 */
function extround(numb,n_position) {
  numb = (Math.round(numb * n_position) / n_position);
  return numb;
}


/**
 * finds the latest week in the logfile of the coffee machine
 *
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 * @returns {Number} latest week in the logfile
 */
function getLastWeek(logfile){
  let highestDate = findHighestDateInISOFormat(logfile);
  let d = highestDate.substring(8,10) + "." + highestDate.substring(5,7) + "." + highestDate.substring(0,4);
  for(let record of logfile){
    if(record.Datum = d)
      return record.Woche;
  }
}


/* finds the latest date in the logfile of the coffee machine
*
* @param {Array} logfile
*    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
* @returns {String} latest Date in logfile in ISO Format YYYY-MM-DD
*/
function findHighestDateInISOFormat(logfile){
 var allDates = [];
 for(var i=0; i<logfile.length; i++)
   allDates.push(convertToISOdateString(logfile[i].Datum));

 var highest = "1900-01-01";
   for(var i = 0; i<allDates.length; i++){
     if(allDates[i] > highest)
       highest = allDates[i];
   }
   return highest;

}


/**
 * converts a String of the format DD.MM.YYYY to a String of the format YYYY-MM-DD
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



//-------------Start of calculations for the table at the top of the gadget-------------------------

/**
 * calculates the amount of paper cups consumed by the specified employee in the specified week
 *
 * @param {Number} employeeID
 *    the ID of the employee whose paper cup consumption we want to calculate
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of paper cups consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcCupsPerEmployeePerWeek(employeeID, week, logfile){
  var amountCups = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && logfile[i].Woche===week)
      amountCups += logfile[i].Pappbecher;
  }
  return amountCups;
}


/**
 * calculates the amount of paper cups consumed by all the employees together in the specified week
 *
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of paper cups consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcCupsAllEmployeesPerWeek(week, logfile){
  var amountCups = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].Woche===week)
      amountCups += logfile[i].Pappbecher;
  }
  return amountCups;
}


/**
 * calculates the amount of paper cups the specified employee has consumed in the specified week
 * plus the eleven weeks before
 *
 * @param {Number} employeeID
 *    the ID of the employee whose paper cup consumption we want to calculate
 * @param {Number} latestWeek
 *    the latest calendar week in which we want to calculate the amount of paper cups consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 * @returns {Number} the summed up paper cup consumption of the specified employee over 12 weeks
 */
function calcCupsPerEmployee12Weeks(employeeID, latestWeek, logfile){
  var amountCups = 0;
  var last12Weeks = getLabelsLast12Weeks(latestWeek);

  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && last12Weeks.includes(logfile[i].Woche))
      amountCups += logfile[i].Pappbecher;
  }
  return amountCups;
}


/**
 * calculates how many paper cups an employee (not a specific one) of the company has consumed on average in the specified week
 *
 * @param {*} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of paper cups consumed
 */
function calcCompanyAVGPerWeek(logfile, week){
  let firmenPappeWoche = 0;
  for(let record of logfile)
    if(record.Woche===week)
      firmenPappeWoche += record.Pappbecher;

  return (firmenPappeWoche/allEmployees.length).toFixed(2);
}


/**
 * calculates the coffee consumption (porcelain mug + paper cup) of the specified employee in the specified week
 *
 * @param {Number} employeeID
 *    the ID of the employee whose coffee consumption we want to calculate
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of coffee consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcCoffeePerEmployeePerWeek(employeeID, week, logfile){
  var amountCoffee = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && logfile[i].Woche===week)
      amountCoffee++;
  }
  return amountCoffee;
}


/**
 * calculates the coffee consumption (porcelain mug + paper cup) of all employees in sum in the specified week
 *y
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of coffee consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcCoffeeAllEmployeesPerWeek(week, logfile){
  var amountCoffee = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].Woche===week)
      amountCoffee++;
  }
  return amountCoffee;
}


/**
 * calculates the coffee consumption (porcelain mug + paper cup) of the specified employee in the specified week
 * plus the eleven weeks before
 *
 * @param {Number} employeeID
 *    the ID of the employee whose coffee consumption we want to calculate
 * @param {Number} week
 *    the latest calendar week in which we want to calculate the amount of coffee consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcCoffeePerEmployee12Weeks(employeeID, week, logfile){
  var amountCoffee = 0;
  var last12Weeks = getLabelsLast12Weeks(week);
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && last12Weeks.includes(logfile[i].Woche))
      amountCoffee++;
  }
  return amountCoffee;
}


/**
 * calculates the amount of bio products consumed by the specified employee in the specified week
 *
 * @param {Number} employeeID
 *    the ID of the employee whose bio product consumption we want to calculate
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of bio products consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcBioPerEmployeePerWeek(employeeID, week, logfile){
  var amountBio = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && logfile[i].Woche===week)
      amountBio += logfile[i].Bioprodukt;
  }
  return amountBio;
}


/**
 * calculates the bio product consumption of all employees in sum in the specified week
 *
 * @param {Number} week
 *    the calendar week in which we want to calculate the amount of bio products consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcBioAllEmployeesPerWeek(week, logfile){
  var amountBio = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].Woche===week)
      amountBio += logfile[i].Bioprodukt;
  }
  return amountBio;
}


/**
 * calculates the bio product consumption of the specified employee in the specified week
 * plus the eleven weeks before
 *
 * @param {Number} employeeID
 *    the ID of the employee whose bio product consumption we want to calculate
 * @param {Number} week
 *    the latest calendar week in which we want to calculate the amount of bio products consumed
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcBioPerEmployee12Weeks(employeeID, week, logfile) {
  var amountBio = 0;
  var last12Weeks = getLabelsLast12Weeks(week);
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && last12Weeks.includes(logfile[i].Woche))
      amountBio += logfile[i].Bioprodukt;
  }
  return amountBio;
}


/**
 * calculates the environment-score of the specified employee in the specified week
 *
 * @param {Number} employeeID
 *    the ID of the employee whose environment-score we want to calculate
 * @param {Number} week
 *    the calendar week in which we want to calculate the environment-score
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcScore(employeeID, week, logfile){
  let score = 0;
  /**
   * The score is -1 for each paper cup consumed and also -1 when a not-bio product is consumed.
   * So if someone drinks a not-bio coffee out of a paper cup, then -2 is added to his score.
   * The best possible value of the score is therefore 0
   */
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].MitarbeiterID===employeeID && logfile[i].Woche===week)
      score = score-logfile[i].Pappbecher + (logfile[i].Bioprodukt-1);
  }
  return score;
}

//-------------End of calculations for the table at the top of the gadget--------------------------


/**
 * creates an array of size 12 with the number of the specified calendar week and the 11 weeks before
 *
 * @param {Number} latestWeek
 *    the latest calender week which we want to show in a diagram
 * @returns {Array} an Array of numbers of calendar weeks
 *    like this for example if the specified week paramter is 4: [45,46,47,48,49,50,51,52,1,2,3,4]
 */
function getLabelsLast12Weeks(latestWeek){
  let weeks = [];
  if(latestWeek >=12){
    for(var i = 11; i>=0;i--)
      weeks.push(latestWeek-i);
  } else {
    let startWeek = 52-(11-latestWeek);
    while(startWeek<=52){
      weeks.push(startWeek);
      startWeek++;
    }
    for(var i =1;i<=latestWeek;i++)
      weeks.push(i);
  }
  return weeks;
}


/**
 *calculates the amount of bio coffees that were drunken out of a porcelain mug by all employees together in the specified week
 *
 * @param {*} week
 *    the calendar week in which we want to calculate the amount of bio coffees drank out of a porcelain mug
 * @param {*} logfile
 *   contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function calcBioAndMugsAllEmployeesPerWeek(week, logfile){
  var amount = 0;
  for(var i = 0; i<logfile.length;i++){
    if(logfile[i].Woche===week&& logfile[i].Bioprodukt===1 && logfile[i].Pappbecher===0)
      amount += logfile[i].Bioprodukt;
  }
  return amount;
}

/**
 * this function is called when the user clicks on the button to select a specific employee
 * to visualize a specific measure over the last 12 weeks
 */
function dropdownTrigger() {
  document.getElementById("dropdown_coffee").classList.toggle("show");
}

/**
 * this function is called when the user clicks on the button to select a specific mode
 * to visualize a specific measure over the last 12 weeks
 */
function dropdownTrigger_mode() {
  document.getElementById("dropdown_mode").classList.toggle("show");
}

/**
 * this function is triggered to close the dropdown menu if the user clicks outside of it
 */

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

/**
 * this function displays the paper cup consumption per week of the specified employee over the last 12 weeks in a bar chart.
 * It also shows the avg company paper cup consumption in the respective weeks.
 *
 * @param {Number} ID
 *    the ID of the employee whose metric we want to show in the diagam
 */
function showtimechart(ID){
  current_week = getLastWeek(global_csv);

	// create the labels for the x-Axis
  labels_twelve_weeks_numbers_only = getLabelsLast12Weeks(current_week);
  //Add the string "KW" to each weeknumber
  labels_twelve_weeks =[];
  for(let week of labels_twelve_weeks_numbers_only)
    labels_twelve_weeks.push("KW" + week);

  //Create the data of the employee and the company avg

  // coffee
  data_twelve_weeks = [];
  for(let week of labels_twelve_weeks_numbers_only)
    data_twelve_weeks.push(calcCupsPerEmployeePerWeek(Number(ID),week, global_csv));

  data_twelve_weeks_company = [];
  for (let week of labels_twelve_weeks_numbers_only)
    data_twelve_weeks_company.push(calcCompanyAVGPerWeek(global_csv, week));

  //bio in %
  data_bio_twelve_weeks = [];
  for(let week of labels_twelve_weeks_numbers_only)
    data_bio_twelve_weeks.push((calcBioPerEmployeePerWeek(Number(ID), week, global_csv)/calcCoffeePerEmployeePerWeek(Number(ID), week, global_csv)).toFixed(2));

  data_bio_twelve_weeks_company = [];
  for (let week of labels_twelve_weeks_numbers_only)
    data_bio_twelve_weeks_company.push((calcBioAllEmployeesPerWeek(week, global_csv)/calcCoffeeAllEmployeesPerWeek(week, global_csv)).toFixed(2));

  // score
  data_score_twelve_weeks = [];
  for(let week of labels_twelve_weeks_numbers_only)
    data_score_twelve_weeks.push(calcScore(Number(ID), week, global_csv));

  data_score_twelve_weeks_company = [];
  for(let week of labels_twelve_weeks_numbers_only)
    data_score_twelve_weeks_company.push(calcAVGComanyScorePerWeek(global_csv, week));

  let name = "";
  for(let employee of allEmployees){
    if (employee.MitarbeiterID === Number(ID)){
      name = employee.Vorname + " " + employee.Nachname;
    }
  }

  //Now that we have the data, we can create the actual diagram
	colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A'];
	if (first_creation === 0){
		// create new Chart
    var timechart = document.getElementById("timeChart");
    timechart.height = 450;
		timechart.width = 650;
		myChart = new Chart(timechart, {
			type: 'bar',
			data: {
				labels: labels_twelve_weeks,
				datasets: [{
					label: 'MitarbeiterIn',
					data: data_twelve_weeks,
					backgroundColor: 'rgba(75,192,192,0.6)'
				},
				{
					label: 'Firmenschnitt',
					data: data_twelve_weeks_company,
					backgroundColor: 'rgba(255,159,64,0.6)'
				}],
			},
			options:{
				responsive: false,
				title:{
					display:true,
					text:'verbrauchte Einwegbecher von ' + name,
          fontSize:20,
          fontStyle: 'normal'
				},
				legend: {
					display: true
				},
				layout:{
					padding:{
						left: 0,
            right: 0,
            top: 0,
            bottom: 0
					}
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							stepSize: 1,
						}
					}]
				}
			}
		});
		first_creation = 1;
	}
	else {
		// update existing Chart

		// remove existing data
		for (let i = 0; i<12; i++){
			myChart.data.labels.pop();
			myChart.data.datasets[0].data.pop();
			myChart.data.datasets[1].data.pop();
		}
		// add new data
		if (chosen_mode ===1){
			// display data of wasted coffee cups
			for (let i = 0; i<12; i++){
				myChart.data.labels.push(labels_twelve_weeks[i]);
				myChart.data.datasets[0].data.push(data_twelve_weeks[i]);
				myChart.data.datasets[1].data.push(data_twelve_weeks_company[i]);
			}
			// Set the step Size
			myChart.options.scales.yAxes = [{
						ticks: {
							beginAtZero: true,
							stepSize: 1
						}
			}];
			// adapt the chart's name
			myChart.options.title.text = 'verbrauchte Einwegbecher von ' + name;
			//myChart.options.scales.yAxes.ticks.beginAtZero = true;
		}
		else if (chosen_mode ===2){
			// display data of "umweltscore"
			for (let i = 0; i<12; i++){
				myChart.data.labels.push(labels_twelve_weeks[i]);
				myChart.data.datasets[0].data.push(data_score_twelve_weeks[i]);
				myChart.data.datasets[1].data.push(data_score_twelve_weeks_company[i]);
			}
			// Set the step Size
			myChart.options.scales.yAxes= [{
						ticks: {
							beginAtZero: true,
							stepSize: 1
						}
			}];
			// adapt the chart's name
			myChart.options.title.text = 'Umweltscore von ' + name;
			//myChart.options.scales.yAxes.ticks.beginAtZero = false;
		}

		else if (chosen_mode ===3){
			// display data of "Bioproducts"
			for (let i = 0; i<12; i++){
				myChart.data.labels.push(labels_twelve_weeks[i]);
				myChart.data.datasets[0].data.push(data_bio_twelve_weeks[i]);
				myChart.data.datasets[1].data.push(data_bio_twelve_weeks_company[i]);

			}
			//// Set the step Size
			myChart.options.scales.yAxes = [{
						ticks: {
							beginAtZero: true,
							stepSize: .1
						}
			}];
			// adapt the chart's name
			myChart.options.title.text = 'Anteil konsumierter Biogetränke von ' + name;
			//myChart.options.scales.yAxes.ticks.beginAtZero = false;
		}
		myChart.update();
	}

}

// Creates the graphical interface for the Team Chart Analysis
function createTeamChart(csv){
  var currentweek = getLastWeek(csv);
  var prevWeek = (currentweek === 52) ? 1 : (currentweek-1);
	var nr_all_coffees = calcCoffeeAllEmployeesPerWeek(currentweek, csv);

	//Webchart
	var webchart = document.getElementById("teamChart");
	webchart.height = 500;
	webchart.width = 500;
	var myChart = new Chart(webchart, {
		type: 'radar',
		data: {
			labels: ["Bio", "Tasse", "Bio + Tasse"],
			datasets: [{
				// current week's data
				label: 'aktuelle Woche',
				data: [	extround(calcBioAllEmployeesPerWeek(currentweek, csv)/nr_all_coffees, 100),
						extround(1-(calcCupsAllEmployeesPerWeek(currentweek, csv)/nr_all_coffees), 100),
						extround(calcBioAndMugsAllEmployeesPerWeek(currentweek, csv)/nr_all_coffees, 100)],
				backgroundColor: "rgba(200,0,0,0.2)"
			},
			{
				// last week's data
				label: 'Vorwoche',
				// Ergebnisse werden mittels extround auf 2 Nachkommastellen gerundet
				data: [	extround(calcBioAllEmployeesPerWeek(prevWeek, csv)/nr_all_coffees, 100),
						extround(1-(calcCupsAllEmployeesPerWeek(prevWeek, csv)/nr_all_coffees), 100),
						extround(calcBioAndMugsAllEmployeesPerWeek(prevWeek, csv)/nr_all_coffees, 100)],
				backgroundColor: "rgba(0,0,200,0.2)"
			}]
		},
		options:{
			responsive: false,
			title:{
			display:true,
			text:'Teamanalyse des Getränkekonsums in KW' + currentweek,
      fontSize:20,
      fontStyle: 'normal'
			},
			layout:{
				padding:{
					left: 0,
					right: 0,
					bottom: 0,
					top: 0
				}
			},
			scale: {
				ticks: {
					beginAtZero: true,
					min: 0,
					max: 1,
					stepSize: 0.2
				}
			}
		}
	});
}

/**
 * Here we fetch the logfile of the coffee machine as an Array of Objects.
 * Each Object corresponds to one record in the logfile.
 * The logfile always contains data of the 12 latest weeks.
 */
async function fetchCsvData(){
  const response = await fetch('http://localhost:8080/feature4');
  let data = await response.json();
  return data;
}


/**
 * Here we fetch the employees that work in our company/team as an Array of Objects.
 * Each Object corresponds to one row in the employees database.
 */
async function fetchEmployees(){
  const response = await fetch('http://localhost:8080/employees');
  let data = await response.json()
  return data;
}


/**
 * Generates and displays a sortable HTML table where each row is an employee and some corresponding metrics.
 * This function also styles the table using Bootstrap classes.
 *
 * @param {*} table
 *    an HTML tablein which we display various metrics of each employee
 * @param {Array} statSheet
 *    an Array of Objects. Each Object is a row in the displayed HTML table
 */
function generateTable(table, statSheet) {
  for (let record of statSheet) {
    let row = table.insertRow();
    var i = 0;
    for (key in record) {
      let cell = row.insertCell();
      let text = document.createTextNode(record[key]);
      cell.appendChild(text);
      //styling  the columns
      if(i===2||i===3||i===6||i===7)
        cell.style.backgroundColor="LightGrey";
      else
      cell.style.backgroundColor="DarkGrey";
      i++;
    }
  }

  table.className="table table-responsive tablesorter table-sm";
}

/**
 * sets the headline of the table and also the headings of the columns to the lates week.
 *
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 */
function setHeadlines(logfile){
  //updating the headig of the table
  var week = getLastWeek(logfile);
  var h = document.getElementById("headline");
  h.innerHTML = "Kaffeestatistik KW" + week;

  //updating the headings of the columns
  document.getElementById("metric1").innerHTML= "Becher<br>KW" + week;
  document.getElementById("metric3").innerHTML= "Anteil<br>Becher an ges.<br>Kaffeekonsum KW" + week;
  document.getElementById("metric5").innerHTML= "Anteil<br>Bio an ges.<br>Kaffeekonsum KW" + week;
  document.getElementById("metric7").innerHTML= "Umweltscore<br>KW" + week;
}


/**
 * creating the array of metrics (=statSheet) which we want to display in the HTML table
 *
 * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 * @param {Array} emp
 *    contains all employees with their ID, First Name and Last Name
 * @returns {Array} an array of Objects in which each employee has an entry whith his/her corresponding metrics in the structure that is displayed in the html table
 */
function createStatSheetForTable(logfile, emp){
  //we create a statSheet which we build up step by step in the for loop
  var statSheet = emp;
  var week = getLastWeek(logfile);
  for(var i = 0; i<statSheet.length;i++){
    //storing the current employee in a variable for better readability
    var e = statSheet[i];

    e.PappeWoche = calcCupsPerEmployeePerWeek(e.MitarbeiterID, week, logfile);
    var Pappe12Wochen = calcCupsPerEmployee12Weeks(e.MitarbeiterID, week, logfile);
    e.WochenschnittPappe12Wo = (Pappe12Wochen/12).toFixed(2);

    var gesamtKonsumWoche = calcCoffeePerEmployeePerWeek(e.MitarbeiterID, week, logfile);
    if(gesamtKonsumWoche===0)
      e.AnteilPappeWoche = "-";
    else
      e.AnteilPappeWoche = (e.PappeWoche/gesamtKonsumWoche*100).toFixed(0) + "%";

    var gesamtKonsum12Wochen = calcCoffeePerEmployee12Weeks(e.MitarbeiterID, week, logfile);
    if(gesamtKonsum12Wochen===0)
      e.AnteilPappe12Wochen = "-";
    else
      e.AnteilPappe12Wochen = (Pappe12Wochen / gesamtKonsum12Wochen*100).toFixed(0) + "%";


    var BioWoche = calcBioPerEmployeePerWeek(e.MitarbeiterID, week, logfile);
    if(gesamtKonsumWoche===0)
      e.AnteilBioWoche = "-";
    else
      e.AnteilBioWoche =(BioWoche/gesamtKonsumWoche*100).toFixed(0) + "%";

    var Bio12Wochen = calcBioPerEmployee12Weeks(e.MitarbeiterID, week, logfile);
    if(gesamtKonsum12Wochen===0)
      e.AnteilBio12Wochen = "-";
    else
      e.AnteilBio12Wochen = (Bio12Wochen/gesamtKonsum12Wochen*100).toFixed(0) + "%";


    /**
     * we decided to leave these 2 metrics out
     *e.TagesschnittGesamtVerbrauchWoche = e.GesamtVerbrauchWoche/5;
     *e.Tagesschnitt12WoGesamt = e.Wochenschnitt12WoGesamt / 5;
    */

    e.UmweltScore = calcScore(e.MitarbeiterID, week,logfile);
  }

  //creating a version with deleted IDs (since we do not want to display the IDs in the table)
  let statSheetNoIds = JSON.parse(JSON.stringify(statSheet));
  for(let record of statSheetNoIds)
    delete record.MitarbeiterID;

  //add a record for the average-metrics of the company
  var firm = createFirmAvgRecord(logfile, statSheetNoIds, week);
  statSheetNoIds.push(firm);

  return statSheetNoIds;

}


/**
 *
  * @param {Array} logfile
 *    contains all the records from the logfile of the coffee machine. Each record is an Object of the same structure.
 * @param {Array} statSheetNoIds
 *    an Array of Objects. Each Object is an employee with his/her corresponding metrics.
 * @param {Number} week
 *    the calendar week in which we want to calculate the company/team avg
 * @returns {Object} an object that has the same properties(=metrics) as all the other objects in the statSheet that is displayed in the HTML table
 */
function createFirmAvgRecord(logfile, statSheetNoIds, week){
  var firm = {Vorname:"Teamschnitt", Nachname:"-"};
  let firmenCoffee = 0;
  let firmenPappeWoche = 0;
  let firmenBio =0;
  let firmenCoffee12Wo = 0;
  let firmenPappe12Wo = 0;
  let firmenBio12Wo = 0;

  var last12Weeks = getLabelsLast12Weeks(week);

  for(let record of logfile){
    if(record.Woche===week){
      firmenCoffee++;
      firmenPappeWoche += record.Pappbecher;
      firmenBio += record.Bioprodukt;
    }
    if(last12Weeks.includes(record.Woche)){
      firmenCoffee12Wo++;
      firmenPappe12Wo += record.Pappbecher;
      firmenBio12Wo += record.Bioprodukt;
    }
  }

  firm.PappeWoche = (firmenPappeWoche/allEmployees.length).toFixed(2);
  firm.WochenschnittPappe12Wo =(firmenPappe12Wo/12/allEmployees.length).toFixed(2);
  firm.AnteilPappeWoche = (firmenPappeWoche/firmenCoffee*100).toFixed(0) + "%";
  firm.AnteilPappe12Wochen = (firmenPappe12Wo/firmenCoffee12Wo*100).toFixed(0) + "%";
  firm.AnteilBioWoche =(firmenBio/firmenCoffee*100).toFixed(0) + "%";
  firm.AnteilBio12Wochen = (firmenBio12Wo/firmenCoffee12Wo*100).toFixed(0) + "%";
  firm.UmweltScore = 0;

for(let record of statSheetNoIds)
  firm.UmweltScore += record.UmweltScore;

firm.UmweltScore = (firm.UmweltScore/allEmployees.length).toFixed(2);

return firm;
}

function calcAVGComanyScorePerWeek(logfile, week){
  let score= 0;
  for(let emp of allEmployees){
    score += calcScore(emp.MitarbeiterID, week, logfile);
  }
  score = (score/allEmployees.length).toFixed(2);
  return score;
}


// [ETHICAL_SSE] If you want to immediately run a function when importing the JavaScript, simply trigger it here.
// Alternatively, you may also let them be called from the HTML, e.g. when pressing a button: https://www.w3schools.com/jsref/event_onclick.asp


$(document).ready(function(){
 fetchEmployees()
.then(function(emp){
  allEmployees=JSON.parse(JSON.stringify(emp));
})
.then(fetchCsvData()
.then(function(csv){
  setHeadlines(csv);

  //creating the stat sheet for the table
  var statSheetNoIds = createStatSheetForTable(csv, allEmployees);

  //statSheet aufsteigend nach Umweltscore letzter KW sortieren:
  let sortedStatSheetNoIds = JSON.parse(JSON.stringify(statSheetNoIds));
  sortedStatSheetNoIds.sort(function(a, b){return a.UmweltScore - b.UmweltScore;});

  //finally create the HTML table and display it:
  var table = document.getElementById("employeeStats");
  generateTable(table, sortedStatSheetNoIds);

  $("#employeeStats").tablesorter();

  // create the TeamChart Graph
  createTeamChart(csv);


  // **** Individual Block ****
  //sort the employees by ID
	allEmployees.sort(function(a,b){return a.MitarbeiterID - b.MitarbeiterID;});

	// Create Entries of Dropdown Menu 1 (employee)
	for (let record of allEmployees){
		var dropElement = document.createElement('option');
		dropElement.text = record.Vorname + " " + record.Nachname;
		dropElement.value = Number(record.MitarbeiterID);
		dropElement.onclick = function(){set_current_employee(this.value); showtimechart(this.value);};

		var dropdown_options = document.getElementById("dropdown_coffee");
		dropdown_options.appendChild(dropElement);
	}
	// Create Entries of Dropdown Menu 2 (mode)
	var dropElement2_coffee = document.createElement('option');
	dropElement2_coffee.text = 'verbrauchte Einwegbecher';
	dropElement2_coffee.value = 1;
	dropElement2_coffee.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};

	var dropElement2_umweltscore = document.createElement('option');
	dropElement2_umweltscore.text = 'Umweltscore';
	dropElement2_umweltscore.value = 2;
	dropElement2_umweltscore.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};

	var dropElement2_bio = document.createElement('option');
	dropElement2_bio.text = 'Anteil Biogetränke';
	dropElement2_bio.value = 3;
	dropElement2_bio.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};

	var dropdown_two_options = document.getElementById("dropdown_mode");
	dropdown_two_options.appendChild(dropElement2_coffee);
	dropdown_two_options.appendChild(dropElement2_umweltscore);
	dropdown_two_options.appendChild(dropElement2_bio);

	first_creation = 0;
	set_global_mode(1);
	set_current_employee(1);

  global_csv=JSON.parse(JSON.stringify(csv));
  showtimechart(1);
  })
)
});

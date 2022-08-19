/**
 * @file
 * Functionality of the ethical analysis dashboard plugin.
 */


// [ETHICAL_SSE] Below are three example functions how to create HTML elements in JavaScript

// will be used to check, if the graph already exists (update it) or not (create it)
var first_creation;

// Chart for the chart over 12 months
var myChart;

// variable for the chosen mode of the second dropdown menu
var chosen_mode;

// variable for the chosen employee of the first dropdown menu
var chosen_employee;

// list of all users appearing as "assignee"
var allPeople = [];

// variables needed for the correct display
var currentMonth;
var current_season;

// list of closing events
var closures = {};

// Productivity data
var productivityOfEmployees = {};
var productivityCompany = {};

/**
 * Sets the global current_month variable to the actual value
 */
function set_current_month (){
	d = new Date();
	currentMonth = d.getMonth();
}

/**
 * Sets the global current_season variable to the actual value
 */
function set_current_season (){
	var month = currentMonth - 1;
	if (month > 10 || month < 2){
		current_season = 3;
	}
	else if (month > 1 && month < 5){
		current_season = 0;
	}
	else if (month > 4 && month < 8){
		current_season = 1;
	}
	else {
		current_season = 2;
	}
}

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
	chosen_employee = allPeople[ID];
}

/**
 * Fills the time varying data
 */

function fillProductivity(){

		// initialize company productivity
		var company_prod = {};
		company_prod['time'] = [];
		for (var i = 0; i < 14; i++){
			company_prod['time'].push(0);
		}

		company_prod['week'] = [];
		for (var i = 0; i < 5; i++){
			company_prod['week'].push(0);
		}

		company_prod['month'] = [];
		for (var i = 0; i < 12; i++){
			company_prod['month'].push(0);
		}

		company_prod['season'] = [];
		for (var i = 0; i < 4; i++){
			company_prod['season'].push(0);
		}
	
	var num_employees = 0;

	for (var user in closures){
		
		num_employees += 1;

		// initialize the user's productivity metrics
		var user_prod = {};
		user_prod['time'] = [];
		for (var i = 0; i < 14; i++){
			user_prod['time'].push(0);
		}

		user_prod['week'] = [];
		for (var i = 0; i < 5; i++){
			user_prod['week'].push(0);
		}

		user_prod['month'] = [];
		for (var i = 0; i < 12; i++){
			user_prod['month'].push(0);
		}

		user_prod['season'] = [];
		for (var i = 0; i < 4; i++){
			user_prod['season'].push(0);
		}

		// run through user's work and update productivity metric
		closures[user].forEach( function(entry) {
			
			var date = new Date(entry);
			var hour = date.getHours();
			var day = date.getDay();
			var month = date.getMonth();

			// update completion time
			if (hour > 6 && hour < 21){
				user_prod.time[hour - 7] += 1;
				company_prod.time[hour - 7] += 1;
			} 

			// update completion weekday
			if (day < 5){
				user_prod.week[day] += 1;
				company_prod.week[day] += 1;
			}
			
			// update completion month
			user_prod.month[month] += 1;
			company_prod.month[month] += 1;

			// update completion season
			if (month > 10 || month < 3){
				user_prod.season[0] += 1;
				company_prod.season[0] += 1;
			}
			else if (month > 2 && month < 6){
				user_prod.season[1] += 1;
				company_prod.season[1] += 1;
			}
			else if (month > 5 && month < 9){
				user_prod.season[2] += 1;
				company_prod.season[2] += 1;
			}
			else {
				user_prod.season[3] += 1;
				company_prod.season[3] += 1;
			}
		})
		
		productivityOfEmployees[user] = user_prod;
	}
	if (num_employees != 0){
		productivityCompany['time'] = company_prod.time.map(function(x) { return x / num_employees; });
		productivityCompany['week'] = company_prod.week.map(function(x) { return x / num_employees; });
		productivityCompany['month'] = company_prod.month.map(function(x) { return x / num_employees; });
		productivityCompany['season'] = company_prod.season.map(function(x) { return x / num_employees; });
	}
}

// **** Dropdown Functions ****
/**
 * this function is called when the user clicks on the button to select a specific employee
 * to visualize the data over the last period
 */
function dropdownTrigger_person() {
  document.getElementById("dropdown_person").classList.toggle("show");
}

/**
 * this function is called when the user clicks on the button to select a specific interval
 * to visualize a specific data
 */
function dropdownTrigger_interval() {
  document.getElementById("dropdown_interval").classList.toggle("show");
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
};


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
 * @param {Number} LatestMonth  
 *	 
 * @returns {Array} an Array of Strings. Each String is a short name for one of the last 12 months.
 */
function getLabelsLast12Months(LatestMonth){
	var months = getLast12Months(LatestMonth);
	var mapping = {1: "Jan", 2: "Feb", 3:"Mär", 4:"Apr", 5:"Mai", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Okt", 11:"Nov", 12:"Dez"};
	var labels = [];
	for(let month of months)
		labels.push(mapping[month]);
	
	return labels;
}

function showtimechart(ID){

	// create the labels for the x-Axis
	
	set_current_month();
	set_current_season();
	labels_twelve_months = getLabelsLast12Months(currentMonth);
	labels_daytime = ["7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
	labels_days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
	
	var season_labels = ["Winter", "Frühling", "Sommer", "Herbst"];
	labels_seasons = season_labels.slice(current_season+1).concat(season_labels.slice(0, current_season+1));
	
	if (first_creation === 0){
		//Create the data of the employee and the company avg
		// employee
		data_employee = productivityOfEmployees[chosen_employee].month.slice(currentMonth).concat(productivityOfEmployees[chosen_employee].month.slice(0, currentMonth));
		// company average
		data_company = productivityCompany['month'].slice(currentMonth).concat(productivityCompany['month'].slice(0, currentMonth));
		
		
		// create new Chart
		var timechart = document.getElementById("timeChart");
		timechart.width = 800;
		timechart.height = 500;
		myChart = new Chart(timechart, {
			type: 'bar',
			data: {
				labels: labels_twelve_months,
				datasets: [{
					label: 'MitarbeiterIn',
					data: data_employee,
					backgroundColor: 'rgba(75,192,192,0.6)'
				},
				{
					label: 'Firmenschnitt',
					data: data_company,
					backgroundColor: 'rgba(255,159,64,0.6)'
				}],
			},
			options:{
				responsive: false,
				title:{
					display:true,
					text:'Daten von MitarbeiterIn ' + String(chosen_employee),
					fontSize:25
				},
				legend: {
					display: true
				},
				layout:{
					padding:{
						left: 50,
						right: 50,
					}
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							stepSize: 1,
							min: 0
						},
						scaleLabel:{
							display: true,
							labelString: 'Anzahl geschlossener Issues'
						}
					}]
				},
			} 		  
		});
		first_creation = 1;
	}
	else {
		// update existing Chart
		
		// remove existing data
			// max data to remove is 52 (weeks)
		for (let i = 0; i<52; i++){
			myChart.data.labels.pop();
			myChart.data.datasets[0].data.pop();
			myChart.data.datasets[1].data.pop();
		}
		// add new data
		if (chosen_mode ===1){
			// display data of "daytime"
			
			data_daytime = productivityOfEmployees[chosen_employee].time;
			data_daytime_company = productivityCompany['time'];
			for (let i = 0; i<14; i++){
				myChart.data.labels.push(labels_daytime[i]);
				myChart.data.datasets[0].data.push(data_daytime[i]);
				myChart.data.datasets[1].data.push(data_daytime_company[i]);
			}
			// adapt the chart's name
			myChart.options.title.text = 'Daten von MitarbeiterIn ' + String(chosen_employee);
		}
		else if (chosen_mode ===2){
			// display data of "days"
			
			data_days = productivityOfEmployees[chosen_employee].week;
			data_days_company = productivityCompany['week'];
			
			for (let i = 0; i<5; i++){
				myChart.data.labels.push(labels_days[i]);
				myChart.data.datasets[0].data.push(data_days[i]);
				myChart.data.datasets[1].data.push(data_days_company[i]);
			}

			// adapt the chart's name
			myChart.options.title.text = 'Daten von MitarbeiterIn ' + String(chosen_employee);
		}
		
		else if (chosen_mode ===3){
			// display data of "months"
			
			
			// employee
			data_months = productivityOfEmployees[chosen_employee].month.slice(currentMonth).concat(productivityOfEmployees[chosen_employee].month.slice(0, currentMonth));
			// company average
			data_months_company = productivityCompany['month'].slice(currentMonth).concat(productivityCompany['month'].slice(0, currentMonth));

			for (let i = 0; i<12; i++){
				myChart.data.labels.push(labels_twelve_months[i]);
				myChart.data.datasets[0].data.push(data_months[i]);
				myChart.data.datasets[1].data.push(data_months_company[i]);
				
			}
			// adapt the chart's name
			myChart.options.title.text = 'Daten von MitarbeiterIn ' + String(chosen_employee);
		}
		else if (chosen_mode ===4){
			// display data of "season"
			
			var prod_e = productivityOfEmployees[chosen_employee].season;
			var prod_c = productivityCompany['season'];
			data_seasons = prod_e.slice(current_season+1).concat(prod_e.slice(0, current_season+1));
			data_seasons_company = prod_c.slice(current_season+1).concat(prod_c.slice(0, current_season+1));
			for (let i = 0; i<4; i++){
				myChart.data.labels.push(labels_seasons[i]);
				myChart.data.datasets[0].data.push(data_seasons[i]);
				myChart.data.datasets[1].data.push(data_seasons_company[i]);
				
			}
			// adapt the chart's name
			myChart.options.title.text = 'Daten von MitarbeiterIn ' + String(chosen_employee);
		}
		myChart.update();
	}
	
}

/**
 * Creates an HTML <div> element styled as an alert with the given level and text.
 * 
 * @param {String} warning_level
 *   Either "warning" or "danger"
 * @param {Array} warning_text_children
 *   The HTML elements describing the warning text.
 */
function createHtmlAlert(warning_level, warning_text_children) {
    if (["warning", "danger"].indexOf(warning_level) < 0) {
        throw "warning_level has to be either \"warning\" or \"danger\"";
    }

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

/**
 * Fetches a list of issues from teh JIRA REST API.
 */
async function fetchListOfIssues() {
    const response = await fetch("/jira/rest/api/2/search?maxResults=2000");
    var data = await response.json();
    return data.issues;
}

/**
 * Makes a dictionary that maps users to the dates at which they closed an issue.
 * 
 * @param {Array} array
 * 	 a list of issues
 * @returns {Object}
 *   the productivity of all Assignees
 *   
 */
function getTaskClosures(array){
    var assignees = [];
    var productivity = new Object();
    array.forEach( function(issue, i) {
        if (issue.fields.assignee) {
            var assignee = issue.fields.assignee.name;
            if (assignees.indexOf(assignee) == -1) {
                assignees.push(assignee);
                productivity[assignee] = [];
            }
            productivity[assignee].push(issue.fields.updated);
        } else {
            console.log('NOBODY closed ' + i);
        }
    })
    return productivity;
}

/**
 * Makes a list where each user appearing in the input array at least once
 * appears exactly once
 * 
 * @param {Array} array
 *   a list of issues
 * @returns {Array}
 *   a list of unique assignee names
 */
function makeListOfEmployees(array){
	var employees = [];
	array.forEach( function(issue, i) {
        if (issue.fields.assignee) {
            var assignee = issue.fields.assignee.name;
            if (employees.indexOf(assignee) == -1) {
				employees.push(assignee);
			}
		}
	})
	return employees;
}

/**
 * @returns the entropy of each timeseries
 */
function timeSeriesEntropy(){
	var out = [0, 0, 0, 0];
	for (var user in productivityOfEmployees){
		var counter = 0;
		for (var timeseries in productivityOfEmployees[user]){
			var series = productivityOfEmployees[user][timeseries];
			var sum = 0;
			series.forEach( function(item) {
				sum += item;
			})
			if (sum != 0){
				series = series.map(function(x) { return x / sum; });
			}
			out[counter] += entropy(series);
			counter++;
		}
	}
	return out;
}

/**
 * @param {Array} array an array of numbers
 * @returns {int} the entropy of a given array of numbers
 */
function entropy(series){
	var S = 0;
	series.forEach( function(item) {
		if (item != 0){
			S -= item * Math.log(item);
		}
	})
	return S;
}

// Main functionality goes here
fetchListOfIssues()
.then(function (issues) {
    
	closures = getTaskClosures(issues);
	allPeople = makeListOfEmployees(issues);
	fillProductivity();

	var ent = timeSeriesEntropy();
	
	var infostring = "Den größten Einfluss auf die teamweite Produktivität hat ";
	var index = ent.indexOf(Math.min(...ent));

	if (index == 0){
		infostring += "die Tageszeit.";
	}
	else if (index == 1){
		infostring += "der Wochentag.";
	}
	else if (index == 2){
		infostring += "der Monat.";
	}
	else {
		infostring += "die Jahreszeit.";
	}

	var warnings = [
		{ level: "warning", children: [createSpan(infostring)]},
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
	
	
	// Create Entries of Dropdown Menu 1 (employee)
	for (let i = 0; i < allPeople.length; i++){
		var dropElement = document.createElement('option');
		dropElement.text = allPeople[i]; //String(i+1);
		dropElement.value = Number(i+1);
		dropElement.onclick = function(){set_current_employee(this.value-1); showtimechart(this.value);};
		
		var dropdown_options = document.getElementById("dropdown_person");
		dropdown_options.appendChild(dropElement);
	}
	
	// Create Entries of Dropdown Menu 2 (period)
	var dropElement2_daytime = document.createElement('option');
	dropElement2_daytime.text = 'Tageszeit';
	dropElement2_daytime.value = 1;
	dropElement2_daytime.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};	
	
	var dropElement2_day = document.createElement('option');	
	dropElement2_day.text = 'Wochentag';
	dropElement2_day.value = 2;
	dropElement2_day.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};
	
	var dropElement2_month = document.createElement('option');	
	dropElement2_month.text = 'Monat';
	dropElement2_month.value = 3;
	dropElement2_month.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};
	
	var dropElement2_season = document.createElement('option');	
	dropElement2_season.text = 'Jahreszeit';
	dropElement2_season.value = 4;
	dropElement2_season.onclick = function(){set_global_mode(this.value);showtimechart(chosen_employee);};
	
	var dropdown_two_options = document.getElementById("dropdown_interval");
	dropdown_two_options.appendChild(dropElement2_daytime);
	dropdown_two_options.appendChild(dropElement2_day);
	dropdown_two_options.appendChild(dropElement2_month);
	dropdown_two_options.appendChild(dropElement2_season);
	
	// set the initial global variables
	first_creation = 0;
	set_global_mode(3);
	set_current_employee(1);
  	showtimechart(1);
	
});

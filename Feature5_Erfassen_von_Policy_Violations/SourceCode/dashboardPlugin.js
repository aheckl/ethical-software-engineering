/**
 * @file
 * Functionality of the ethical analysis dashboard plugin Feature 5: Erfassen von Policy Violations.
 */


// will be used to generate the first graph in dependence of the chosen entry of the drop down menu
var global_n;

// will be used to generate the first graph in dependence of the chosen entry of the drop down menu 2
var global_violationType;

// will be used to check, if the graph already exists (update it) or not (create it)
var first_creation;


/**
 * Sets the global variable to the according value chosen by the user
 * 
 * @param {N} mode 
 *    Indicates the chosen period of weeks
 */
function set_global_n(N){
	global_n = Number(N);
}

/**
 * Sets the global variable to the according value chosen by the user
 * 
 * @param {type} type 
 *    Indicates the chosen type of policy violation
 */
function set_global_violationType(type){
	global_violationType = Number(type);
}

/**
 * this function is called when the user clicks on the button to select a specific time period
 * to visualize a specific measure over the last 12 weeks
 */
function dropdownTrigger() {
  document.getElementById("dropdown_violation_period").classList.toggle("show");
}

/**
 * this function is called when the user clicks on the button to select a specific violation type
 * to visualize a specific measure over the last 12 weeks
 */
function dropdownTrigger_type() {
  document.getElementById("dropdown_violation_type").classList.toggle("show");
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
 * Creates an HTML <div> element styled as an alert with the given level and text.
 * 
 * @param {String} warning_level
 *   Either "warning" or "danger"
 * @param {Array} warning_text_children
 *   The HTML elements describing the warning text.
 */
function createHtmlAlert(warning_level, warning_text_children) {
    var alert = document.createElement("DIV");
    alert.className = "alert alert-" + warning_level;
    alert.setAttribute("role", "alert");
    warning_text_children.forEach(function (warning_text_child) {
        alert.appendChild(warning_text_child);
    });

    return alert;
};


/** Creates an HTML <span> element containing the given text. */
function createSpan(text) {
    var s = document.createElement("SPAN");
    s.innerHTML = text;
    return s;
};


async function fetchListOfIssues() {
    const response = await fetch("/jira/rest/api/2/search?maxResults=400");
    var data = await response.json();
    return data.issues;
}


/**
 * returns the priority of an issue as a Number from 0 to 4
 * 
 * @param {Object} issue 
 *    a issue in Jira with all its corresponding properties
 */
function priority(issue){
    var priority_table = {"Trivial": 0, "Minor": 1, "Major": 2, "Critical": 3, "Blocker": 4};
    var prio = priority_table[issue.fields.priority.name];
    return prio;
}

/**
 * 
 * 
 * @param {Array} issues 
 *   an array of Jira issues
 * @param {Object} issue
 *  a issue in Jira with all its corresponding properties 
 * @param {number} prio 
 *  a number from 0 to 4 in our example
 * 
 * @return {number} the number of violations
 */
function checkPriorityViolation(issues,issue, prio){
    var date = new Date(issue.fields.updated);
    var numViolations = 0;
    for(let loopIssue of issues){
        var checkPrio = priority(loopIssue);
        var checkDate = new Date(loopIssue.fields.updated);
        if (checkPrio < prio && checkDate < date)
            numViolations++;
    }
    return numViolations;
}


/**
 * 
 * @param {Array} issues
 *  an array of Jira issues 
 * @param {Number} week  
 */
function getPriorityViolationsOfWeek(issues,week){
    let violationCounter=0;
    for(let issue of issues){
		let d = new Date(issue.fields.updated);
        let issueWeek = getWeekNumber(d);
        if(issueWeek===week)
            if(checkPriorityViolation(issues,issue, priority(issue)))
                violationCounter++;   
    }
    return violationCounter;
}



/**
 * checks if a given date is between 8pm and six 6am
 * 
 * @param {String} issueDate 
 */  
function checkNightViolation(issueDate){
    d = new Date(issueDate);
    return (d.getHours()>19 || d.getHours() <6);
}

/**
 * @param {Array} issues
 *   an array of Jira issues 
 * @param {Number} week 
 * 
 * @returns {Number} the amount of Night Violations in the specified week
 */
function getNightViolationsOfWeek(issues, week){
    let violationCounter=0;
    for(let issue of issues){
		let d = new Date(issue.fields.updated);
        let issueWeek = getWeekNumber(d);
        if(issueWeek===week)
            if(checkNightViolation(issue.fields.updated))
                violationCounter++;   
    }
    return violationCounter;
}


/**
 * @param {Array} issues
 *   an array of Jira issues 
 * @param {Number} week 
 * 
 * @returns {Number} the amount of Weekend Violations in the specified week
 */
function getWeekendViolationsOfWeek(issues, week){
    let violationCounter=0;
    for(let issue of issues){
		let d = new Date(issue.fields.updated);
        let issueWeek = getWeekNumber(d);
        if(issueWeek===week)
            if(checkWeekendViolation(issue.fields.updated))
                violationCounter++;   
    }
    return violationCounter;
}

/**
 * checks if a given date is a saturday or a sunday
 * 
 * @param {String} issueDate 
 */ 
function checkWeekendViolation(issueDate){
    let d = new Date(issueDate);
    return (d.getDay()==0 || d.getDay()==6);
}

/**
 * @param {Array} issues 
 * @param {Number} week 
 * 
 * @returns {Number} the amount of all types of violations together in the specified week
 */
function getTotalViolationsOfWeek(issues, week){
    return getNightViolationsOfWeek(issues, week) + getPriorityViolationsOfWeek(issues, week) + getWeekendViolationsOfWeek(issues, week);
}




/** 
 * @param {Number} latestWeek 
 * @param {Number} n 
 *   the amount of weeks that should be returned
 * 
 * @returns {Array} an array of numbers. Each number is a week.
 *   e.g. parameters 5 and 7 will lead to the returned array [51,52,1,2,3,4,5]
 */
function getLastNWeeks(latestWeek, n){
    let weeks = [];
    if(latestWeek >=n){
      for(var i = n-1; i>=0;i--)
        weeks.push(latestWeek-i);
    } else {
      let startWeek = 52-(n-1-latestWeek);
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
 * creates the graph which shows the amount of policy violations of the last weeks using charts.js
 * 
 * @param {Array} issues 
 *   an array of Jira issues
 * @param {Number} latestWeek 
 */
function createFirstGraph(issues, latestWeek){
    var labels_last_weeks = getLastNWeeks(latestWeek,global_n);
    var data_last_weeks = [];
    for(let week of labels_last_weeks){
		// Add data according to chosen violation type
		if (global_violationType === 1)
			data_last_weeks.push(getPriorityViolationsOfWeek(issues, week));
		else if (global_violationType === 2)
			data_last_weeks.push(getNightViolationsOfWeek(issues, week));
		else if (global_violationType === 3)
			data_last_weeks.push(getWeekendViolationsOfWeek(issues, week));
		else if (global_violationType === 4)
			data_last_weeks.push(getTotalViolationsOfWeek(issues, week));
	}
	
	if (first_creation ===0){
		// Create Chart	
		var violation_chart_time = document.getElementById("violationChartMonths");
		violation_chart_time.height = 500;
		violation_chart_time.width = 700;
		myChart = new Chart(violation_chart_time, {
			type: 'line',
			data: {
				labels: labels_last_weeks,
				datasets: [{
					label: 'Anzahl Policy Violations in letzter Zeit',
					data: data_last_weeks,
					// Draw line instead of filled area
					fill: false,
					borderColor: "#55bae7",
					backgroundColor: "#55bae7",
					pointBackgroundColor: "#55bae7",
					pointBorderColor: "#55bae7",
					pointHoverBackgroundColor: "#55bae7",
					pointHoverBorderColor: "#55bae7",
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
					text:'Anzahl aller Policy Violations',
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
				scales: {
					xAxes: [{
						scaleLabel:{
							display: true,
							labelString: 'Kalenderwoche'
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
							labelString: 'Anzahl der Policy Violations'
						}
					}]
				}
			} 		  
		});
		first_creation = 1;
	}
	else{
		// update existing Chart
		
		// remove existing data
		for (let i = 0; i<12; i++){
			myChart.data.labels.pop();
			myChart.data.datasets[0].data.pop();
		}
		// add new data
			myChart.data.datasets[0].data
			// display data of violations
			for (let i = 0; i<global_n; i++){
				myChart.data.labels.push(labels_last_weeks[i]);
				myChart.data.datasets[0].data.push(data_last_weeks[i]);
			}
		// update Title
		if (global_violationType === 1)
			myChart.options.title.text = 'Anzahl aller Priority Violations';
		else if (global_violationType === 2)
			myChart.options.title.text = 'Anzahl aller Night Violations';
		else if (global_violationType === 3)
			myChart.options.title.text = 'Anzahl aller Weekend Violations';
		else if (global_violationType === 4)
			myChart.options.title.text = 'Anzahl aller Policy Violations';
		// Recreate the Chart
		myChart.update();
	}
}


/**
 * creates the graph which shows the percentages of the 3 violation types of last week and the week before
 * 
 * @param {Array} issues 
 *  an array of Jira issues
 * @param {Number} current_week 
 */
function createSecondGraph(issues, current_week){
    var prev_week = ((current_week === 1) ? 52 : current_week-1);
    var labels_policy_violations = ['Priority Violation','Weekend Violation','Night Violation'];
    
    // Gather Data of the current Week
    var prioViolations_currentWeek = getPriorityViolationsOfWeek(issues, current_week);
    var weekendViolations_currentWeek = getWeekendViolationsOfWeek(issues, current_week);
    var nightViolations_currentWeek = getNightViolationsOfWeek(issues, current_week);
    var totalViolations_currentWeek = prioViolations_currentWeek + weekendViolations_currentWeek + nightViolations_currentWeek;
    
    var data_current_week = [prioViolations_currentWeek,weekendViolations_currentWeek,nightViolations_currentWeek];
    data_current_week = data_current_week.map(x => Number((x / totalViolations_currentWeek).toFixed(2)));


    //gather data of the previous week
    var prioViolations_prevWeek = getPriorityViolationsOfWeek(issues, prev_week);
    var weekendViolations_prevWeek = getWeekendViolationsOfWeek(issues, prev_week);
    var nightViolations_prevWeek = getNightViolationsOfWeek(issues, prev_week);
    var totalViolations_prevWeek = prioViolations_prevWeek + weekendViolations_prevWeek + nightViolations_prevWeek;
    
    var data_prev_week = [prioViolations_prevWeek,weekendViolations_prevWeek,nightViolations_prevWeek];
    data_prev_week = data_prev_week.map(x => Number((x / totalViolations_prevWeek).toFixed(2)));

	
	// Create Chart	
	var violation_chart_percentage = document.getElementById("violationChartPercentages");
	violation_chart_percentage.height = 500;
	violation_chart_percentage.width = 700;
	myChart2 = new Chart(violation_chart_percentage, {
		type: 'radar',
		data: {
			labels: labels_policy_violations,
			datasets: [{
				// current month's data
				label: 'aktuelle Woche',
				data: data_current_week,
				backgroundColor: "rgba(200,0,0,0.2)"
			},
			{
				// last month's data
				label: 'Vorwoche',
				data: data_prev_week,
				backgroundColor: "rgba(0,0,200,0.2)"
			}]
		},
		options:{
			responsive: false,
			title:{
				display:true,
				text:'Anteile an Gesamtviolations' ,
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
			scale: {
				ticks: {
					beginAtZero: true,
					min: 0
					//max: 1,
					//stepSize: 0.2
				}
			}
		} 		  
	});
}

/**
 * @param {Array} issues 
 *   an array of Jira issues
 * @returns {Number} the latest week of all the dates in the issues
 */
function getLatestWeekOfIssues(issues){
    let d = issues[0].fields.updated;
    for(let issue of issues)
        if(issue.fields.updated > d)
            d=issue.fields.updated;
    
	//return Number(getWeek(d));
	let da = new Date(d);
	let nu = getWeekNumber(da);
	return nu;
    
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
	//return [d.getUTCFullYear(), weekNo];
	return weekNo;
}


/**
 * sets the headline of the gadget
 * @param {Number} week 
 */
function setHeadline(week){
    var h = document.getElementById("headline");
    h.innerHTML = "Erfassung der Policy Violations KW" + week;
}

//returns the amount of priority Violations of a given employee in a given week
function getPriorityViolationsOfWeekByEmployee(issues, week, employeeID){
    let violationCounter=0;
    for(let issue of issues){
		let d = new Date(issue.fields.updated);
        let issueWeek = getWeekNumber(d);
        if(issueWeek===week){
			if(issue.fields.assignee){
				if(checkPriorityViolation(issues,issue, priority(issue)) && issue.fields.assignee.name == employeeID)
                violationCounter++; 
			}
		} 
    }
    return violationCounter;
}

function getNightViolationsOfWeekByEmployee(issues, week, employeeID){
    let violationCounter=0;
    for(let issue of issues){
		let d = new Date(issue.fields.updated);
        let issueWeek = getWeekNumber(d);
		if(issueWeek===week)
		if(issue.fields.assignee){
            if(checkNightViolation(issue.fields.updated) && issue.fields.assignee.name == employeeID)
                violationCounter++;   
		}
    }
    return violationCounter;
}

function getWeekendViolationsOfWeekByEmployee(issues,week, employeeID){
    let violationCounter=0;
    for(let issue of issues){
		let d = new Date(issue.fields.updated);
        let issueWeek = getWeekNumber(d);
        if(issueWeek===week){
			if(issue.fields.assignee){
				if(checkWeekendViolation(issue.fields.updated) && issue.fields.assignee.name == employeeID)
                violationCounter++; 
			}
		}
    }
    return violationCounter;
}


/**
 * creates the third part of the gadget, which shows personal alerts for the currently logged in user
 * and his amount of violations in the last week
 * 
 * @param {array} issues 
 *  an array of Jira issues
 * @param {Number} week   
 */
function createPersonalAnalysis(issues, week, employeeID){
    var h = document.getElementById("personalHeadline");
    h.innerHTML = "Persönliche Auswertung für " + employeeID;

	// collect Data
    let prioVios = getPriorityViolationsOfWeekByEmployee(issues, week, employeeID);
    let nightVios = getNightViolationsOfWeekByEmployee(issues, week, employeeID);
    let weekendVios = getWeekendViolationsOfWeekByEmployee(issues,week, employeeID);
		
	// create Alerts: if the user has 1 violation, he should get a yellow alert, 
    //if he has 2 or more he will get a red alert, and green otherwise

    // Priority Violations: 
	if (prioVios === 0){
		level_prio = "success";
	}
	else if (prioVios === 1){
		level_prio = "warning";
	}
	else if (prioVios >=2){
		level_prio = "danger";
	}
	
	// Night Violations
	if (nightVios === 0){
		level_night = "success";
	}
	else if (nightVios === 1){
		level_night = "warning";
	}
	else if (nightVios >=2){
		level_night = "danger";
	}
	
	// Weekend Violations
	if (weekendVios === 0){
		level_weekend = "success";
	}
	else if (weekendVios === 1){
		level_weekend = "warning";
	}
	else if (weekendVios >=2){
		level_weekend = "danger";
	}
	var warnings = [
			{ level: level_prio, children: [createSpan('Sie hatten in der vergangenen Woche ' + String(prioVios) + ' Priority Violations!')] },
			{ level: level_night, children: [createSpan('Sie hatten in der vergangenen Woche ' + String(nightVios) + ' Night Violations!')] },
			{ level: level_weekend, children: [createSpan('Sie hatten in der vergangenen Woche ' + String(weekendVios) + ' Weekend Violations!')] }
	];
	
	// Select the HTML element with the ID "alertlist"
	var alertlist = document.querySelector("#alertlist");
	
	// Remove "Loading..." placeholder
	if (alertlist.childElementCount != 1) {
		throw "Invalid DOM state!";
	}
	alertlist.removeChild(alertlist.children[0]);
	
	// Add Alerts
	warnings.forEach(function (warning) {
		var warning_alert = createHtmlAlert(warning.level, warning.children);
		alertlist.appendChild(warning_alert);
	});
}


/**
 * creates the DropDown Buttons which allow the user to choose a time period of the last four, six or twelve weeks
 * and the type of policy violation (Night-, Priority-, Weekendviolation)
 * 
 * @param {Array} issues 
 *  an array of Jira issues
 * @param {Number} latestWeek 
 */
function createDropDowns(issues, latestWeek){
	// Create Entries of Dropdown Menu for the time period (4,6,or 12 weeks)
	var dropElement_4weeks = document.createElement('option');
	dropElement_4weeks.text = 'letzte 4 Wochen';
	dropElement_4weeks.value = 4;
	dropElement_4weeks.onclick = function(){set_global_n(this.value);createFirstGraph(issues, latestWeek);};	
	
	var dropElement_6weeks = document.createElement('option');	
	dropElement_6weeks.text = 'letzte 6 Wochen';
	dropElement_6weeks.value = 6;
	dropElement_6weeks.onclick = function(){set_global_n(this.value);createFirstGraph(issues, latestWeek);};
	
	var dropElement_12weeks = document.createElement('option');	
	dropElement_12weeks.text = 'letzte 12 Wochen';
	dropElement_12weeks.value = 12;
	dropElement_12weeks.onclick = function(){set_global_n(this.value);createFirstGraph(issues, latestWeek);};
	
	var dropdown_options = document.getElementById("dropdown_violation_period");
	dropdown_options.appendChild(dropElement_4weeks);
	dropdown_options.appendChild(dropElement_6weeks);
	dropdown_options.appendChild(dropElement_12weeks);
	
	// Create Entries of Dropdown Menu 2 (type of policy violation)
    //1 = Priority Violation
    //2 = Night Violation
    //3 = Weekend Violation
    //4 = all violations together
	var dropElement2_prio = document.createElement('option');
	dropElement2_prio.text = 'Priority Violation';
	dropElement2_prio.value = 1;
	dropElement2_prio.onclick = function(){set_global_violationType(this.value);createFirstGraph(issues, latestWeek);};	
	
	var dropElement2_night = document.createElement('option');
	dropElement2_night.text = 'Night Violation';
	dropElement2_night.value = 2;
	dropElement2_night.onclick = function(){set_global_violationType(this.value);createFirstGraph(issues, latestWeek);};	
	
	var dropElement2_weekend = document.createElement('option');
	dropElement2_weekend.text = 'Weekend Violation';
	dropElement2_weekend.value = 3;
	dropElement2_weekend.onclick = function(){set_global_violationType(this.value);createFirstGraph(issues, latestWeek);};	
	
	var dropElement2_all = document.createElement('option');
	dropElement2_all.text = 'All Violations';
	dropElement2_all.value = 4;
	dropElement2_all.onclick = function(){set_global_violationType(this.value);createFirstGraph(issues, latestWeek);};	
	
	var dropdown_options = document.getElementById("dropdown_violation_type");
	dropdown_options.appendChild(dropElement2_prio);
	dropdown_options.appendChild(dropElement2_night);
	dropdown_options.appendChild(dropElement2_weekend);
	dropdown_options.appendChild(dropElement2_all);
}

//wir faken das Datum des issues um eine Verteilung zu erhalten, die sich gut darstellen lässt in den Diagrammen,
//da wir keine Testdaten aus echten Open Source Projekten finden konnten, die nicht sehr ungleich verteilt waren
function fakeDate(issueDate){
	if(issueDate.substring(0,4)=="2020")
		return issueDate;
	
	var day =  Math.floor(Math.random() * (30 - 1)) + 1;
	var month = Math.floor(Math.random() * (13 - 11)) + 11;
	if (day<10)
		day = "0" +day;
	
	let s = issueDate.substring(0,5) + month + "-" + day + issueDate.substring(10);
	return s;
}

/**
 * Makes a list where each user appearing in the input array at least once.
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

//returns a random name of an employee, since we can't really get the currently logged in User in Jira 
//becaus we only have the credentials admin/admin for this pracitcal course
function getRandomEmployee(employees){
	let randomIndex = Math.floor(Math.random() * employees.length) + 1;
	return employees[randomIndex];
}

// [ETHICAL_SSE] If you want to immediately run a function when importing the JavaScript, simply trigger it here.
// Alternatively, you may also let them be called from the HTML, e.g. when pressing a button: https://www.w3schools.com/jsref/event_onclick.asp
fetchListOfIssues()
.then(function (issues) {
	let latestWeek = getLatestWeekOfIssues(issues);
	setHeadline(latestWeek);
	
	//Daten einigermassen gleich verteilen über die letzten 12 Wochen, weil die Wildfly Daten ungünstig verteilt sind
	//Dient also nur zur besseren Veranschaulichung und hat keinen Einfluss auf Funktionaltät des Features
	for(let issue of issues)
		issue.fields.updated = fakeDate(issue.fields.updated);


	// create the Buttons to switch between violation types and displayed period
	createDropDowns(issues, latestWeek);
    
	// set global variables
	set_global_violationType(4);
	set_global_n(4);
	first_creation = 0;
	
	// Create the graphs
	createFirstGraph(issues, latestWeek);
	createSecondGraph(issues, latestWeek);	

	let employees = makeListOfEmployees(issues);

	let currentUser = getRandomEmployee(employees);

	// create Personal Analysis
	createPersonalAnalysis(issues, latestWeek, currentUser);
});



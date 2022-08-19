/**
 * @file
 * Functionality of the ethical analysis dashboard plugin.
 */

//----------------------Optionen-------------------------//
// Review: These global variables seem to be parameters for the analysis.They are well identifiable by name, however I'd add a short comment when they are used, what they are used for and what different changes lead to. Additionally I'd add a typical range for them (e.g. a pair_threshold higher than x or lower than y, ...

var maxResults = 1000;
var experinece_threshold = 80; //Angabe in Prozent	// Review: Just a small typo in the variable's name
var pair_threshold = 40;							// Review: Is this also in percent?

//Gut testbar mit Seed: 1113362673 (800 Issues, 10 Mitarbeitern,
//1 Normales Paar, 1 Lazy Paar, IssueCreationChance 30%, normalIssueTime 1, deviate false)
var gen_data_Last_Date = new Date("2020-04-26T03:01:46.437+0100"); //Letzter Tag des Generators, siehe log..
//-------------------------------------------------------//

// Review: There are quite some global variables used. Even though most global variables are identifiable by name it is sometimes hard to understand their purpose immediately (e.g. userDifficulty). I'd add a short comment for each of them when they are used and what they are used for
//Script golobal, nur fürs programm...
var userArray;
var issueList = [];
var userDifficulty;
var avgAllUser;
var pairs;
var isAdmin = false;
//Wird benötigt, da der Generator in die Zukunft Daten erstellt
var day_offset = getDayOff();

//Berechnet offset fpr die generierten issues
function getDayOff() {
  var now = new Date();		// Review: what's the purpose of "now"? It is never reused.
  return diffDays(new Date(), gen_data_Last_Date);
}

//Differenz für date
function diffDays(firstDay, lastDay) {
  return Math.abs(Math.round((lastDay - firstDay) / 1000 / 60 / 60 / 24));
}

//Ermöglicht, für date Tage zu addieren
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

//Grundscaffold, welches man schön einbinden kann...
/** [ETHICAL_SSE] Example function showing how to access the Jira API.
    Also an example that shows how to call a function only *after* a specific field has been set. */
function getCurrentlyLoggedInUser() {
  // Access the Jira API
  fetch("/jira/rest/auth/1/session")
    .then(function(result) {
      if (result.ok) {
        // Successful request: Return the JSON payload
        return result.json();
      } else {
        // Request error: Log and return undefined
        console.error("JIRA API call failed");
        return undefined;
      }
    })
    .then(function(resultJson) {
      if (resultJson !== undefined && resultJson !== "") {
        // In JavaScript, you can directly access JSON properties
        currentUser = resultJson.name;
        populate(false);
      }
      // In case we did not receive a valid user, we don't execute the function.
      return;
    });
  // Recursion / reentrance happens in the callback above
  return;
};

/**
 * Creates an HTML <div> element styled as an alert with the given level and text.
 *
 * @param {String} warning_level
 *   Either "warning" or "danger"
 * @param {Array} warning_text_children
 *   The HTML elements describing the warning text.
 */
//Erweitert für info, dark, und success
function createHtmlAlert(warning_level, warning_text_children) {
  if (["warning", "danger", "info", "dark", "success"].indexOf(warning_level) < 0) {
    throw "warning_level has to be either \"warning\" or \"danger\"";		// Review: So far you added info, dark and success to the possible warning types. However your exception does not mention them. I'd add info, dark and success for the warning level exception or remove it completely (Can it actually happen in your code?)
	// And Why would you want to make this constraint?
	// And it seems success is never used as an alert in the program anyways.
  }

  var alert = document.createElement("DIV");
  alert.className = "alert alert-" + warning_level;
  alert.setAttribute("role", "alert");
  warning_text_children.forEach(function(warning_text_child) {
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
    throw "user_name may not contain \"@\"";	// Review: I'd add a comment why that is.
  }

  var a = document.createElement("A");
  a.setAttribute("target", "_parent"); // This ensures that we open the relative link in Jira, not in our plugin.
  a.setAttribute("href", "/jira/secure/ViewProfile.jspa?name=" + username);
  a.className = "alert-link";
  a.innerHTML = username;

  return a;
};


/** Creates an HTML <span> element containing the given text. */
function createSpan(text) {
  var s = document.createElement("SPAN");
  s.innerHTML = text;
  return s;
};


//Frägt zuerst alle Projekte ab und anschließend alle deren Issues (ist hier Intressant, da das Ergebniss mit mehr Daten besser und besser wird)
function fetchIssues(projects, startAt) {
  //Erst Projekte und dann mit Rekursion die Issues
  if (projects !== undefined) {
    proName = projects[projects.length - 1];
    fetch("/jira/rest/api/2/search?jql=project=" + proName + "&maxResults=" + maxResults + ((startAt !== undefined) ? ("&startAt=" + startAt) : ""))
      .then(function(result) {
        if (result.ok) {
          return result.json();
        } else {
          console.error("JIRA API call failed");
          return undefined;
        }
      })
      .then(function(resultJson) {
        if (resultJson !== undefined && resultJson !== "") {
          issue = resultJson;
          return issue;
        }
        return;
      })
      .then(function(issues) {

        //da concat nicht will -_-...			// Review: One cannot directly understand why concat won't be working. So others might try to implement it and run into the same problems you already had. I think I'd add more information about the failed approaches in a short comment or the technichal documentation.
        for (var issuTmp in issues.issues) {
          issueList.push(issues.issues[issuTmp]);
        }

        if (issues.maxResults + issues.startAt < issues.total) {
          fetchIssues(projects, issue.startAt + issue.maxResults);
        } else {
          projects.length -= 1;
          if (projects.length == 0) {
            fetchUser();
          } else {
            fetchIssues(projects);
          }
        }
      });
  } else {
    fetch("http://localhost:2990/jira/rest/api/2/project")
      .then(function(result) {
        if (result.ok) {
          return result.json();
        } else {
          console.error("JIRA API call failed");
          return undefined;
        }
      })
      .then(function(resultJson) {
        var tmpStore = [];
        for (var counter in resultJson) {
          tmpStore.push(resultJson[counter].name);
        }
        if (tmpStore.length > 0) {
          fetchIssues(tmpStore);
        } else {
          console.error("Jira has no Projects...")
        }
      });
  }
}

//Fetcht alle User vom Jira Server
function fetchUser() {
  var url = "/jira/rest/api/2/user/search?username=.&startAt=0&maxResults=" + maxResults;
  fetch(url).then(function(userHeader) {
    if (userHeader.ok) {
      return userHeader.json();
    } else {
      // Request error: Log and return undefined
      console.error("JIRA API call failed");
      return undefined;
    }
  }).then(function(userJson) {
    userArray = [];
    for (var tmp in userJson) {
      if (userJson[tmp].key != "admin") {
        userArray.push(userJson[tmp].key);
      }
    }

    progressData();
  });
}


//Verarbeitet alle Daten
function progressData() {

  //Erzeugt eine Map mit allen Usern und den wichtigen Daten für die weiteren Berechnungen
  var issueUserMap = new Map();
  for (var userCount in userArray) {
    var userWithoutCurrent = new Map();
    for (userCountW in userArray) {
      if (userArray[userCountW] != userArray[userCount]) {
        userWithoutCurrent.set(userArray[userCountW], 0);
      }
    }
    //Key: User, issueDifs: Grad der Aufgabe, issueEDate: Enddatum, otheruserMap: Map mit allen Usern auser dem aktuellem (für Pausenanalyse...)
    issueUserMap.set(userArray[userCount], {
      issueDifs: [],
      issueEDate: [],
      otherUserMap: userWithoutCurrent,
      avg: 0
    });
  }

  //Befüllt Grad und Enddatum der Map
  for (var issueCount in issueList) {
    issueUserMap.get(issueList[issueCount].fields.assignee.key).issueDifs.push(issueList[issueCount].fields.customfield_10002);
    issueUserMap.get(issueList[issueCount].fields.assignee.key).issueEDate.push(issueList[issueCount].fields.customfield_10001.substring(0, 10));
  }

  //Erzeugt Summe der Grade
  userDifficulty = [];
  for (var userCount in userArray) {
    userDifficulty.push({
      key: userArray[userCount],
      sumDifficulty: (sumDif(issueUserMap.get(userArray[userCount]).issueDifs))
    });
  }

  //Mittelwert aller Grade
  avgAll();

  //Check if two non Upload dates Match
  var startCompareDate = new Date(issueList[issueList.length - 1].fields.customfield_10001); //first finished issue date
  var endCompareDate = new Date(issueList[0].fields.customfield_10001); //last finished issue date
  var compareLength = diffDays(startCompareDate, endCompareDate);
  var dateIssueMap = new Map();
  for (var count in issueList) { //2020-01-20T15:35:00.000+0100
    dateIssueMap.set(issueList[count].fields.customfield_10001.substring(0, 10), new Set());
  }

  for (var count in issueList) {
    dateIssueMap.get(issueList[count].fields.customfield_10001.substring(0, 10)).add(issueList[count].fields.assignee.key);
  }

  //Run from first til last day
  while (startCompareDate <= endCompareDate) {
    var currentDateUser = dateIssueMap.get(startCompareDate.toISOString().substring(0, 10));
    var userList = [];
    if (currentDateUser !== undefined) { //only if issues were finished that day
      userArray.forEach(function(item) { //create list of userw who havent uploaded
        if (!currentDateUser.has(item)) {
          userList.push(item);
        }
      });

      userList.forEach(function(current) {
        userList.forEach(function(tmpUser) {
          if (current != tmpUser) {
            var tmp = issueUserMap.get(current).otherUserMap.get(tmpUser);
            issueUserMap.get(current).otherUserMap.set(tmpUser, ++tmp);
          }
        });
      });
    }
    startCompareDate = startCompareDate.addDays(1);
  }

  //Avg für jeden user
  issueUserMap.forEach(function(user) {
    var sum = 0;
    user.otherUserMap.forEach(function(otherUserValue) {
      sum += otherUserValue;
    });
    sum /= user.otherUserMap.size;
    user.avg = sum;
  });

  //Avg für alle zusammen
  var avgBreakAll = 0;
  issueUserMap.forEach(function(user) {
    avgBreakAll += user.avg;
  });
  avgBreakAll /= issueUserMap.size;

  //Paare kalkulieren
  var possiblePair = [];
  issueUserMap.forEach(function(user, userId) {
    if ((user.avg - avgBreakAll) > 0) {
      var posPartner = [];
      user.otherUserMap.forEach(function(value, id) {
        if ((value * ((100 - pair_threshold) / 100)) > user.avg) {
          posPartner.push({
            key: id,
            value: value
          });
        }
      });
      posPartner.sort(comparePair);
      if (posPartner.length > 0) {
        possiblePair.push([userId, posPartner[0].key]);
      }
    }
  });

  possiblePair = checkDouble(possiblePair);

  //Berechnungen der Unerfahrene User
  var unexper = [];
  for (var count in userDifficulty) {
    if (userDifficulty[count].sumDifficulty < (avgAllUser * (experinece_threshold / 100))) {
      unexper.push(userDifficulty[count])
    }
  }

  unexper.sort(compare);
  pairs = [];

  //Verbinde Unerfahrene mit Pärchen
  possiblePair.forEach(function(pair) {
    loop: for (unexCount in unexper) {
      if (pair[0] == unexper[unexCount].key || pair[1] == unexper[unexCount].key) {
        pairs.push(pair);
        break loop;
      }
    }
  });

  //Daten ausgeben und anzeigen
  populate(true);
}

//Überpüft und löscht doppelte Pärchen
function checkDouble(input) {
  var output = [];
  if (input.length > 1) {
    while (input.length > 0) {
      var tmp = input.pop();
      tmp.unshift(tmp.pop());
      var inside = false;
      if (input.length == 0) {
        output.push(tmp);
        return output;
      }
      input.forEach(function(key, id) {
        if (key[0] == tmp[0] && key[1] == tmp[1]) {
          inside = true;
        } else if (id == input.length - 1 && inside == false) {
          output.push(tmp);
        }
      });
    }
  } else {
    return input;
  }
  return output;
}

//Sortiert mögliche Paare
function comparePair(a, b) {
  return (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0);
}

//Sortiert Unerfahrene Mitarbeiter
function compare(a, b) {
  return (a.sumDifficulty > b.sumDifficulty) ? 1 : ((b.sumDifficulty > a.sumDifficulty) ? -1 : 0);
}

//Summiert...
function sumDif(array) {
  var sum = 0;
  for (var count in array) {
    sum += array[count];
  }
  return sum;
}

//Bildet den Mittelwert aller Grade der User
function avgAll() {
  avgAllUser = 0;
  for (var count in userDifficulty) {
    avgAllUser += userDifficulty[count].sumDifficulty;
  }
  avgAllUser /= userDifficulty.length;
}


//Verantwortlich für HTML
function populate(dataAvailable) {

  // Select the HTML element with the ID "alertlist"
  var alertlist = document.querySelector("#alertlist");

  //löscht alle Listenelemente in der UI
  var len = alertlist.children.length;
  for (var i = 0; i < len; i++) {
    alertlist.removeChild(alertlist.children[0]);
  }

  if (currentUser == "admin") { //show warning and load nothing, if user is not admin
    if (!dataAvailable) { //for first run, to fetch data
      alertlist.appendChild(createHtmlAlert("dark", [createSpan("Lade Daten...")]));
      fetchIssues();
    } else {
      for (var count in pairs) {
        alertlist.appendChild(createHtmlAlert("danger", [createUserLink(pairs[count][0]), createSpan(" und "), createUserLink(pairs[count][1]), createSpan(" könnten eine Beziehung führen, welche Ihr Arbeitsverhalten beeinflusst.")]));
      }
      if (alertlist.children.length == 0) {
        alertlist.appendChild(createHtmlAlert("info", [createSpan("Es gibt keine Anzeichen auf Beziehungen zwischen den Mitarbeitern.")]));
      }
    }
  } else { //body when user != admin
    alertlist.appendChild(createHtmlAlert("danger", [createSpan("Bitte loggen sie sich als Admin ein, um dieses Plugin verwenden zu können!")]));
  }

  gadget.resize();
};


//Start des Plugins beim laden des scripts (Überpüft User und rechte)
getCurrentlyLoggedInUser();

### Fragebögen
Link zum Institut des Fragebogens:  
https://www.rehazentrum-bb.de/tests/burnout-test.html#testbeginn

Link zu unserem aufbereiteten Fragebogen:  
https://www.umfrageonline.com/s/9634d56

### Installation

Für JIRA benötigt dieses Plugin außer den in der Praktikumsanleitung angegebenen keine zusätzlichen Abhängigkeiten. Der Code im Ordner `SourceCode` kann mit dem zur Verfügung gestellten Gerüst benutzt werden. Dazu 

- im Ordner `/src/main/resources/gadgets/ethical-plugin` das hier bereitgestellte `gadget.xml` einfügen.

- im Ordner `/src/main/resources/js` das hier bereitgestellte `dashboardPlugin.js` einfügen.


### Bottle-Server

Das Plugin benötigt externe Daten, die in unserem Fall über einen Webserver bereitgestellt und aus dem Plugin gefetcht werden. Dazu verwenden wir das Bottle Webframework. Deshalb zunächst [Bottle installieren](https://bottlepy.org/docs/dev/tutorial.html#installation "Bottle-Homepage"). Im weiteren Verlauf wird Python 3.x benötigt, wobei außerdem das Modul [Pandas](https://pandas.pydata.org/) installiert werden muss. Der Webserver liest eine Datenbank mit den Mitarbeiterdaten ein. Hierfür ist `sqlite3` notwendig.
Der Ordner `Umfragedaten_monatlich` muss in der Ordnerstruktur einen Ordner über dem Ordner `SourceCode` liegen (so wie im Repo). Die Mitarbeiterdatenbank `employees.db` muss im selben Ordner liegen wie ` start_bottle.py`.

### Verwendung

- im Ordner `SourceCode` den Server starten mit `python start_bottle.py`. Unter `localhost:8080/feature1` kann man sich im Browser das bereitgestellte JSON ansehen, was aus JIRA gefetcht wird, genauso wie die Liste der Mitarbeiter unter `localhost:8080/employees`.
- im Ordner `scaffold` mit `atlas-run` (muss möglicherweise 2x ausgeführt werden) das JIRA System starten und wie in der Praktikumsanleitung fortfahren.

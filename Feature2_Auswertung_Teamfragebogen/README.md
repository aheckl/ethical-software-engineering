### Fragebögen
Link zum Fragebogen des Instituts für Psychologietransfer:  
https://www.ipt-bamberg.de/images/stories/ipt/downloads/fragebogen-zur-qualitaet-unserer-teamarbeit-auswertung.pdf

Link zu unserer aufbereiteten Umfrage:  
https://www.umfrageonline.com/s/50143f8

### Installation

Für JIRA benötigt dieses Plugin außer den in der Praktikumsanleitung angegebenen keine zusätzlichen Abhängigkeiten. Der Code im Ordner `SourceCode` kann mit dem zur Verfügung gestellten Gerüst benutzt werden. Dazu 

- im Ordner `/src/main/resources/gadgets/ethical-plugin` das hier bereitgestellte `gadget.xml` einfügen.

- im Ordner `/src/main/resources/js` das hier bereitgestellte `dashboardPlugin.js` einfügen.


### Bottle-Server

Das Plugin benötigt externe Daten, die in unserem Fall über einen Webserver bereitgestellt und aus dem Plugin gefetcht werden. Dazu verwenden wir das Bottle Webframework. Deshalb zunächst [Bottle installieren](https://bottlepy.org/docs/dev/tutorial.html#installation "Bottle-Homepage"). Im weiteren Verlauf wird Python 3.x benötigt, wobei außerdem das Modul [Pandas](https://pandas.pydata.org/) installiert werden muss. Da die Freitextfelder mit NLP-Methoden ausgewertet werden, müssen noch [NLTK](https://www.nltk.org/install.html) und die Deutsch-Version von [TextBlob](https://textblob-de.readthedocs.io/en/latest/readme.html#installing-upgrading) installiert sein. Der Ordner `Umfragedaten_monatlich` muss in der Ordnerstruktur einen Ordner über dem Ordner `SourceCode` liegen (so wie im Repo).

### Verwendung

- im Ordner `SourceCode` den Server starten mit `python start_bottle.py`. Unter `localhost:8080/feature2` kann man sich im Browser das bereitgestellte JSON ansehen, was aus JIRA gefetcht wird.
- im Ordner `scaffold` mit `atlas-run` (muss möglicherweise 2x ausgeführt werden) das JIRA System starten und wie in der Praktikumsanleitung fortfahren.

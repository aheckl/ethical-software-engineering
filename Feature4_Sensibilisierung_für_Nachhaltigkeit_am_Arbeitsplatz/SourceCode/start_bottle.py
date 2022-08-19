from bottle import route, run, response, hook
import sqlite3 as sql
import pandas as pd
import os
   

def makeJSONfromDirectory(directory):

    files = os.listdir(directory)

    def getDateValue(filename):
        year = filename[-11:-7]
        month = filename[-6:-4]
        value = 100 * int(year) + int(month)
        return value

    # make list of csv files with their modification dates
    csvlist = []
    for item in files:
        if item[-3:] == 'csv':
            csvlist.append([item, getDateValue(item)])

    def getkey(entry):
        return entry[1]
    # list of most recent 12 csvs
    csv_sort = sorted(csvlist, key=getkey, reverse=True)[:12]

    # concat pandas df's for all recent csvs
    all_data = pd.concat([pd.read_csv(directory+name[0], sep=';') for name in csv_sort], ignore_index=True)
            
    json = all_data.to_json(orient='records')
    return json


def employees(database):
    conn = sql.connect(database)
    c = conn.cursor()
    emp = c.execute("SELECT * FROM mitarbeiter").fetchall()
    df = pd.DataFrame.from_records(emp)
    df.columns = ('MitarbeiterID', 'Vorname', 'Nachname')
    json = df.to_json(orient='records')
    return json


json = makeJSONfromDirectory('../weekly_logfiles/')

json_emp = employees('employees.db')

@hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'

@route('/feature4')
def returnsingle():
    return json

@route('/employees')
def returnsingle():
    return json_emp

run(host='localhost', port=8081, debug=True)

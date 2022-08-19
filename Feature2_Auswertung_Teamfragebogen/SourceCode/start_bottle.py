from bottle import route, run, response, hook
import sqlite3 as sql
import pandas as pd
import os
from textblob_de import TextBlobDE as tbd
import nltk
nltk.download('punkt')

def getNLPscore(entry):
    text = str(entry)
    blob = tbd(text)
    return blob.sentiment.polarity

def makeJSONfromDirectory(directory, NLP=False):

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
    
    # perform sentiment analysis if needed
    if NLP:
        sentiment_list = []
        for index, row in all_data.iterrows():
            
            text1 = row['8. Mit welchen Schlagworten / Adjektiven würden Sie die Stimmung im Team beschreiben?']
            text2 = row['9. Welche Konflikte existieren in ihrem Team?']
            text3 = row['10. Wie würden Sie ihr Verhältnis zu ihrem direkten Vorgesetzen charakterisieren?']
            
            score = getNLPscore(text1) + getNLPscore(text2) + getNLPscore(text3)
            sentiment_list.append(score)
        all_data['NLP_score'] = sentiment_list
        
    json = all_data.to_json(orient='records')
    return json

json = makeJSONfromDirectory('../Umfragedaten_monatlich/', NLP=True)

@hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'
    
@route('/feature2')
def returnsingle():
    return json

run(host='localhost', port=8080, debug=True)

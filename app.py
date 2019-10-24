from flask import Flask, request, jsonify
from pyquery import PyQuery as pq
import json
app = Flask(__name__)

@app.route('/', methods=['GET'])
def respond():
    term = ""
    d = pq(url="https://registrar.adelphi.edu/academic-calendar/")
    table = d("table").html()
    rows = pq(table).children()

    conditionString = "do"
    count = 0
    events = []

    while conditionString or conditionString == "do":
            shouldPrint = True

            row = pq(rows('tr').eq(count))
            rowdata = row.children()

            rowtd1data = pq(rowdata)('td').eq(0).text()
            rowtd2data = pq(rowdata)('td').eq(1).text()

            if rowtd2data == "":
                    term = rowtd1data
                    shouldPrint = False

            conditionString = rowtd1data

            if shouldPrint:
                    data = {}
                    data['term'] = term
                    data['date'] = rowtd1data
                    data['description'] = rowtd2data

                    events.append(data)
            count += 1

    myJSON = {"events": events}

    response = app.response_class(
        response=json.dumps(myJSON),
        status=200,
        mimetype='application/json'
    )
    return response

@app.route('/test', methods=['GET'])
def fake_json():
    fake_json = {
        "events": [
            {
                "date": {
                    "start_date": "2019-10-30",
                    "end_date": "2019-10-30",
                    "range": False
                },
                "term": "Fall 2020",
                "description": "Graduate Registration Begins for Spring 2020"
            },
            {
                "date": {
                    "start_date": "2019-11-29",
                    "end_date": "2019-11-29",
                    "range": False
                },
                "term": "Fall 2020",
                "description": "Undergraduate Registration Begins for Spring 2020"
            },
            {
                "date": {
                    "start_date": "2019-11-27",
                    "end_date": "2019-12-01",
                    "range": True
                },
                "term": "Fall 2020",
                "description": "Thanksgiving Break - NO CLASSES"
            },
            {
                "date": {
                    "start_date": "2019-12-18",
                    "end_date": "2019-12-18",
                    "range": False
                },
                "term": "Fall 2020",
                "description": "Finals Begin"
            },
            {
                "date": {
                    "start_date": "2019-12-18",
                    "end_date": "2019-12-18",
                    "range": False
                },
                "term": "Fall 2020",
                "description": "Last Day of Fall 2019 Term"
            },
        ]
    }

    response = app.response_class(
        response=json.dumps(fake_json),
        status=200,
        mimetype='application/json'
    )
    return response 

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000)
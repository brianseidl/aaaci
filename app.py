from flask import Flask, request, jsonify
from pyquery import PyQuery as pq
import json

app = Flask(__name__)
app.url_map.strict_slashes = False


@app.route('/', methods=['GET'])
def respond():
    # get scott data
    data = _scott_scrape()

    for event in data["events"]:
        event["date"] = _format_date(event)

    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )
    return response


def _scott_scrape():
    """
    I do not take credit for this function. Scott wrote this logic
    to grab data from the Adelphi Calander. This code is ugly. Sorry Scott.
    """
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

    return {"events": events}


def _format_date(event):
    """Returns formated date json object for event"""
    old_date = event["date"]
    term = event["term"]

    dates = old_date.split("-")
    if len(dates) == 1:
        is_range = False
    else:
        is_range = True

    is_range = (len(dates) > 1)

    if is_range:
        start_date = dates[0]
        end_date = dates[-1]
    else:
        start_date = dates[0]
        end_date = dates[0]


    new_start_date = _format_date_string(start_date, term)
    new_end_date = _format_date_string(end_date, term)

    date = {
        "start_date": new_start_date,
        "end_date": new_end_date,
        "range": is_range,
    }

    return date


def _format_date_string(date_str, term):
    MONTH = {
        "January":   "01",
        "February":   "02",
        "March":     "03",
        "April":     "04",
        "May":       "05",
        "June":      "06",
        "July":      "07",
        "August":    "08",
        "September": "09",
        "October":   "10",
        "November":  "11",
        "December":  "12",
    }

    month = date_str.split()[0]
    day = date_str.split()[-1]

    if len(day) == 1:
        day = "0{}".format(day)
    month = MONTH.get(month, month)
    year = term.split()[-1]

    return "{}-{}-{}".format(year, month, day)


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
    app.run(threaded=True, port=5000, debug=True)

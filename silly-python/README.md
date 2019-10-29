# Silly Python
Silly python REST API to get Adelphi calander data

### Note
If you do not wish to change the silly-python API, you do not need to run this locally as the Alexa Backend will call the existing endpoint by default.

## Running Locally

#### Setup virtual environment
```console
foo@barr:~/aaaci$ virtualenv -p python3.7 venv    # create virtualenv
foo@barr:~/aaaci$ source venv/bin/activate        # activate virtualenv
```

#### Install required packages
```console
(venv) foo@barr:~/aaaci/silly-python$ pip install -r requirements.txt
```

#### Run development server
```console
(venv) foo@barr:~/aaaci/silly-python$ python app.py
```
Your local development server will be running on http://localhost:5000/

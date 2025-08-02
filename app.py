from flask import Flask
import os

app = Flask(__name__)

# A secret key is required for using 'sessions' in Flask
app.secret_key = os.urandom(24)

import routes

if __name__ == '__main__':
    app.run(debug=True)
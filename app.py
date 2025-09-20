from flask import Flask
import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv


# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)

# A secret key is required for using 'sessions' in Flask
app.secret_key = os.urandom(24)

# Configure the database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('LOCAL_DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database object
db = SQLAlchemy(app)

# Function to capitalise first letter of user's name
def capitalize_words(s):
    if not isinstance(s, str):
        return s
    return ' '.join(word.capitalize() for word in s.split())



# Add the filter to the Jinja environment
app.jinja_env.filters['capitalize_words'] = capitalize_words

import routes
import models

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

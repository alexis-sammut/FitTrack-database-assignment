from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import variables from config.py
from config import SECRET_KEY, SQLALCHEMY_DATABASE_URI

app = Flask(__name__)

# Assign the imported variables to the app's config
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def capitalize_words(s):
    if not isinstance(s, str):
        return s
    return ' '.join(word.capitalize() for word in s.split())

app.jinja_env.filters['capitalize_words'] = capitalize_words

import routes
import models

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
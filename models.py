from app import db
import datetime

# User table for authentication and user-specific data.
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    
    # This relationship links a user to their workouts, meals, and logged days.
    # The 'back_populates' creates a two-way relationship, allowing easy access between a user and their logged data.
    workouts = db.relationship('WorkoutLogged', back_populates='user', lazy=True)
    meals = db.relationship('MealsLogged', back_populates='user', lazy=True)
    days = db.relationship('DayLogged', back_populates='user', lazy=True)

    def __repr__(self):
        return f"<User {self.name}>"

# Table for logged workouts.
class WorkoutLogged(db.Model):
    __tablename__ = 'workout_logged'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    workout_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    distance = db.Column(db.Float)
    pace = db.Column(db.Float)
    intensity = db.Column(db.String(20))
    calories = db.Column(db.Float, nullable=False)
    
    # Define a one-to-many relationship with the user.
    user = db.relationship('User', back_populates='workouts')

    def __repr__(self):
        return f"<Workout {self.workout_type} by User {self.user_id}>"

# Table for logging meals.
class MealsLogged(db.Model):
    __tablename__ = 'meals_logged'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    total_weight = db.Column(db.Float, nullable=False)
    total_total_fat = db.Column(db.Float, nullable=False)
    total_saturated_fat = db.Column(db.Float, nullable=False)
    total_total_carbs = db.Column(db.Float, nullable=False)
    total_fiber = db.Column(db.Float, nullable=False)
    total_sugar = db.Column(db.Float, nullable=False)
    total_sodium = db.Column(db.Float, nullable=False)
    total_potassium = db.Column(db.Float, nullable=False)
    total_cholesterol = db.Column(db.Float, nullable=False)
    
    # A meal can have many logged ingredients.
    ingredients = db.relationship('LoggedIngredient', back_populates='meal', lazy=True)
    user = db.relationship('User', back_populates='meals')

    def __repr__(self):
        return f"<Meal {self.name} by User {self.user_id}>"

# Table for storing individual logged ingredient entries.
class LoggedIngredient(db.Model):
    __tablename__ = 'logged_ingredients'
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals_logged.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    total_fat = db.Column(db.Float, nullable=False)
    saturated_fat = db.Column(db.Float, nullable=False)
    total_carbs = db.Column(db.Float, nullable=False)
    fiber = db.Column(db.Float, nullable=False)
    sugar = db.Column(db.Float, nullable=False)
    odium = db.Column(db.Float, nullable=False)
    potassium = db.Column(db.Float, nullable=False)
    cholesterol = db.Column(db.Float, nullable=False)
    
    # An ingredient can only belong to one meal.
    meal = db.relationship('MealsLogged', back_populates='ingredients')

    def __repr__(self):
        return f"<Logged Ingredient {self.name} in Meal {self.meal_id}>"

# Table for logging daily stats/mood.
class DayLogged(db.Model):
    __tablename__ = 'days_logged'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, unique=True, default=datetime.date.today)
    mood = db.Column(db.String(50))
    notes = db.Column(db.Text)
    # Define a one-to-many relationship with the user.
    user = db.relationship('User', back_populates='days')

    def __repr__(self):
        return f"<Day Logged for User {self.user_id} on {self.date}>"

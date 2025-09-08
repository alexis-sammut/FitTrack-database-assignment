from flask import render_template, request, redirect, url_for, session, jsonify, flash
from app import app, db
from models import User
import json
import time

@app.route('/', methods=['GET'])
def index():
    """Renders the home page."""
    return render_template('index.html')

@app.route('/log_workout', methods=['GET', 'POST'])
def log_workout_page():
    """Handles the log workout form submission."""
    if request.method == 'POST':
        # Initialize 'workouts' in session if it doesn't exist yet
        if 'workouts' not in session:
            session['workouts'] = []

        # Create a new workout dictionary from the form inputs
        new_workout = {
            'id': int(time.time() * 1000), # ID based on timestamp
            'type': request.form.get('workoutType'),
            'duration': request.form.get('duration'),
            'distance': request.form.get('distance'),
            'pace': request.form.get('pace'),
            'intensity': request.form.get('intensity'),
            'calories': request.form.get('estimatedCalories')
        }
        
        session['workouts'].append(new_workout)
        session.modified = True
        
        # Redirect to the review page after logging the workout
        return redirect(url_for('review_page'))
    
    return render_template('log_workout.html')

@app.route('/log_meal', methods=['GET', 'POST'])
def log_meal_page():
    """Handles the log meal form submission."""
    if request.method == 'POST':
         # Initialize 'meals' in session if it doesn't exist yet
        if 'meals' not in session:
            session['meals'] = []

        # The script sends the data as a JSON string in a hidden input
        meal_data_str = request.form.get('mealData')
        if meal_data_str:
            meal_data = json.loads(meal_data_str)
            
            # Add ID before saving
            meal_data['id'] = int(time.time() * 1000)
            
            session['meals'].append(meal_data)
            session.modified = True

        return redirect(url_for('review_page'))
        
    return render_template('log_meal.html')

@app.route('/review', methods=['GET'])
def review_page():
    """Renders the review page, getting logged workouts and meals from the session."""
    workouts = session.get('workouts', [])
    meals = session.get('meals', [])
    return render_template('review.html', workouts=workouts, meals=meals)

@app.route('/delete_item', methods=['POST'])
def delete_item():
    """Handles the deletion of a logged item."""
    data = request.get_json()
    item_type = data.get('item_type')
    item_id = data.get('item_id')

    if item_type and item_id:
        # Determine what kind of logged item to remove (e.g., 'workouts' or 'meals')
        session_key = f"{item_type}s" 
        if session_key in session:
            # Find and remove the item by its ID
            session[session_key] = [item for item in session[session_key] if item['id'] != item_id]
            session.modified = True
            return jsonify({'success': True, 'message': 'Item deleted.'})

    return jsonify({'success': False, 'message': 'Invalid request.'})


@app.route('/contact', methods=['GET'])
def contact_page():
    """Renders the contact page."""
    return render_template('contact.html')

@app.route('/authentification', methods=['GET'])
def authentification_page():
    """Renders the authentification page."""
    return render_template('authentification.html')

@app.route('/register_user', methods=['POST'])
def register_user():
    """
    Handles the registration of a new user.
    Checks for existing email or username before adding to the database.
    """
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')

    # Query the database to check if a user with this email already exists
    existing_user_by_email = User.query.filter_by(email=email).first()
    
    if existing_user_by_email:
        flash("An account with that email already exists. Please log in or use a different email.", "error")
        return redirect(url_for('authentification_page', show_register='true'))
    
    # In a real app, you would hash the password for security.
    # For now, we'll use a placeholder.
    hashed_password = password # Placeholder for now

    new_user = User(name=name, email=email, password=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        # Log the user in after successful registration
        session['user_id'] = new_user.id
        return redirect(url_for('index'))
    except Exception as e:
        db.session.rollback()
        flash("An error occurred during registration. Please try again.", "error")
        return redirect(url_for('authentification_page', show_register='true'))
    
@app.route('/login_user', methods=['POST'])
def login_user():
    """Handles user login and sets up the session."""
    email = request.form.get('email')
    password = request.form.get('password')
    
    user = User.query.filter_by(email=email).first()

    if user and user.password == password: # In a real app, you would use bcrypt.check_password_hash()
        # Log the user in by storing their ID in the session
        session['user_id'] = user.id
        return redirect(url_for('index')) 
    else:
        flash("Login failed. Please check your email and password.", "error")
        return redirect(url_for('authentification_page'))
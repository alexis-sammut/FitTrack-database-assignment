from flask import render_template, request, redirect, url_for, session, jsonify
from app import app 
import json
import time

@app.route('/')
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

@app.route('/review')
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


@app.route('/contact')
def contact_page():
    """Renders the contact page."""
    return render_template('contact.html')

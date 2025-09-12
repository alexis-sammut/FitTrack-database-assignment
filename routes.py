from flask import render_template, request, redirect, url_for, session, jsonify, flash, get_flashed_messages
from app import app, db
from models import User, WorkoutLogged, MealsLogged, LoggedIngredient, DayLogged
import json
import time

@app.route('/', methods=['GET'])
def index():
    """Renders the home page, passing user information if they are logged in."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))
    return render_template('index.html', user=user)

@app.route('/log_workout', methods=['GET', 'POST'])
def log_workout_page():
    """Handles the log workout form submission."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))

    if request.method == 'POST':
        user_id = session.get('user_id')

        # Data from form
        workout_type = request.form.get('workoutType')
        duration = request.form.get('duration')
        distance = request.form.get('distance')
        pace = request.form.get('pace')
        intensity = request.form.get('intensity')
        calories = request.form.get('estimatedCalories')

        # Logic to save to DB for logged-in users
        if user_id:
            try:
                # Create a new WorkoutLogged object with all the data
                new_db_workout = WorkoutLogged(
                    user_id=user_id,
                    workout_type=workout_type,
                    duration=int(duration),
                    distance=float(distance) if distance else None,
                    pace=float(pace) if pace else None,
                    intensity=intensity,
                    calories=float(calories) if calories else None
                )

                # Add and commit the object to the database
                db.session.add(new_db_workout)
                db.session.commit()
                flash("Workout logged successfully!", "success")
                
            except Exception as e:
                db.session.rollback()
                print(f"Error saving workout to database: {e}")
        
        else:
            # Logic to save to session for non logged-in users
            if 'workouts' not in session:
                session['workouts'] = []

            # Create a dictionary for the workout
            new_session_workout = {
                'id': int(time.time() * 1000),
                'type': workout_type,
                'duration': duration,
                'distance': distance,
                'pace': pace,
                'intensity': intensity,
                'calories': calories
            }

            # Append the dictionary to the session list
            session['workouts'].append(new_session_workout)
            session.modified = True
            flash("Workout logged temporarily!", "success")

        # Redirect to the review page after processing
        return redirect(url_for('review_page'))
    
    return render_template('log_workout.html', user=user)

@app.route('/log_meal', methods=['GET', 'POST'])
def log_meal_page():
    
    """Handles the log meal form submission."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))
    
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
   
    return render_template('log_meal.html', user=user)

@app.route('/review', methods=['GET'])
def review_page():
    
    """Renders the review page, getting logged workouts and meals from the session."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))

    user_id = session.get('user_id')
    workouts = []
    meals = []
    
    if user_id :
        # Fetch workouts and meals from the database for the logged-in user
        db_workouts = WorkoutLogged.query.filter_by(user_id=user_id).all()
        db_meals = MealsLogged.query.filter_by(user_id=user_id).all()    
        
        # Convert objects to dictionaries for JSON serialization
        workouts_list = [
            {
                'id': w.id,
                'type': w.workout_type,
                'duration': w.duration,
                'distance': w.distance,
                'pace': w.pace,
                'intensity': w.intensity,
                'calories': w.calories
            } for w in db_workouts
        ]
        
    else : 
        workouts_list = session.get('workouts', [])
        meals = session.get('meals', [])
    
    return render_template('review.html', workouts=workouts_list, meals=meals, user=user)

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

    """ Renders the authentification page.
        If the user is logged in, redirects them to the account page."""

    if 'user_id' in session:
        return redirect(url_for('account_page'))

    return render_template('authentification.html')

@app.route('/account', methods=['GET'])
def account_page():

    """Renders the account page.
    Retrieves user information from the database and passes it to the template.
    Requires the user to be logged in."""
    
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return render_template('account.html', user=user)

    return redirect(url_for('authentification_page'))

@app.route('/register_user', methods=['POST'])
def register_user():
    
    """Handles the registration of a new user.
    Checks for existing email or username before adding to the database."""
    
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')

    # Query the database to check if a user with this email already exists
    existing_user_by_email = User.query.filter_by(email=email).first()
    
    if existing_user_by_email:
        flash("An account with that email already exists. Please log in or use a different email.", "error")
        return redirect(url_for('authentification_page', show_register='true'))
    
    hashed_password = password 

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

    if user and user.password == password: 
        # Log the user in by storing their ID in the session
        session['user_id'] = user.id
        return redirect(url_for('index')) 
    else:
        flash("Login failed. Please check your email and password.", "error")
        return redirect(url_for('authentification_page'))
    
@app.route('/account/logout', methods=['POST'])
def logout_user():

    """Handles user logout by clearing the session."""
    
    user_id = session.get('user_id')
    if not user_id:
         flash("Not logged in.", "error")
         return redirect(url_for('authentification_page', show_register='true'))

    session.clear()
    return redirect(url_for('index'))

@app.route('/account/change_password', methods=['POST'])
def change_password():
    """Handles changing the user's password."""
    user_id = session.get('user_id')
    if not user_id:
        flash("Not logged in.", "error")
        return redirect(url_for('authentification_page', show_register='true'))

    new_password = request.form.get('new_password')
    user = User.query.get(user_id)

    if user:
        user.password = new_password 
        db.session.commit()
        flash('Password changed successfully.', "success")
    else:
        flash('User not found.', "error")

    # Redirect the user back to the account page with a parameter to show the password form
    return redirect(url_for('account_page', show_form='password'))

@app.route('/account/change_info', methods=['POST'])
def change_info():
    """Handles changing the user's name and/or email."""
    user_id = session.get('user_id')
    if not user_id:
        flash("Not logged in.", "error")
        return redirect(url_for('authentification_page', show_register='true'))

    user = User.query.get(user_id)
    if user:
        new_name = request.form.get('new-name')
        new_email = request.form.get('new-email')

        if new_name:
            user.name = new_name

        if new_email and new_email != user.email:
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id != user.id:
                flash('Email already in use. Try another email.','error')
                return redirect(url_for('account_page', show_form='account'))
                
            user.email = new_email

        db.session.commit()
        flash('Information updated successfully.','success')
    else:
        flash('User not found.', 'error')
        
    # Redirect the user back to the account page with a parameter to show the account info form
    return redirect(url_for('account_page', show_form='account'))

@app.route('/account/delete_account', methods=['POST'])
def delete_account():
    """Deletes a user's account and logs them out."""
    user_id = session.get('user_id')
    if not user_id:
        flash("Not logged in.", "error")
        return redirect(url_for('authentification_page', show_register='true'))

    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        session.clear()
        flash("Account deleted successfully.", "success")
        return redirect(url_for('index'))
    else:
        flash('User not found.', "error")
        return redirect(url_for('account_page'))
    
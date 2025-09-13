from flask import render_template, request, redirect, url_for, session, jsonify, flash, get_flashed_messages
from app import app, db
from models import User, WorkoutLogged, MealsLogged, LoggedIngredient, DayLogged
import json
import time
import datetime

@app.route('/', methods=['GET'])
def index():
    """Renders the home page, passing user information if they are logged in."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))
    return render_template('index.html', user=user)

@app.route('/log_workout', methods=['GET', 'POST'])
def log_workout():
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

        # Redirect to the review page after processing
        return redirect(url_for('review_workouts'))
    
    return render_template('log_workout.html', user=user)

@app.route('/log_meal', methods=['GET', 'POST'])
def log_meal():
    
    """Handles the log meal form submission."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))
    
    if request.method == 'POST':
        user_id = session.get('user_id')
        meal_data_str = request.form.get('mealData')

        if meal_data_str:
            meal_data = json.loads(meal_data_str)
            
            if user_id:
                try:
                    # Create the main MealsLogged object
                    new_db_meal = MealsLogged(
                        user_id=user_id,
                        name=meal_data['name'],
                        date=datetime.datetime.now(),
                        total_weight=float(meal_data['totalNutrients']['amount']),
                        total_total_fat=float(meal_data['totalNutrients']['fat_total_g']),
                        total_saturated_fat=float(meal_data['totalNutrients']['fat_saturated_g']),
                        total_total_carbs=float(meal_data['totalNutrients']['carbohydrates_total_g']),
                        total_fiber=float(meal_data['totalNutrients']['fiber_g']),
                        total_sugar=float(meal_data['totalNutrients']['sugar_g']),
                        total_sodium=float(meal_data['totalNutrients']['sodium_mg']),
                        total_potassium=float(meal_data['totalNutrients']['potassium_mg']),
                        total_cholesterol=float(meal_data['totalNutrients']['cholesterol_mg'])
                    )
                    
                    db.session.add(new_db_meal)
                    # Commit here to get the new meal's ID before adding ingredients
                    db.session.commit()
                    
                    # Loop through the ingredients and create LoggedIngredient objects
                    for item in meal_data['items']:
                        new_ingredient = LoggedIngredient(
                            meal_id=new_db_meal.id,
                            name=item['name'],
                            weight=float(item['amount']),
                            total_fat=float(item['fat_total_g']),
                            saturated_fat=float(item['fat_saturated_g']),
                            total_carbs=float(item['carbohydrates_total_g']),
                            fiber=float(item['fiber_g']),
                            sugar=float(item['sugar_g']),
                            odium=float(item['sodium_mg']),
                            potassium=float(item['potassium_mg']),
                            cholesterol=float(item['cholesterol_mg'])
                        )
                        db.session.add(new_ingredient)
                    db.session.commit()
                
                except Exception as e:
                    db.session.rollback()
                    print(f"Error saving meal to database: {e}")
                                
            else:
                # Logic to save to session for non logged-in users
                if 'meals' not in session:
                    session['meals'] = []

                meal_data['id'] = int(time.time() * 1000)
                
                session['meals'].append(meal_data)
                session.modified = True

        return redirect(url_for('review_meals'))
   
    return render_template('log_meal.html', user=user)

@app.route('/review_workouts', methods=['GET'])
def review_workouts():
    
    """Renders the workout review page, getting logged workouts from the session or database."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))

    workouts = []

    if user:
        db_workouts = WorkoutLogged.query.filter_by(user_id=user.id).all()
        workouts = [
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
            
    else:
        workouts = session.get('workouts', [])
    
    return render_template('review_workouts.html', workouts=workouts, user=user)

@app.route('/review_meals', methods=['GET'])
def review_meals():
    
    """Renders the meal review page, getting logged meals from the session or database."""
    user = None
    if 'user_id' in session:
        user = User.query.get(session.get('user_id'))

    meals = []

    if user:
        db_meals = MealsLogged.query.filter_by(user_id=user.id).all()
        meals = []
        for meal in db_meals:
            meal_dict = {
                'id': meal.id,
                'name': meal.name,
                'date': meal.date.strftime('%d %b, %Y'),
                'totalNutrients': {
                    'amount': meal.total_weight,
                    'fat_total_g': meal.total_total_fat,
                    'fat_saturated_g': meal.total_saturated_fat,
                    'carbohydrates_total_g': meal.total_total_carbs,
                    'fiber_g': meal.total_fiber,
                    'sugar_g': meal.total_sugar,
                    'sodium_mg': meal.total_sodium,
                    'potassium_mg': meal.total_potassium,
                    'cholesterol_mg': meal.total_cholesterol
                },
                'items': [
                    {
                        'name': item.name,
                        'amount': item.weight,
                        'fat_total_g': item.total_fat,
                        'fat_saturated_g': item.saturated_fat,
                        'carbohydrates_total_g': item.total_carbs,
                        'fiber_g': item.fiber,
                        'sugar_g': item.sugar,
                        'sodium_mg': item.odium,
                        'potassium_mg': item.potassium,
                        'cholesterol_mg': item.cholesterol
                    } for item in meal.ingredients
                ]
            }
            meals.append(meal_dict)
            
    else:
        meals = session.get('meals', [])
    
    return render_template('review_meals.html', meals=meals, user=user)
          
@app.route('/delete_item', methods=['POST'])
def delete_item():
    
    """Handles the deletion of a logged item."""
    
    user_id = session.get('user_id')
    data = request.get_json()
    item_type = data.get('item_type')
    item_id = data.get('item_id')

    if item_type and item_id:
        if user_id:
            # Delete from the database
            if item_type == 'workout':
                item_to_delete = WorkoutLogged.query.filter_by(id=item_id, user_id=user_id).first()
            elif item_type == 'meal':
                # For meals, we need to also delete the associated ingredients
                item_to_delete = MealsLogged.query.filter_by(id=item_id, user_id=user_id).first()
                if item_to_delete:
                    # Delete associated ingredients first
                    LoggedIngredient.query.filter_by(meal_id=item_to_delete.id).delete()
            
            if item_to_delete:
                db.session.delete(item_to_delete)
                db.session.commit()
                return jsonify({'success': True, 'message': 'Item deleted.'})
            else:
                return jsonify({'success': False, 'message': 'Item not found or does not belong to user.'})

        else:
            # Delete from the session
            session_key = f"{item_type}s" 
            if session_key in session:
                session[session_key] = [item for item in session[session_key] if item['id'] != item_id]
                session.modified = True
                return jsonify({'success': True, 'message': 'Item deleted.'})

    return jsonify({'success': False, 'message': 'Invalid request.'})

@app.route('/contact', methods=['GET'])
def contact():
    
    """Renders the contact page."""
    
    return render_template('contact.html')

@app.route('/authentification', methods=['GET'])
def authentification():

    """ Renders the authentification page.
        If the user is logged in, redirects them to the account page."""

    if 'user_id' in session:
        return redirect(url_for('account'))

    return render_template('authentification.html')

@app.route('/account', methods=['GET'])
def account():

    """Renders the account page.
    Retrieves user information from the database and passes it to the template.
    Requires the user to be logged in."""
    
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return render_template('account.html', user=user)

    return redirect(url_for('authentification'))

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
        return redirect(url_for('authentification', show_register='true'))
    
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
        return redirect(url_for('authentification', show_register='true'))
    
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
        return redirect(url_for('authentification'))
    
@app.route('/account/logout', methods=['POST'])
def logout_user():

    """Handles user logout by clearing the session."""
    
    user_id = session.get('user_id')
    if not user_id:
         flash("Not logged in.", "error")
         return redirect(url_for('authentification', show_register='true'))

    session.clear()
    return redirect(url_for('index'))

@app.route('/account/change_password', methods=['POST'])
def change_password():
    """Handles changing the user's password."""
    user_id = session.get('user_id')
    if not user_id:
        flash("Not logged in.", "error")
        return redirect(url_for('authentification', show_register='true'))

    new_password = request.form.get('new_password')
    user = User.query.get(user_id)

    if user:
        user.password = new_password 
        db.session.commit()
        flash('Password changed successfully.', "success")
    else:
        flash('User not found.', "error")

    # Redirect the user back to the account page with a parameter to show the password form
    return redirect(url_for('account', show_form='password'))

@app.route('/account/change_info', methods=['POST'])
def change_info():
    """Handles changing the user's name and/or email."""
    user_id = session.get('user_id')
    if not user_id:
        flash("Not logged in.", "error")
        return redirect(url_for('authentification', show_register='true'))

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
                return redirect(url_for('account', show_form='account'))
                
            user.email = new_email

        db.session.commit()
        flash('Information updated successfully.','success')
    else:
        flash('User not found.', 'error')
        
    # Redirect the user back to the account page with a parameter to show the account info form
    return redirect(url_for('account', show_form='account'))

@app.route('/account/delete_account', methods=['POST'])
def delete_account():
    """Deletes a user's account and logs them out."""
    user_id = session.get('user_id')
    if not user_id:
        flash("Not logged in.", "error")
        return redirect(url_for('authentification', show_register='true'))

    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        session.clear()
        flash("Account deleted successfully.", "success")
        return redirect(url_for('index'))
    else:
        flash('User not found.', "error")
        return redirect(url_for('account'))

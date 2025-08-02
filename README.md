FitTrack - This is the assignment for the Pyhton module

URL : https://fittrack-python-assignement.onrender.com/
GIT Repository : https://github.com/alexis-sammut/FitTrack-Python-assignement

The app is made of 5 pages:
- Home page
- Log a Workout
- Log a Meal
- Review page
- Contact page

The purpose of the app, is to track your recent workouts, and your meals in order to get insights on your health habits

The home page simply presents the app, and provide some useful ressources to learn more about healthy lifestyles

The Log a Workout page is a form that allows you to select your workout type, and enter some additonal details. 
Automatically this will calculate the *estimated* amount of calories burnt.

The Log a Meal page is another form that allows you to enter food items you used in your meals, with their amounts (if no amount entered, the form will default to 100g)
Once you have entered all the food items, you can click on the Get Nutritional Data, that will display a table with the nutrients of each item, and the total of the meal.
The form calls a Nutrition API from API Ninja (https://api-ninjas.com/api/nutrition)
You can then click on Log Meal

The Review page is where all the data is stored and displayed. It's made of 2 sections:
- The first section is an Overview of all your data, it's also made of 2 child sections
    - One for your workouts, including your overall workout data, but also your overall workout data per workout type
    - The other for your meals, including an overview of the total of nutrients logged, and their average per meal logged
- The second section is an history of all items loged, it's also made of 2 inner sections
    - One with a list of all your past workouts
    - The other with a list of all your past meals
 
The last page is a Contact page, including a form, and social links for suggestions.

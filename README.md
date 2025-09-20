This is an updated version of my python assignment : https://fittrack-python-assignement.onrender.com/

You can access the web app here : https://fittrack-database-assignment-1.onrender.com/

Updates made :

- Connected database to original project
    - Database includes 5 tables :
        - 'Users', with one to many relationship with following tables:
            - 'Workouts'
            - 'Moods'
            - 'Meals', with one to many relationship with following table
                - 'Ingredients'

- Created new pages :
    - An authentification to create an account/user or login in an existing one
    - Account page to manage your account
        - view user details, update them, log out, or delete the account
    - Split the review page into review meal and review workout pages
    - A new log mood page to log your daily mood, or update it if already logged
    - A new review mood page

Missed opportunity:
 I was planning on adding a button for each logged workout/meal to open a pop form to update the logged item

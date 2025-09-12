// Loading script only when all the DOM has been loaded completely
document.addEventListener("DOMContentLoaded", () => {
  // Log Workout page

  const workoutForm = document.getElementById("workoutForm");
  // Making sure the Workout functions are only called on the Log Workout page
  // Referencing Log Workout items

  if (workoutForm) {
    const workoutType = document.getElementById("workoutType");
    const durationInput = document.getElementById("duration");
    const distanceGroup = document.getElementById("distanceGroup");
    const distanceInput = document.getElementById("distance");
    const intensityGroup = document.getElementById("intensityGroup");
    const intensityInput = document.getElementById("intensity");
    const paceGroup = document.getElementById("paceGroup");
    const paceDisplay = document.getElementById("paceDisplay");
    const paceHiddenInput = document.getElementById("pace");
    const calsGroup = document.getElementById("calsGroup");
    const calsDisplay = document.getElementById("estimatedCaloriesDisplay");
    const calsHiddenInput = document.getElementById("estimatedCalories");

    // Defining which workouts are "distance-based"
    const distanceBasedWorkouts = ["Running", "Walking", "Cycling"];

    //Defining which workouts are "intensity-based"

    const intensityBasedWorkouts = [
      "Rowing",
      "Swimming",
      "Hiking",
      "Yoga",
      "Pilates",
      "HIIT",
      "Strength Training",
    ];

    // Function to display hidden fields

    function displayHiddenField() {
      const selectedWorkout = workoutType.value;
      distanceGroup.style.display = distanceBasedWorkouts.includes(
        selectedWorkout
      )
        ? "block"
        : "none";
      distanceInput.required = distanceBasedWorkouts.includes(selectedWorkout);
      intensityGroup.style.display = intensityBasedWorkouts.includes(
        selectedWorkout
      )
        ? "block"
        : "none";
      intensityInput.required =
        intensityBasedWorkouts.includes(selectedWorkout);
    }

    // Function to transform pace from decimal to 'readable' format

    function formatPaceToMinSec(decimalMinutes) {
      if (
        isNaN(decimalMinutes) ||
        decimalMinutes === null ||
        !isFinite(decimalMinutes)
      )
        return "--:--";
      const minutes = Math.floor(decimalMinutes);
      const seconds = Math.round((decimalMinutes - minutes) * 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    // Function to display and calculate pace field

    function calculatePace() {
      const selectedWorkout = workoutType.value;
      const durationEntered = parseFloat(durationInput.value);
      const distanceEntered = parseFloat(distanceInput.value);
      if (
        distanceBasedWorkouts.includes(selectedWorkout) &&
        durationEntered > 0 &&
        distanceEntered > 0
      ) {
        paceGroup.style.display = "block";
        const paceMinPerKm = durationEntered / distanceEntered;
        paceDisplay.textContent = formatPaceToMinSec(paceMinPerKm);
        paceHiddenInput.value = paceMinPerKm.toFixed(2);
      } else {
        paceGroup.style.display = "none";
      }
    }

    // Functions to calculate estimated calories burnt field
    // Here's a basic formula :  (METs * Body Weight in kg * Duration in hours)

    // First we need to calculate MET (Metabolic Equivalent of Task)

    function calculateMET() {
      const selectedWorkout = workoutType.value;
      let MET;

      if (distanceBasedWorkouts.includes(selectedWorkout)) {
        const durationEntered = parseFloat(durationInput.value);
        const distanceEntered = parseFloat(distanceInput.value);
        if (durationEntered === 0 || distanceEntered === 0) return 0;
        const speed = distanceEntered / (durationEntered / 60);

        switch (selectedWorkout) {
          case "Running":
            if (speed >= 13.0) MET = 13.5;
            else if (speed >= 11.4) MET = 11.65;
            else if (speed >= 9.8) MET = 10.5;
            else if (speed >= 8.1) MET = 9.15;
            else if (speed >= 6.0) MET = 7.15;
            else MET = 5.0;
            break;

          case "Walking":
            if (speed > 6.4) MET = 6.75;
            else if (speed >= 5.7) MET = 5.25;
            else if (speed >= 4.9) MET = 4.4;
            else if (speed >= 4.1) MET = 3.55;
            else if (speed >= 3.2) MET = 2.9;
            else MET = 2.25;
            break;

          case "Cycling":
            if (speed > 30) MET = 14.0;
            else if (speed >= 24) MET = 10.0;
            else if (speed >= 19) MET = 8.0;
            else if (speed >= 16) MET = 6.0;
            else MET = 4.0;
            break;
        }
      } else {
        const intensityEntered = intensityInput.value;

        switch (selectedWorkout) {
          case "Rowing":
            MET =
              intensityEntered === "Low"
                ? 4.0
                : intensityEntered === "Medium"
                ? 6.0
                : 8.0;
            break;
          case "Swimming":
            MET =
              intensityEntered === "Low"
                ? 5.0
                : intensityEntered === "Medium"
                ? 7.0
                : 9.0;
            break;
          case "Hiking":
            MET =
              intensityEntered === "Low"
                ? 3.5
                : intensityEntered === "Medium"
                ? 5.0
                : 6.5;
            break;
          case "Yoga":
          case "Pilates":
            MET =
              intensityEntered === "Low"
                ? 2.5
                : intensityEntered === "Medium"
                ? 3.5
                : 4.5;
            break;
          case "HIIT":
            MET =
              intensityEntered === "Low"
                ? 8.0
                : intensityEntered === "Medium"
                ? 10.0
                : 12.0;
            break;
          case "Strength Training":
            MET =
              intensityEntered === "Low"
                ? 3.0
                : intensityEntered === "Medium"
                ? 5.0
                : 6.0;
            break;
        }
      }
      return MET;
    }

    // Now we can calculate the estimated Calories burnt

    function calculateEstimatedCalsBurnt() {
      const durationEntered = parseFloat(durationInput.value);
      let MET = calculateMET();
      return MET * 70 * (durationEntered / 60);
    }

    // Function to display the estimated Cals

    function displayCalsGroup() {
      const selectedWorkout = workoutType.value;
      const durationEntered = parseFloat(durationInput.value);
      const distanceEntered = parseFloat(distanceInput.value);
      const intensityEntered = intensityInput.value;
      if (
        selectedWorkout &&
        durationEntered > 0 &&
        (distanceEntered > 0 || intensityEntered)
      ) {
        const calculatedCalsForLog = calculateEstimatedCalsBurnt();
        calsDisplay.textContent = `${Math.round(calculatedCalsForLog)} kcal.`;
        calsHiddenInput.value = calculatedCalsForLog.toFixed(2);
        calsGroup.style.display = "block";
      } else {
        calsGroup.style.display = "none";
      }
    }

    // Calling the functions when any of the field input is updated
    workoutType.addEventListener("change", () => {
      displayHiddenField();
      calculatePace();
      displayCalsGroup();
    });
    durationInput.addEventListener("input", () => {
      calculatePace();
      displayCalsGroup();
    });
    distanceInput.addEventListener("input", () => {
      calculatePace();
      displayCalsGroup();
    });
    intensityInput.addEventListener("change", displayCalsGroup);

    // Initial setup on page load
    displayHiddenField();
  }

  // Log meal page

  const mealForm = document.getElementById("mealForm");
  // Making sure the Meal functions are only called on the Log Meal page
  // Referencing Log Meal items
  if (mealForm) {
    const addFoodItemBtn = document.getElementById("addFoodItemBtn");
    const fieldErrorMessage = document.getElementById("addFieldError");
    const nutritionTableContainer = document.getElementById(
      "nutritionTableContainer"
    );
    const nutritionTable = document.getElementById("nutritionTable");
    const getNutritionButton = document.getElementById("getNutritionButton");
    const logMealButton = document.getElementById("logMealButton");
    const spinningLoader = document.getElementById("loader");
    const foodEntriesContainer = document.getElementById(
      "foodEntriesContainer"
    );
    const mealDataInput = document.getElementById("mealData");

    // Function to add field in form

    function addFoodField() {
      const container = document.getElementById("foodEntriesContainer");
      const allRows = container.querySelectorAll(".form-entry-row");
      const lastRow = allRows[allRows.length - 1];
      const lastFoodInput = lastRow.querySelector('input[name="foodName[]"]');

      if (lastFoodInput.value.trim() === "") {
        fieldErrorMessage.textContent =
          "Please fill in the previous row before adding a new one.";
        return;
      }

      fieldErrorMessage.textContent = "";
      const currentRowCount = container.children.length + 1;
      const newRow = document.createElement("div");
      newRow.classList.add("form-entry-row");
      newRow.innerHTML = `
        <div class="form-group">
            <label for="foodName${currentRowCount}">Food Name</label>
            <input type="text" id="foodName${currentRowCount}" name="foodName[]" placeholder="e.g., Apple" required>
        </div>
        <div class="form-group food-quantity-group">
            <label for="foodQuantity${currentRowCount}">Quantity (g)</label>
            <input type="number" id="foodQuantity${currentRowCount}" name="foodQuantity[]" placeholder="e.g., 100" min="1">
        </div>
        <button type="button" class="remove-item-button">-</button>
      `;
      container.appendChild(newRow);
    }

    // Attach the add field function to the '+' button

    addFoodItemBtn.addEventListener("click", addFoodField);

    // Event delegation for removing items

    foodEntriesContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("remove-item-button")) {
        event.target.closest(".form-entry-row").remove();
      }
    });

    // Function to call the Ninja API Nutrition

    async function runNutritionAPI() {
      const APIKey = "vcfVfXLPlqLa8X0Uc6N6Pw==bG86tqJp6i5Q8qv6";
      const foodNameInputs = document.querySelectorAll(
        'input[name="foodName[]"]'
      );
      fieldErrorMessage.textContent = "";
      const allResults = [];
      for (let i = 0; i < foodNameInputs.length; i++) {
        const food = foodNameInputs[i].value.trim();
        try {
          const response = await fetch(
            `https://api.api-ninjas.com/v1/nutrition?query=${food}`,
            { method: "GET", headers: { "X-Api-Key": APIKey } }
          );
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          if (data.length === 0)
            throw new Error(`Something went wrong for '${food}'.`);
          allResults.push({ food, result: data[0], inputIndex: i });
        } catch (error) {
          console.error(error);
          if (error.message.includes("down")) {
            fieldErrorMessage.innerHTML = `<strong> API error:</strong> ${error}<br> Check the status page page <a href='https://api-ninjas.com/api/nutrition'> here</a>.`;
            return null;
          }
          fieldErrorMessage.innerHTML += `There was an issue getting the nutritional data for "<strong>${food}</strong>". Make sure there's no typo or try something else.<br>`;
        }
      }
      return allResults.length > 0 ? allResults : null;
    }

    // Function to populate the table with the nutrition data

    function populateNutrientTable(allResults) {
      let totalAmount = 0,
        totalFatTotal = 0,
        totalFatSaturated = 0,
        totalCarbohydratesTotal = 0,
        totalFiber = 0,
        totalSugar = 0,
        totalSodium = 0,
        totalPotassium = 0,
        totalCholesterol = 0;
      nutritionTable.innerHTML = "";
      allResults.forEach((res) => {
        const newRow = document.createElement("tr");
        const foodQuantity =
          parseFloat(
            document.getElementById(`foodQuantity${res.inputIndex + 1}`).value
          ) || 100;
        const multiplier = foodQuantity / 100;

        let name = res.food;
        let amount = foodQuantity;
        let fatTotal = res.result.fat_total_g * multiplier;
        let fatSaturated = res.result.fat_saturated_g * multiplier;
        let carbohydratesTotal = res.result.carbohydrates_total_g * multiplier;
        let fiber = res.result.fiber_g * multiplier;
        let sugar = res.result.sugar_g * multiplier;
        let sodium = res.result.sodium_mg * multiplier;
        let potassium = res.result.potassium_mg * multiplier;
        let cholesterol = res.result.cholesterol_mg * multiplier;

        newRow.innerHTML = `
                <td>${name.charAt(0).toUpperCase() + name.slice(1)}</td>
                <td>${amount.toFixed(1)}</td>
                <td>${fatTotal.toFixed(1)}</td>
                <td>${fatSaturated.toFixed(1)}</td>
                <td>${carbohydratesTotal.toFixed(1)}</td>
                <td>${fiber.toFixed(1)}</td>
                <td>${sugar.toFixed(1)}</td>
                <td>${sodium.toFixed(1)}</td>
                <td>${potassium.toFixed(1)}</td>
                <td>${cholesterol.toFixed(1)}</td>      
            `;
        nutritionTable.appendChild(newRow);

        totalAmount += amount;
        totalFatTotal += fatTotal;
        totalFatSaturated += fatSaturated;
        totalCarbohydratesTotal += carbohydratesTotal;
        totalFiber += fiber;
        totalSugar += sugar;
        totalSodium += sodium;
        totalPotassium += potassium;
        totalCholesterol += cholesterol;
      });

      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>${totalAmount.toFixed(1)}</strong></td>
            <td><strong>${totalFatTotal.toFixed(1)}</strong></td>
            <td><strong>${totalFatSaturated.toFixed(1)}</strong></td>
            <td><strong>${totalCarbohydratesTotal.toFixed(1)}</strong></td>
            <td><strong>${totalFiber.toFixed(1)}</strong></td>
            <td><strong>${totalSugar.toFixed(1)}</strong></td>
            <td><strong>${totalSodium.toFixed(1)}</strong></td>
            <td><strong>${totalPotassium.toFixed(1)}</strong></td>
            <td><strong>${totalCholesterol.toFixed(1)}</strong></td>      
        `;
      nutritionTable.appendChild(totalRow);
      nutritionTableContainer.style.display = "block";
    }

    // Function to display Meal table

    async function getNutritionalData() {
      spinningLoader.style.display = "block";
      try {
        const allResults = await runNutritionAPI();
        if (allResults) {
          populateNutrientTable(allResults);
          logMealButton.style.display = "block";
        }
      } catch (error) {
        console.error("Failed to get nutrition data:", error);
      }
      spinningLoader.style.display = "none";
    }

    getNutritionButton.addEventListener("click", getNutritionalData);

    mealForm.addEventListener("submit", function (event) {
      const mealNameInput = document.getElementById("meal-name");
      const tableRows = nutritionTable.querySelectorAll("tr");

      const foodItems = [];
      for (let i = 0; i < tableRows.length - 1; i++) {
        const cells = tableRows[i].querySelectorAll("td");
        foodItems.push({
          name: cells[0].textContent,
          amount: cells[1].textContent,
          fat_total_g: cells[2].textContent,
          fat_saturated_g: cells[3].textContent,
          carbohydrates_total_g: cells[4].textContent,
          fiber_g: cells[5].textContent,
          sugar_g: cells[6].textContent,
          sodium_mg: cells[7].textContent,
          potassium_mg: cells[8].textContent,
          cholesterol_mg: cells[9].textContent,
        });
      }

      const totalCells =
        tableRows[tableRows.length - 1].querySelectorAll("td, th");
      const totalNutrients = {
        amount: totalCells[1].textContent,
        fat_total_g: totalCells[2].textContent,
        fat_saturated_g: totalCells[3].textContent,
        carbohydrates_total_g: totalCells[4].textContent,
        fiber_g: totalCells[5].textContent,
        sugar_g: totalCells[6].textContent,
        sodium_mg: totalCells[7].textContent,
        potassium_mg: totalCells[8].textContent,
        cholesterol_mg: totalCells[9].textContent,
      };

      const mealDataObject = {
        name: mealNameInput.value || "Unnamed Meal",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        totalNutrients: totalNutrients,
        items: foodItems,
      };

      mealDataInput.value = JSON.stringify(mealDataObject);
    });
  }

  // Review page
  const statsOverview = document.getElementById("stats-overview");
  if (statsOverview) {
    const workouts = typeof workoutsData !== "undefined" ? workoutsData : [];
    const meals = typeof mealsData !== "undefined" ? mealsData : [];

    //Function to display Workouts into the Review page
    function displayLoggedWorkouts() {
      const container = document.getElementById("workoutList");
      if (!container) return;

      if (workouts.length === 0) {
        container.innerHTML = `<p class="no-data-message">No workouts logged yet. <a href="/log_workout">Log one now!</a></p>`;
        return;
      }

      container.innerHTML = "";
      workouts.sort((a, b) => b.id - a.id);

      workouts.forEach((workout) => {
        const workoutEl = document.createElement("div");
        workoutEl.classList.add("logged-item-container");
        workoutEl.dataset.id = workout.id;
        workoutEl.dataset.type = "workout";

        let detailsHtml = `
          <div class="stat-box minute-colour"><p>Duration</p><div class="data"><span class="stat-value">${
            workout.duration
          }</span><span class="unit">min</span></div></div>
          <div class="stat-box cals-colour"><p>Calories Burnt</p><div class="data"><span class="stat-value">${Math.round(
            workout.calories
          )}</span><span class="unit">kcal</span></div></div>
        `;
        if (workout.distance) {
          detailsHtml += `
            <div class="stat-box distance-colour"><p>Distance</p><div class="data"><span class="stat-value">${
              workout.distance
            }</span><span class="unit">km</span></div></div>
            <div class="stat-box pace-colour"><p>Pace</p><div class="data"><span class="stat-value">${formatPaceToMinSec(
              parseFloat(workout.pace)
            )}</span><span class="unit">min/km</span></div></div>
          `;
        }
        if (workout.intensity) {
          detailsHtml += `<div class="stat-box intensity-colour"><p>Intensity</p><span class="stat-value">${workout.intensity}</span></div>`;
        }

        const workoutDate = new Date(workout.id).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        workoutEl.innerHTML = `
          <div class="logged-item-header">
              <h3 class="review-headers">${workout.type}</h3>
              <div class="logged-item-header-right">
               <button type="button" class="remove-item-button">-</button>
               <span>${workoutDate}</span>
               </div>
          </div>
          <div class="stats-grid">${detailsHtml}</div>
        `;
        container.appendChild(workoutEl);
      });
    }

    //Function to display Meals into the Review page

    function displayLoggedMeals() {
      const container = document.getElementById("mealList");
      if (!container) return;

      if (meals.length === 0) {
        container.innerHTML = `<p class="no-data-message">No meals logged yet. <a href="/log_meal">Log one now!</a></p>`;
        return;
      }

      container.innerHTML = "";
      meals.sort((a, b) => b.id - a.id);

      meals.forEach((meal) => {
        const mealEl = document.createElement("div");
        mealEl.classList.add("logged-item-container");
        mealEl.dataset.id = meal.id;
        mealEl.dataset.type = "meal";

        const itemsHtml = meal.items
          .map(
            (item) => `
                <h4 class="review-headers"><button type="button" class="show-more-button">${item.name} &gt;</button></h4>
                <div class="stats-grid-meal">
                    <div class="stat-box amount-colour"><p>Amount</p><div class="data"><span class="stat-value">${item.amount}</span><span class="unit">g</span></div></div>
                    <div class="stat-box fat-colour"><p>Fat</p><div class="data"><span class="stat-value">${item.fat_total_g}</span><span class="unit">g</span></div></div>
                    <div class="stat-box fat-colour"><p>Saturated Fat</p><div class="data"><span class="stat-value">${item.fat_saturated_g}</span><span class="unit">g</span></div></div>
                    <div class="stat-box carbs-colour"><p>Carbs</p><div class="data"><span class="stat-value">${item.carbohydrates_total_g}</span><span class="unit">g</span></div></div>
                    <div class="stat-box carbs-colour"><p>Fiber</p><div class="data"><span class="stat-value">${item.fiber_g}</span><span class="unit">g</span></div></div>
                    <div class="stat-box carbs-colour"><p>Sugar</p><div class="data"><span class="stat-value">${item.sugar_g}</span><span class="unit">g</span></div></div>
                    <div class="stat-box micronutrients-colour"><p>Sodium</p><div class="data"><span class="stat-value">${item.sodium_mg}</span><span class="unit">mg</span></div></div>
                    <div class="stat-box micronutrients-colour"><p>Potassium</p><div class="data"><span class="stat-value">${item.potassium_mg}</span><span class="unit">mg</span></div></div>
                    <div class="stat-box micronutrients-colour"><p>Cholesterol</p><div class="data"><span class="stat-value">${item.cholesterol_mg}</span><span class="unit">mg</span></div></div>
                </div>
            `
          )
          .join("");

        mealEl.innerHTML = `
              <div class="logged-item-header">
                <h3 class="review-headers">${
                  meal.name.charAt(0).toUpperCase() + meal.name.slice(1)
                }</h3>
                <div class="logged-item-header-right">
                    <button type="button" class="remove-item-button">-</button>
                    <span>${meal.date}</span>
                </div>
              </div>
              <div class="stats-grid-meal">
                <div class="stat-box amount-colour"><p>Total Amount</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.amount
                }</span><span class="unit">g</span></div></div>
                <div class="stat-box fat-colour"><p>Total Fat</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.fat_total_g
                }</span><span class="unit">g</span></div></div>
                <div class="stat-box fat-colour"><p>Total Saturated Fat</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.fat_saturated_g
                }</span><span class="unit">g</span></div></div>
                <div class="stat-box carbs-colour"><p>Total Carbs</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.carbohydrates_total_g
                }</span><span class="unit">g</span></div></div>
                <div class="stat-box carbs-colour"><p>Total Fiber</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.fiber_g
                }</span><span class="unit">g</span></div></div>
                <div class="stat-box carbs-colour"><p>Total Sugar</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.sugar_g
                }</span><span class="unit">g</span></div></div>
                <div class="stat-box micronutrients-colour"><p>Total Sodium</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.sodium_mg
                }</span><span class="unit">mg</span></div></div>
                <div class="stat-box micronutrients-colour"><p>Total Potassium</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.potassium_mg
                }</span><span class="unit">mg</span></div></div>
                <div class="stat-box micronutrients-colour"><p>Total Cholesterol</p><div class="data"><span class="stat-value">${
                  meal.totalNutrients.cholesterol_mg
                }</span><span class="unit">mg</span></div></div>
              </div>
              <h4 class="review-headers"><button type="button" class="show-more-button">Show nutrients per item &gt;</button></h4>
              <div>${itemsHtml}</div>
            `;
        container.appendChild(mealEl);
      });
    }

    // Function to remove logged workout/meals

    async function handleRemoveItem(event) {
      const itemContainer = event.target.closest(".logged-item-container");
      if (!itemContainer) return;

      const itemId = parseInt(itemContainer.dataset.id, 10);
      const itemType = itemContainer.dataset.type;

      try {
        const response = await fetch("/delete_item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: itemId }),
        });
        const result = await response.json();
        if (result.success) {
          window.location.reload();
        } else {
          console.error("Failed to delete item:", result.message);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }

    document
      .getElementById("workoutList")
      .addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-item-button")) {
          handleRemoveItem(e);
        }
      });
    document.getElementById("mealList").addEventListener("click", function (e) {
      if (e.target.classList.contains("remove-item-button")) {
        handleRemoveItem(e);
      }
    });

    // Object to map the workout type with their 'prefix' id that will help for the logic

    const workoutTypeMapping = {
      Running: "runs",
      Walking: "walks",
      Cycling: "cycles",
      Rowing: "rowing",
      Swimming: "swims",
      Hiking: "hikes",
      Yoga: "yoga",
      Pilates: "pilates",
      HIIT: "hiits",
      "Strength Training": "strength",
    };

    const updateTextContent = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    // Function to calculate and display the appropriate overview for workouts

    function updateWorkoutStats(workouts) {
      if (!workouts || workouts.length === 0) {
        updateTextContent("total-workouts", 0);
        updateTextContent("total-calories-burned", 0);
        updateTextContent("total-workout-minutes", 0);
        updateTextContent("avg-calories-burned", 0);
        updateTextContent("avg-workout-minutes", 0);
        for (const type in workoutTypeMapping) {
          const prefix = workoutTypeMapping[type];
          updateTextContent(`total-${prefix}`, 0);
          updateTextContent(`avg-calories-burned-${prefix}`, 0);
          updateTextContent(`avg-${prefix}-minutes`, 0);
          updateTextContent(`avg-${prefix}-distance`, "0.0");
          updateTextContent(`avg-${prefix}-pace`, "--");
          const intensityId =
            type === "Strength Training"
              ? "avg-strenght-intensity"
              : `avg-${prefix}-intensity`;
          updateTextContent(intensityId, "N/A");
        }
        return;
      }

      // Calculate and display the average and total for the workouts overview if there's data

      const totalWorkouts = workouts.length;
      const totalCalories = workouts.reduce(
        (sum, w) => sum + parseFloat(w.calories || 0),
        0
      );
      const totalMinutes = workouts.reduce(
        (sum, w) => sum + parseFloat(w.duration || 0),
        0
      );
      const avgCalories = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0;
      const avgMinutes = totalWorkouts > 0 ? totalMinutes / totalWorkouts : 0;

      updateTextContent("total-workouts", totalWorkouts);
      updateTextContent("total-calories-burned", Math.round(totalCalories));
      updateTextContent("total-workout-minutes", Math.round(totalMinutes));
      updateTextContent("avg-calories-burned", Math.round(avgCalories));
      updateTextContent("avg-workout-minutes", Math.round(avgMinutes));

      // Object to store the data for the workout overview per workout type

      const statsByType = {};
      workouts.forEach((workout) => {
        const type = workout.type;
        if (!statsByType[type]) {
          statsByType[type] = {
            count: 0,
            totalCalories: 0,
            totalMinutes: 0,
            totalDistance: 0,
            totalPace: 0,
            totalIntensityNum: 0,
          };
        }
        const stats = statsByType[type];
        stats.count++;
        stats.totalCalories += parseFloat(workout.calories || 0);
        stats.totalMinutes += parseFloat(workout.duration || 0);
        if (workout.distance) {
          stats.totalDistance += parseFloat(workout.distance || 0);
          stats.totalPace += parseFloat(workout.pace || 0);
        }
        if (workout.intensity) {
          const intensityMap = { Low: 1, Medium: 2, High: 3 };
          stats.totalIntensityNum += intensityMap[workout.intensity] || 0;
        }
      });

      for (const type in workoutTypeMapping) {
        const prefix = workoutTypeMapping[type];
        const data = statsByType[type];

        if (data) {
          updateTextContent(`total-${prefix}`, data.count);
          updateTextContent(
            `avg-calories-burned-${prefix}`,
            Math.round(data.totalCalories / data.count)
          );
          updateTextContent(
            `avg-${prefix}-minutes`,
            Math.round(data.totalMinutes / data.count)
          );

          if (data.totalDistance > 0) {
            updateTextContent(
              `avg-${prefix}-distance`,
              (data.totalDistance / data.count).toFixed(1)
            );
            updateTextContent(
              `avg-${prefix}-pace`,
              formatPaceToMinSec(data.totalPace / data.count)
            );
          }
          if (data.totalIntensityNum > 0) {
            const intensityMapReverse = { 1: "Low", 2: "Medium", 3: "High" };
            const avgIntensityStr =
              intensityMapReverse[
                Math.round(data.totalIntensityNum / data.count)
              ];
            const intensityId =
              type === "Strength Training"
                ? "avg-strenght-intensity"
                : `avg-${prefix}-intensity`;
            updateTextContent(intensityId, avgIntensityStr);
          }
        } else {
          updateTextContent(`total-${prefix}`, 0);
          updateTextContent(`avg-calories-burned-${prefix}`, 0);
          updateTextContent(`avg-${prefix}-minutes`, 0);
          updateTextContent(`avg-${prefix}-distance`, "0.0");
          updateTextContent(`avg-${prefix}-pace`, "--");
          const intensityId =
            type === "Strength Training"
              ? "avg-strenght-intensity"
              : `avg-${prefix}-intensity`;
          updateTextContent(intensityId, "N/A");
        }
      }
    }

    // Function to calculate and display the appropriate overview for meals

    function updateMealStats(meals) {
      const updateNutrientText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value.toFixed(1);
      };

      // If all meals are removed reset the overview to zero

      if (!meals || meals.length === 0) {
        const allMealIds = [
          "logged-total",
          "logged-total-fat",
          "logged-total-saturated-fat",
          "logged-total-carbs",
          "logged-total-fiber",
          "logged-total-sugar",
          "logged-total-sodium",
          "logged-total-potassium",
          "logged-total-cholesterol",
          "avg-amount",
          "avg-fat",
          "avg-saturated-fat",
          "avg-carbs",
          "avg-fiber",
          "avg-sugar",
          "avg-sodium",
          "avg-potassium",
          "avg-cholesterol",
        ];
        allMealIds.forEach((id) => updateTextContent(id, "0.0"));
        return;
      }

      // Calculate and display the average and total nutrients for the meals overview

      const mealCount = meals.length;
      const totals = meals.reduce((acc, meal) => {
        const nutrients = meal.totalNutrients;
        for (const key in nutrients) {
          acc[key] = (acc[key] || 0) + parseFloat(nutrients[key] || 0);
        }
        return acc;
      }, {});

      updateNutrientText("logged-total", totals.amount || 0);
      updateNutrientText("logged-total-fat", totals.fat_total_g || 0);
      updateNutrientText(
        "logged-total-saturated-fat",
        totals.fat_saturated_g || 0
      );
      updateNutrientText(
        "logged-total-carbs",
        totals.carbohydrates_total_g || 0
      );
      updateNutrientText("logged-total-fiber", totals.fiber_g || 0);
      updateNutrientText("logged-total-sugar", totals.sugar_g || 0);
      updateNutrientText("logged-total-sodium", totals.sodium_mg || 0);
      updateNutrientText("logged-total-potassium", totals.potassium_mg || 0);
      updateNutrientText(
        "logged-total-cholesterol",
        totals.cholesterol_mg || 0
      );

      updateNutrientText("avg-amount", (totals.amount || 0) / mealCount);
      updateNutrientText("avg-fat", (totals.fat_total_g || 0) / mealCount);
      updateNutrientText(
        "avg-saturated-fat",
        (totals.fat_saturated_g || 0) / mealCount
      );
      updateNutrientText(
        "avg-carbs",
        (totals.carbohydrates_total_g || 0) / mealCount
      );
      updateNutrientText("avg-fiber", (totals.fiber_g || 0) / mealCount);
      updateNutrientText("avg-sugar", (totals.sugar_g || 0) / mealCount);
      updateNutrientText("avg-sodium", (totals.sodium_mg || 0) / mealCount);
      updateNutrientText(
        "avg-potassium",
        (totals.potassium_mg || 0) / mealCount
      );
      updateNutrientText(
        "avg-cholesterol",
        (totals.cholesterol_mg || 0) / mealCount
      );
    }

    // Main function to trigger all stats overview updates
    function updateStatsOverview() {
      updateWorkoutStats(workouts);
      updateMealStats(meals);
    }

    displayLoggedWorkouts();
    displayLoggedMeals();
    updateStatsOverview();

    // Hides all collapsible sections by default, then adds the click listener.
    document.querySelectorAll(".show-more-button").forEach((button) => {
      const content = button.parentElement.nextElementSibling;
      if (content) {
        content.classList.add("hidden");

        button.addEventListener("click", () => {
          const isNewlyHidden = content.classList.toggle("hidden");
          button.innerHTML = isNewlyHidden
            ? button.innerHTML.replace("v", "&gt;")
            : button.innerHTML.replace("&gt;", "v");
        });
      }
    });

    // Function to transform pace from decimal to 'readable' format

    function formatPaceToMinSec(decimalMinutes) {
      if (
        isNaN(decimalMinutes) ||
        decimalMinutes === null ||
        !isFinite(decimalMinutes)
      )
        return "--:--";
      const minutes = Math.floor(decimalMinutes);
      const seconds = Math.round((decimalMinutes - minutes) * 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
  }

  // Functions to work across mutliple pages
  // Function to clear form inputs for Log Workout, Log Meal and Contact form

  const resetFormButton = document.getElementById("resetForm");
  if (resetFormButton) {
    resetFormButton.addEventListener("click", () => {
      const form = resetFormButton.closest("form");
      if (form) form.reset();
      if (document.getElementById("workoutForm")) {
        document
          .getElementById("workoutType")
          .dispatchEvent(new Event("change"));
      }
      if (document.getElementById("mealForm")) {
        document.getElementById("nutritionTable").innerHTML = "";
        document.getElementById("nutritionTableContainer").style.display =
          "none";
        document.getElementById("logMealButton").style.display = "none";
      }
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      let nameEntered = document.getElementById("name").value.trim();
      if (nameEntered) {
        nameEntered =
          nameEntered.charAt(0).toUpperCase() + nameEntered.slice(1);
      }

      contactForm.style.display = "none";
      document.getElementById("formTitle").innerHTML = "<h2>Thank You!</h2>";
      document.getElementById(
        "formIntro"
      ).innerHTML = `<p>Thank you ${nameEntered} for sharing your thoughts!</p>`;
    });
  }

  // Authentification page
  // Referencing items
  const loginTab = document.getElementById("loginTab");
  const createAccountTab = document.getElementById("createAccountTab");
  const loginForm = document.getElementById("loginForm");
  const createAccountForm = document.getElementById("createAccountForm");

  // Function to switch between login and create account forms
  function formSwitcher() {
    loginTab.classList.toggle("active");
    createAccountTab.classList.toggle("active");
    loginForm.classList.toggle("hidden-form");
    createAccountForm.classList.toggle("hidden-form");
  }

  // Function to clear flash messages
  function clearFlashMessages() {
    const successMessages = document.querySelectorAll(".flash");
    successMessages.forEach((element) => {
      element.remove();
    });
  }

  // Add event listeners for the tab buttons to switch form, and hide message
  if (loginTab && createAccountTab) {
    loginTab.addEventListener("click", () => {
      formSwitcher();
      clearFlashMessages();
    });
    createAccountTab.addEventListener("click", () => {
      formSwitcher();
      clearFlashMessages();
    });
  }

  // Check the URL for a parameter to automatically switch to the Create Account form
  const urlParams = new URLSearchParams(window.location.search);
  const showRegisterForm = urlParams.get("show_register");

  if (showRegisterForm === "true") {
    if (loginForm.classList.contains("hidden-form") === false) {
      formSwitcher();
    }
  }

  // Account page
  // Referencing items
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const changeAccountInfoBtn = document.getElementById("changeAccountInfoBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");

  const passwordPopupForm = document.getElementById("popupPasswordForm");
  const accountInfoPopupForm = document.getElementById("accountInfoPopupForm");
  const logoutPopupForm = document.getElementById("logoutPopupForm");
  const deleteAccountPopupForm = document.getElementById(
    "deleteAccountPopupForm"
  );

  // A list of all pop-up forms
  const allpopupForms = [
    passwordPopupForm,
    accountInfoPopupForm,
    logoutPopupForm,
    deleteAccountPopupForm,
  ];

  // Function to show a popup form and prevent background scrolling
  function showPopupForm(popupForm) {
    if (popupForm) {
      popupForm.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  // Function to hide all popup forms and re-enable scrolling
  function hideAllPopupForms() {
    allpopupForms.forEach((popupForm) => {
      if (popupForm) {
        popupForm.style.display = "none";
      }
    });
    document.body.style.overflow = "auto";
  }

  // Event listeners to show the correct pop-up on button click
  changePasswordBtn.onclick = function () {
    showPopupForm(passwordPopupForm);
  };

  changeAccountInfoBtn.onclick = function () {
    showPopupForm(accountInfoPopupForm);
  };

  logoutBtn.onclick = function () {
    showPopupForm(logoutPopupForm);
  };

  deleteAccountBtn.onclick = function () {
    showPopupForm(deleteAccountPopupForm);
  };

  // Event listener for all close buttons to hide the pop-up
  const closeBtns = document.querySelectorAll(".close-button");
  closeBtns.forEach((btn) => {
    btn.onclick = function () {
      hideAllPopupForms();
      clearFlashMessages();
    };
  });

  // When the user clicks anywhere outside of a popup form, close it
  window.onclick = function (event) {
    if (event.target.classList.contains("popup-form")) {
      hideAllPopupForms();
      clearFlashMessages();
    }
  };

  // Check the URL for a parameter to automatically switch to the correct popup form
  const urlParamPopupForm = new URLSearchParams(window.location.search);
  const showForm = urlParamPopupForm.get("show_form");

  if (showForm) {
    switch (showForm) {
      case "password":
        showPopupForm(passwordPopupForm);
        break;
      case "account":
        showPopupForm(accountInfoPopupForm);
        break;
      case "logout":
        showPopupForm(logoutPopupForm);
        break;
      case "delete":
        showPopupForm(deleteAccountPopupForm);
        break;
    }
  }
});

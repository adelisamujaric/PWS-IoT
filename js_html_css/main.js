//Firebase inicijalizacija

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8zDvAOIhfeZtquCiZv34KojLggfFeMow",
  authDomain: "mypwsproject.firebaseapp.com",
  databaseURL: "https://mypwsproject-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mypwsproject",
  storageBucket: "mypwsproject.firebasestorage.app",
  messagingSenderId: "677986522609",
  appId: "1:677986522609:web:7740a27a5a78d7e93fa050",
  measurementId: "G-HCZ593YP65"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

const plantNames = ["Aglaonema", "Crassula", "Sansevieria", "Spathiphyllum"];

const plantSpecs = {
  "Aglaonema": { high: 800, medium: 600 },
  "Crassula": { high: 700, medium: 500 },
  "Sansevieria": { high: 900, medium: 700 },
  "Spathiphyllum": { high: 600, medium: 400 }
};

// Funkcija za ažuriranje stanja pumpe i datuma posljednjeg zalivanja
async function updatePumpState(plantName, state) {
  const plantRef = ref(database, `plants/${plantName}`);
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-GB');
  try {
    await update(plantRef, {
      pumpState: state,
      lastWatered: date.toISOString() 
    });
    document.getElementById(`${plantName}Date`).value = formattedDate;
  } catch (error) {
    console.error(`Error updating pump state for ${plantName}:`, error);
  }
}

// Funkcija za učitavanje datuma posljednjeg zalivanja iz Firebase
function loadLastWateredDate(plantName) {
  const plantRef = ref(database, `plants/${plantName}`);
  get(plantRef).then((snapshot) => {
    if (snapshot.exists()) {
      const lastWatered = snapshot.val().lastWatered;
      if (lastWatered) {
        const date = new Date(lastWatered);
        const formattedDate = date.toLocaleDateString('en-GB');
        document.getElementById(`${plantName}Date`).value = formattedDate;
      }
    } else {
      console.error(`No data available for ${plantName}`);
    }
  }).catch((error) => {
    console.error(`Error fetching last watered date for ${plantName}:`, error);
  });
}

// Dodavanje event listener-a za dugmad i učitavanje podataka za svaku biljku
plantNames.forEach(plantName => {
  const startButton = document.getElementById(`${plantName}Start`);
  const stopButton = document.getElementById(`${plantName}Stop`);

  startButton.addEventListener('click', () => {
    updatePumpState(plantName, 'ON');
    startButton.style.backgroundColor = "lightgreen"; 
    setTimeout(() => { startButton.style.backgroundColor = ""; }, 100);
  });
  
  stopButton.addEventListener('click', () => {
    updatePumpState(plantName, 'OFF');
    stopButton.style.backgroundColor = "lightcoral"; 
    setTimeout(() => { stopButton.style.backgroundColor = ""; }, 100);
  });
  

  loadLastWateredDate(plantName); 

});


// Funkcija za ažuriranje UI-a biljke
function updatePlantUI(plantName, moistureLevel) {
  document.getElementById(`${plantName}Percent`).value = moistureLevel;
  const circle = document.getElementById(`${plantName}Circle`);
  const specs = plantSpecs[plantName];
  if (moistureLevel >= specs.high) {
    circle.style.backgroundColor = "red";
  } else if (moistureLevel >= specs.medium && moistureLevel < specs.high) {
    circle.style.backgroundColor = "orange";
  } else {
    circle.style.backgroundColor = "green";
  }
}

// Periodično ažuriranje UI-a
setInterval(() => {
  plantNames.forEach(plantName => {
    const plantRef = ref(database, `plants/${plantName}`);
    get(plantRef).then((snapshot) => {
      if (snapshot.exists()) {
        const moistureLevel = snapshot.val().moistureLevel;
        updatePlantUI(plantName, moistureLevel);
      } else {
        console.error(`No data available for ${plantName}`);
      }
    }).catch((error) => {
      console.error(`Error fetching moisture level for ${plantName}:`, error);
    });
  });
}, 1000);
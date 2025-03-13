Plant Watering System  

This was my third-year project for the Design and Development of IoT Projects course. 
Before this, I had no experience with IoT, but I put in the effort, and it turned out that I did a pretty good job (I got an A).

Plant Watering System is a smart irrigation system that allows users to monitor soil moisture levels and remotely activate a water pump via a web application.
The project is designed as a simple yet functional IoT solution using:  
- Web application (HTML, CSS, JavaScript) – user interface  
- Firebase – server for data storage and synchronization  
- NodeMCU ESP8266 – execution unit  

The system enables real-time monitoring of soil moisture through a visual indicator and a numerical value:  
Green– Sufficient moisture  
Yellow – Needs watering soon  
Red – Dry soil, needs immediate watering  

So how it works?  
1️.Monitoring moisture – The sensor continuously updates the soil moisture level in real time.  
2️.Watering – The user clicks the "start" button to activate the water pump.  
3️.Firebase synchronization – NodeMCU listens for changes in Firebase and turns on the pump when the status is set to "ON".  
4️.Data logging – After watering, the app records the last watering date.  
 
Technologies I used in this project: 
- Arduino C++ (NodeMCU ESP8266)  
- JavaScript, HTML, CSS (frontend)  
- Firebase (database and real-time synchronization)  

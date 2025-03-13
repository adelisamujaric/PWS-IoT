#include <Arduino.h>
#if defined(ESP32)
  #include <WiFi.h>
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "adelisa"
#define WIFI_PASSWORD "adelisa123"
#define API_KEY "AIzaSyA8zDvAOIhfeZtquCiZv34KojLggfFeMow" 
#define DATABASE_URL "mypwsproject-default-rtdb.europe-west1.firebasedatabase.app" 

const int pinA = D5;
const int pinB = D6;
const int pinC = D7;

const int analogPin = A0;
const String plantNames[] = {"Aglaonema", "Crassula", "Sansevieria", "Spathiphyllum"};
const int relayPins[] = {D1, D2, D3, D4}; 
String lastPumpStates[4];

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false; 

void listenToFirebase(int channel);
void selectChannel(int channel);

void setup() {
  Serial.begin(115200);
  
  for (int i = 0; i < 4; i++) {
    pinMode(relayPins[i], OUTPUT);
  }

  pinMode(pinA, OUTPUT);
  pinMode(pinB, OUTPUT);
  pinMode(pinC, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback; 
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 1000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    for (int channel = 0; channel < 4; channel++) {
      selectChannel(channel);
      int sensorValue = analogRead(analogPin);

      String path = "plants/" + plantNames[channel] + "/moistureLevel";
      if (Firebase.RTDB.setInt(&fbdo, path.c_str(), sensorValue)) {
        Serial.println("Sensor data sent (moisture) for " + plantNames[channel] + ":");
        Serial.println(sensorValue);
      } else {
        Serial.println("Error sending sensor data (moisture) for " + plantNames[channel] + ":");
        Serial.println(fbdo.errorReason());
      }

      listenToFirebase(channel);
    }
  }
  delay(1000); 
}

void listenToFirebase(int channel) {
  String path = "plants/" + plantNames[channel] + "/pumpState";
  if (Firebase.RTDB.getString(&fbdo, path.c_str())) {
    String pumpState = fbdo.to<String>();

    if (pumpState != lastPumpStates[channel]) {
      lastPumpStates[channel] = pumpState;

      if (pumpState == "ON") {
        digitalWrite(relayPins[channel], HIGH); 
        Serial.println("Pump ON for " + plantNames[channel]);
      } else if (pumpState == "OFF") {
        digitalWrite(relayPins[channel], LOW); 
        Serial.println("Pump OFF for " + plantNames[channel]);
      }
    }
  } else {
    Serial.println("Error reading pumpState for " + plantNames[channel] + ": " + fbdo.errorReason());
  }
}

void selectChannel(int channel) {
  digitalWrite(pinA, bitRead(channel, 0));
  digitalWrite(pinB, bitRead(channel, 1));
  digitalWrite(pinC, bitRead(channel, 2));
}

/*
This code is to send MQ135 output to Serial Monitor
----------
Board: Arduino UNO
=========================
Refer to MQ135 datasheet and examples
==========================
---------------
Version: 2.0
Updated on 13 May 2024
by Nicolas Traut, Roberto Toro & Rajeev Mylapalli
*/ 

int sensorValue;
int digitalValue;
float slope = 1.0;    // Adjust the slope based on calibration
int intercept = 0;    // Adjust the intercept based on calibration

void setup()
{
  Serial.begin(9600); // sets the serial port to 9600
  pinMode(13, OUTPUT);
  pinMode(2, INPUT);
}

void loop()
{
  sensorValue = analogRead(0); // read analog input pin 0
  digitalValue = digitalRead(2);

  // You can adjust the slope and intercept based on calibration
  float gasConcentration = (sensorValue - intercept) / slope;

  if (gasConcentration > 400)
  {
    digitalWrite(13, HIGH);
  }
  else
    digitalWrite(13, LOW);

  
  Serial.print("<data>");
  Serial.print(sensorValue, DEC);
  Serial.println("</data>");
  delay(10000); 
}
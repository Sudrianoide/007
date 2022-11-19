#include <Servo.h>
#include "pitches.h"

Servo servo1;
Servo servo2;
Servo servo3;
int buzzerPin = 7;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  servo1.attach(9);   // 3 Coude
  servo2.attach(10);  // 4 Épaule
  servo3.attach(11);  // 6 Haut
  Serial.begin(9600);
  Serial.println("Ready");
  base();
}

void loop() {
  if (Serial.available()) {
    process(Serial.read());
    Serial.readString();
  }
}

void process(char inChar) {
  switch (toUpperCase(inChar)) {
    case '0':
      base();
      break;
    case 'T':
      tire();
      break;
    case 'C':
      charge();
      break;
    case 'B':
      bouclier();
      break;
    case 'L':
      lose();
      break;
    case 'W':
      win();
      break;
    case 'D':
      demo();
      break;
    default:
      error();
      break;
  }
}
void base() {
  servo2.write(150);
  servo1.write(90);
  servo3.write(24);
  success();
}

void tire() {
  servo1.write(35);
  servo3.write(24);
  servo2.write(90);
  //success();
}

void bouclier() {
  servo1.write(100);
  servo2.write(90);
  servo3.write(69);
  //success();
}

void charge() {
  servo1.write(120);
  servo2.write(90);
  servo3.write(24);
  //success();
}

void demo() {
  while (!Serial.available()) {     
    tire();
    delay(1000);
    charge();
    delay(1000);
    bouclier();
    delay(1000);
    base();
    delay(1000);
  }
}

void success() {
  Serial.println("OK");
  int melody[] = {
    NOTE_F4, NOTE_F4
  };
  int noteDurations[] = {
    8, 2
  };
  for (int thisNote = 0; thisNote < 2; thisNote++) {
    int noteDuration = 1000 / noteDurations[thisNote];
    tone(buzzerPin, melody[thisNote], noteDuration);
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(buzzerPin);
  }
}
void error() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("Error");
  digitalWrite(LED_BUILTIN, LOW);
  int melody[] = {
    NOTE_F4, NOTE_C4
  };
  int noteDurations[] = {
    4, 8
  };
  for (int thisNote = 0; thisNote < 2; thisNote++) {
    int noteDuration = 1000 / noteDurations[thisNote];
    tone(buzzerPin, melody[thisNote], noteDuration);
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(buzzerPin);
  }
  noTone(buzzerPin);
}
void win() {
  // success();
  int melody[] = {
    NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4, NOTE_G4, 0, NOTE_E4, NOTE_F4
  };
  int noteDurations[] = {
    4, 8, 8, 4, 4, 4, 4, 2
  };
  for (int thisNote = 0; thisNote < 8; thisNote++) {
    int noteDuration = 1000 / noteDurations[thisNote];
    tone(buzzerPin, melody[thisNote], noteDuration);
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(buzzerPin);
  }
  noTone(buzzerPin);
}
void lose() {
  // success();
  int melody[] = {
    NOTE_F4, NOTE_E4, NOTE_DS4, NOTE_D4, NOTE_D4, NOTE_D4, NOTE_D4, NOTE_D4
  };
  int noteDurations[] = {
    2, 2, 2, 8, 8, 8, 8, 1
  };
  for (int thisNote = 0; thisNote < 8; thisNote++) {
    int noteDuration = 1000 / noteDurations[thisNote];
    tone(buzzerPin, melody[thisNote], noteDuration);
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(buzzerPin);
  }
  noTone(buzzerPin);
}
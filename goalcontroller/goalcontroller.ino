const int BUZ_PIN = 4;
const int LDR_1_PIN = A0;
const int LDR_2_PIN = A6;
const int COOLDOWN_TIME = 30;

void setup()
{
  pinMode(BUZ_PIN, OUTPUT);
  Serial.begin(9600);
}

int cooldown = COOLDOWN_TIME;
float prevVal1 = 0;
float prevVal2 = 0;

void loop()
{
  float val1 = analogRead(LDR_1_PIN);
  float valDiff1 = prevVal1 - val1;
  if (valDiff1 > 30 && cooldown == COOLDOWN_TIME && prevVal1 > 650) {
    goal(1);
  }
  float val2 = analogRead(LDR_2_PIN);
  float valDiff2 = prevVal2 - val2;
  if (valDiff2 > 30 && cooldown == COOLDOWN_TIME && prevVal2 > 650) {
    goal(2);
  }
  if (cooldown > 0 && cooldown != COOLDOWN_TIME){
    cooldown--;
  } else if (cooldown == 0) {
    cooldown = COOLDOWN_TIME;
  }
  prevVal1 = val1;
  prevVal2 = val2;
  delay(100);
}

void goal(int goalId){
  Serial.println(goalId);
  tone(BUZ_PIN, 1000);
  delay(150);
  noTone(BUZ_PIN);
  cooldown--;
}

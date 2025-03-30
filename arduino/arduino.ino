// #include <SoftwareSerial.h>  //comunicação serial 2
// #include <Ultrasonic.h>      //modulo medida distancia

// SoftwareSerial Serial2(2, 3);  // RX, TX

//variaveis de tempo
unsigned long currentTime = 0;
unsigned long requestTime = 0;
unsigned long requestRele = 0;

//variaveis requisição RS485 idp90
uint8_t data[9] = { 0x01, 0x03, 0x04, 0x00, 0x22, 0x00, 0x00, 0x5A, 0x39 };
int data_index = 0;

//variaveis do sonar
// float cmMsec;
// float soma = 0;
// int i = 0;
// float media = 0;
// #define trigPin 6
// #define echoPin 7
// Ultrasonic ultrasonic(pino_trigger, pino_echo);

int calcDistancia();
const int trigPin = 6;
const int echoPin = 7;
uint32_t tempo;
int distancia;

//variaveis gerais
int iniciar = 0;
int peso = 0;
int medir = 0;

String comando;





void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
  Serial2.begin(9600);
  pinMode(4,OUTPUT);
  pinMode(5,OUTPUT);
  digitalWrite(4,HIGH);//Desligar o rele pois esse modulo trabalha invertido (liga com LOW e desliga com HIGH)
  digitalWrite(5,HIGH);//Desligar o rele pois esse modulo trabalha invertido (liga com LOW e desliga com HIGH)
}

void loop() {
  if (Serial.available())  //se byte pronto para leitura
  {
    comando = Serial.readString();
    comando.trim();

    if (comando == "I;") {
      // iniciar balança
      digitalWrite(5, LOW);  // Ligar relé balança
      iniciar = 1;
    } else if (comando == "M;") {
      // solicita medida silo
      medir = 1;
      medirSilo();
    } else {
      // recebe peso
      peso = comando.toInt();
    }
  }
  if (iniciar == 1 && peso != 0) {
    balancaIDP90();
  }
}


uint16_t calculaCRC16(uint8_t *data, uint8_t length) {
  uint16_t crc = 0xFFFF;  // Valor inicial
  for (uint8_t i = 0; i < length; i++) {
    crc ^= data[i];
    for (uint8_t j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

void balancaIDP90() {
  currentTime = millis();
  if (currentTime - requestTime > 500) {
    requestTime = currentTime;
    Serial2.write((byte)0x01);
    Serial2.write((byte)0x03);
    Serial2.write((byte)0x00);
    Serial2.write((byte)0x00);
    Serial2.write((byte)0x00);
    Serial2.write((byte)0x02);
    Serial2.write((byte)0xC4);
    Serial2.write((byte)0x0B);
  }
  if (Serial2.available()) {
    comandoMotor(1);  // ligar motor
    byte receivedByte = Serial2.read();
    if (receivedByte == 0x01) { data_index = 0; }
    data[data_index] = receivedByte;
    data_index++;
    if (data_index == 9) {
      uint16_t crc_calculado = calculaCRC16(data, 7);
      uint16_t crc_recebido = (data[8] << 8) | data[7];
      if (crc_calculado == crc_recebido) {
        uint8_t valor = data[4];
        float resultado = valor / 10.0;
        // Serial.println(resultado);
        if (resultado >= peso) {
          comandoMotor(0);
          //carga finalizada
        }
      }
    }
  }
}

void comandoMotor(int comandoMotor) {
  if (comandoMotor == 1) {
    iniciar = 1;
    digitalWrite(4,LOW);  // Ligar relé motor
  } else {
    Serial.print("c:0");
    iniciar = 0;
    peso = 0;
    digitalWrite(4, HIGH);  // Desligar relé motor
    if (millis() - requestRele > 3000) {
      digitalWrite(5,HIGH);  // Desligar relé balança
    }
  }
}

int calcDistancia() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  tempo = pulseIn(echoPin, HIGH);
  distancia = tempo * 0.034 / 2;
  return distancia;
}

void medirSilo() {
  if (medir == 1) {
    distancia = calcDistancia();
    Serial.print("m:");
    Serial.println(distancia);
    // long microsec = ultrasonic.timing();
    // cmMsec = ultrasonic.convert(microsec, Ultrasonic::CM);
    // Serial.print("m:");
    // Serial.print(cmMsec);
    medir = 0;
  }
}
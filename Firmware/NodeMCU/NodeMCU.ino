#include "NodeMCU.h"
#include "MyI2C.h"
//#include "MyWiFi.h"
#include "MyMPU6050.h"

void setup() {
  Serial.begin(115200);
  delay(10);

//  init_WiFi();
  
  Wire.begin(sda, scl);
  MPU6050_Init();
}

void loop() {
  t_last = t_now;
  t_now = millis();
  
  read_MPU6050();
  mpu_conversion_process();

/*
  sprintf(bffer,"%i %.1f %.1f %.1f %.1f %.1f %.1f %.0f %.0f %.0f", 
    ticks, 
    AccelX, AccelY, AccelZ, 
    Gx, Gy, Gz, 
    x_ang, y_ang, z_ang    
  );     
  //sprintf(bffer,"%i %.1f %.1f %.1f %.1f %.1f %.1f", ticks, Ax, Ay, Az, Gx, Gy, Gz); 
  Serial.println(bffer);
  */
  Serial.print(ticks); Serial.print(" " );
  Serial.print(AccelX); Serial.print(" " );
  Serial.print(AccelY); Serial.print(" " );
  Serial.print(AccelZ); Serial.print(" " );
  Serial.print(Gx); Serial.print(" " );
  Serial.print(Gy); Serial.print(" " );
  Serial.print(Gz); Serial.print(" " );
  Serial.print(x_ang); Serial.print(" " );
  Serial.print(y_ang); Serial.print(" " );
  Serial.println(z_ang);

/*  
  udp.beginPacket(broadcastIp, udpPort);
  udp.print(bffer);
  udp.endPacket();
*/  

  ticks ++;
  delay(10);
}


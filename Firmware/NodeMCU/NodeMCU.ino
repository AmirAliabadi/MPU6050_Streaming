#include <CircularBuffer.h>

#include "NodeMCU.h"
#include "MyI2C.h"
#include "MyWiFi.h"
#include "MyMPU6050.h"

void setup() {
  Serial.begin(115200);
  delay(10);

  init_WiFi();
  
  Wire.begin(sda, scl);
  MPU6050_Init();
}

CircularBuffer<float,100> acc_buffer[3];
CircularBuffer<float,100> gyro_buffer[3];

void loop() {
  t_last = t_now;
  t_now = millis();
  
  read_MPU6050();
  mpu_conversion_process();

  for(int i=0; i<3; i++ ) {
    acc_buffer[i].push( i==0?Ax:i==1?Ay:Az );
    gyro_buffer[i].push( i==0?Gx:i==1?Gy:Gz );    
  }
  
  float foo[2][3] = {{0.0,0.0,0.0},{0.0,0.0,0.0}};

  for(int i=0; i<3; i++ ) {
    for(int j=0; j<acc_buffer[i].size(); j++ ) {
      foo[0][i] += acc_buffer[i][j];
    }
    foo[0][i] = foo[0][i]/(acc_buffer[i].size()*1.0);
  }
  
  for(int i=0; i<3; i++ ) {
    for(int j=0; j<gyro_buffer[i].size(); j++ ) {
      foo[1][i] += gyro_buffer[i][j];
    }
    foo[1][i] = foo[1][i]/(gyro_buffer[i].size()*1.0);
  }

  sprintf(bffer,"%i %.1f %.1f %.1f %.1f %.1f %.1f %.0f %.0f %.0f %.1f %.1f %.1f %.1f %.1f %.1f", 
    ticks, 
    Ax, Ay, Az, 
    Gx, Gy, Gz, 
    x_ang, y_ang, z_ang, 
    foo[0][0], foo[0][1], foo[0][2],
    foo[1][0], foo[1][1], foo[1][2]    
    ); 
  //sprintf(bffer,"%i %.1f %.1f %.1f %.1f %.1f %.1f", ticks, Ax, Ay, Az, Gx, Gy, Gz); 
  //Serial.println(bffer);
  
  udp.beginPacket(broadcastIp, udpPort);
  udp.print(bffer);
  udp.endPacket();

  ticks ++;
  delay(10);
}


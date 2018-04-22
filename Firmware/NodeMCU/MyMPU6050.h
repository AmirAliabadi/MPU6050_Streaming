// MPU6050 Slave Device Address
const uint8_t MPU6050SlaveAddress = 0x68;

// sensitivity scale factor respective to full scale setting provided in datasheet 
const float AccelScaleFactor = 16384.0;
const float GyroScaleFactor = 131.0;

// MPU6050 few configuration register addresses
const uint8_t MPU6050_REGISTER_SMPLRT_DIV   =  0x19;
const uint8_t MPU6050_REGISTER_USER_CTRL    =  0x6A;
const uint8_t MPU6050_REGISTER_PWR_MGMT_1   =  0x6B;
const uint8_t MPU6050_REGISTER_PWR_MGMT_2   =  0x6C;
const uint8_t MPU6050_REGISTER_CONFIG       =  0x1A;
const uint8_t MPU6050_REGISTER_GYRO_CONFIG  =  0x1B;
const uint8_t MPU6050_REGISTER_ACCEL_CONFIG =  0x1C;
const uint8_t MPU6050_REGISTER_FIFO_EN      =  0x23;
const uint8_t MPU6050_REGISTER_INT_ENABLE   =  0x38;
const uint8_t MPU6050_REGISTER_ACCEL_XOUT_H =  0x3B;
const uint8_t MPU6050_REGISTER_SIGNAL_PATH_RESET  = 0x68;

double Ax, Ay, Az, T, Gx, Gy, Gz;
int16_t AccelX, AccelY, AccelZ, Temperature, GyroX, GyroY, GyroZ;

//#define RAD_TO_DEG 57.2958 ;
float x_angle;
float y_angle;
float pitch_angle;
float roll_angle;


double x_ang = 0.0;
double y_ang = 0.0;
double z_ang = 0.0;

int minVal=265;
int maxVal=402;

//configure MPU6050
void MPU6050_Init(){  
  
  delay(150);
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_SMPLRT_DIV, 0x07);
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_PWR_MGMT_1, 0x01);
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_PWR_MGMT_2, 0x00);
  
  //I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_CONFIG, 0x00);
  // LPF:
  /* 
    0 = 260 Hz, 0 ms / 256 Hz, 0.98 ms, 8 kHz
    1 = 184 Hz, 2.0 ms / 188 Hz, 1.9 ms, 1 kHz
    2 = 94 Hz, 3.0 ms / 98 Hz, 2.8 1 ms, kHz
    3 = 44 Hz, 4.9 ms / 42 Hz, 4.8 1 ms, kHz
    4 = 21 Hz, 8.5 ms / 20 Hz, 8.3 1 ms, kHz
    5 = 10 Hz, 13.8 ms / 10 Hz, 13.4 ms, 1 kHz
    6 = 5 Hz, 19.0 ms / 5 Hz, 18.6 1 ms, kHz
    7 = RESERVED / RESERVED, 8 kHz 
  */
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_CONFIG, 0x06);
  
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_GYRO_CONFIG,  0x00); // set +/-250 degree/second full scale
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_ACCEL_CONFIG, 0x00); // set +/- 2g full scale

  //I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_GYRO_CONFIG,  B00011000);   // set +/- 2000 degree/second full scale
  //I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_ACCEL_CONFIG, B00011000); // set +/- 16g full scale

  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_FIFO_EN, 0x00);
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_INT_ENABLE, 0x01);
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_SIGNAL_PATH_RESET, 0x00);
  I2C_Write(MPU6050SlaveAddress, MPU6050_REGISTER_USER_CTRL, 0x00);
}

// read all 14 register
void Read_RawValue(uint8_t deviceAddress, uint8_t regAddress){
  Wire.beginTransmission(deviceAddress);
  Wire.write(regAddress);
  Wire.endTransmission();
  Wire.requestFrom(deviceAddress, (uint8_t)14);
  AccelX = (((int16_t)Wire.read()<<8) | Wire.read());
  AccelY = (((int16_t)Wire.read()<<8) | Wire.read());
  AccelZ = (((int16_t)Wire.read()<<8) | Wire.read());
  Temperature = (((int16_t)Wire.read()<<8) | Wire.read());
  GyroX = (((int16_t)Wire.read()<<8) | Wire.read());
  GyroY = (((int16_t)Wire.read()<<8) | Wire.read());
  GyroZ = (((int16_t)Wire.read()<<8) | Wire.read());
}


void read_MPU6050() {  
  Read_RawValue(MPU6050SlaveAddress, MPU6050_REGISTER_ACCEL_XOUT_H);

  int xAng = map(AccelX,minVal,maxVal,-90,90);
  int yAng = map(AccelY,minVal,maxVal,-90,90);
  int zAng = map(AccelZ,minVal,maxVal,-90,90);
  
  x_ang= RAD_TO_DEG * (atan2(-yAng, -zAng)+PI);
  y_ang= RAD_TO_DEG * (atan2(-xAng, -zAng)+PI);
  z_ang= RAD_TO_DEG * (atan2(-yAng, -xAng)+PI);  
  
  //divide each with their sensitivity scale factor
  Ax = (double)AccelX/AccelScaleFactor;
  Ay = (double)AccelY/AccelScaleFactor;
  Az = (double)AccelZ/AccelScaleFactor;
  T = (double)Temperature/340+36.53; //temperature formula
  Gx = (double)GyroX/GyroScaleFactor;
  Gy = (double)GyroY/GyroScaleFactor;
  Gz = (double)GyroZ/GyroScaleFactor;
}


void mpu_conversion_process() {

  x_angle = atan(  Ay / sqrt( (Ax * Ax) + (Az * Az) ) ) * RAD_TO_DEG;
  y_angle = atan( -Ax / sqrt( (Ay * Ay) + (Az * Az) ) ) * RAD_TO_DEG;

  //x_angle = 57.295*atan((float) accl_read[1]/ sqrt(pow((float)accl_read[2],2)+pow((float)accl_read[0],2)));
  //y_angle = 57.295*atan((float)-accl_read[0]/ sqrt(pow((float)accl_read[2],2)+pow((float)accl_read[1],2))); 

  /// ------------------------------------------------------------------------------------------
  /// use a comlementary filter to compute a more reliable x/y angle by using gyro data + accel data
  float dt = t_now - t_last;
  pitch_angle = 0.93 * (pitch_angle + Gx * dt) + 0.07 * x_angle ; //* accel_x_inverse; // Calculate the pitch_angle using a complementary filter
  roll_angle  = 0.93 * (roll_angle  + Gy * dt) + 0.07 * y_angle ;// * accel_y_inverse; 
}



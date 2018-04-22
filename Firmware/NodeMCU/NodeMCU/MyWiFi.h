#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
 
const char* ssid = "aliabadi";
const char* password = "sunsetsockeye";
 
//WiFiServer server(80);

WiFiUDP udp;  // A UDP instance to let us send and receive packets over UDP
unsigned int udpPort = 2311; // local port to listen for UDP packets
IPAddress broadcastIp ;

void init_WiFi() {
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  broadcastIp = WiFi.localIP();
  broadcastIp[3] = 255;
 
  // Start the server
  // server.begin();
  udp.begin(udpPort);

  //Serial.print("Server started : ");
  Serial.print("IP Address is : ");
  Serial.println(WiFi.localIP());
  Serial.print("UDP Broadcast on : ");
  Serial.println(broadcastIp);
 
  // Print the IP address
  //Serial.print("Use this URL to connect: ");
  //Serial.print("http://");
  //Serial.print(WiFi.localIP());
  //Serial.println("/");
}


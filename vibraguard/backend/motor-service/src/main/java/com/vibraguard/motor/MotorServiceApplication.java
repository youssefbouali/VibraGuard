package com.vibraguard.motor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
//@EnableKafka
public class MotorServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MotorServiceApplication.class, args);
    }
}

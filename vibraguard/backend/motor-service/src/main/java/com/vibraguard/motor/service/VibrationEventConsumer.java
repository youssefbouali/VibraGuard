//package com.vibraguard.motor.service;
//
//import com.vibraguard.motor.entity.VibrationData;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Service;
//
//@Service
//public class VibrationEventConsumer {
//
//    private final VibrationStreamService vibrationStreamService;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    public VibrationEventConsumer(VibrationStreamService vibrationStreamService) {
//        this.vibrationStreamService = vibrationStreamService;
//    }
//
//    @KafkaListener(topics = "${vibration.events.topic:vibration-events}", groupId = "motor-service-ws")
//    public void onVibrationEvent(String message) {
//        try {
//            VibrationData data = objectMapper.readValue(message, VibrationData.class);
//            vibrationStreamService.emit(data);
//        } catch (Exception e) {
//            System.err.println("Error processing vibration event: " + e.getMessage());
//        }
//    }
//}

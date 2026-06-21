package com.vibraguard.motor.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "vibration_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VibrationData {
    @Id
    private String id;
    @Field("motor_id")
    private String motorId;
    @Field("vibration_time")
    private String time;
    private double vibRms;
    private double vibPeak;
    private double vibKurtosis;
    private double temperature;
    private double currentRms;
    private boolean isAnomalous;
}

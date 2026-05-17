package com.vibraguard.gateway.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(indexName = "vibrations", createIndex = false)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VibrationSearchData {
    @Id
    private String id;
    
    @Field(type = FieldType.Keyword)
    private String motorId;
    
    @Field(type = FieldType.Keyword)
    private String time;
    
    @Field(type = FieldType.Double)
    private double vibRms;
    
    @Field(type = FieldType.Double)
    private double vibPeak;
    
    private double vibKurtosis;
    private double temperature;
    private boolean isAnomalous;
}

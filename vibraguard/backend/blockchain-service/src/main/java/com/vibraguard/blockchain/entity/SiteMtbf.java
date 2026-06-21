package com.vibraguard.blockchain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "SITE_MTBF")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteMtbf {
    @Id
    private String name;
    @jakarta.persistence.Column(name = "SITE_MTBF_VALUE")
    private int value;
    private String color;
}

package com.vibraguard.gateway.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "REPORTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    private String id;
    private String title;
    private String type; // pdf, excel
    private String frequency; // quotidien, hebdomadaire, mensuel
    private String ipfsHash;
    private String createdBy;
    private String createdByEmail;
    private Long createdAt;
    private String shareLink;
    private boolean isPublic;
    private int downloadCount;
    private String status; // generated, uploading, stored
}

package com.vibraguard.blockchain.entity;

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
    private String type;
    private String frequency;
    private String ipfsHash;
    private String blockchainTxHash;
    private String createdBy;
    private String createdByEmail;
    private Long createdAt;
    private String shareLink;
    private boolean isPublic;
    private int downloadCount;
    private String status;
}

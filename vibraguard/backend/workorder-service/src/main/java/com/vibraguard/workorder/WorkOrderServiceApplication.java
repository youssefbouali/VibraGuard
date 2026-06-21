package com.vibraguard.workorder;

import com.vibraguard.workorder.entity.Technician;
import com.vibraguard.workorder.repository.TechnicianRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorkOrderServiceApplication {

    @Autowired
    private TechnicianRepository technicianRepository;

    public static void main(String[] args) {
        SpringApplication.run(WorkOrderServiceApplication.class, args);
    }

    @PostConstruct
    public void seedTechnicians() {
        if (technicianRepository.count() == 0) {
            technicianRepository.save(new Technician("TECH-4892", "Youssef Bouali", "mr.boualiyoussef@gmail.com", "Maintenance Prédictive", "Admin", "Actif", "+212 6 00 11 22 33", null, null));
        }
    }
}

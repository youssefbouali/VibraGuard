package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.*;
import com.vibraguard.gateway.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    @Autowired
    private MotorRepository motorRepository;
    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    public Mono<Map<String, Object>> search(@RequestParam("q") String query) {
        return Mono.fromCallable(() -> {
            String q = query.toLowerCase();
            Map<String, Object> results = new HashMap<>();

            List<Motor> motors = motorRepository.findAll().stream()
                    .filter(m -> m.getId().toLowerCase().contains(q) || (m.getSite() != null && m.getSite().toLowerCase().contains(q)))
                    .limit(5)
                    .collect(Collectors.toList());

            List<Alert> alerts = alertRepository.findAll().stream()
                    .filter(a -> a.getMessage() != null && a.getMessage().toLowerCase().contains(q))
                    .limit(5)
                    .collect(Collectors.toList());

            results.put("motors", motors);
            results.put("alerts", alerts);
            return results;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}

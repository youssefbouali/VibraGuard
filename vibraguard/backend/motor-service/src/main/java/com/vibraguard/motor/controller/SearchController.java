package com.vibraguard.motor.controller;

import com.vibraguard.motor.entity.*;
import com.vibraguard.motor.repository.MotorRepository;
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

    @GetMapping
    public Mono<Map<String, Object>> search(@RequestParam("q") String query) {
        return Mono.fromCallable(() -> {
            String q = query.toLowerCase();
            Map<String, Object> results = new HashMap<>();

            List<Motor> motors = motorRepository.findAll().stream()
                    .filter(m -> m.getId().toLowerCase().contains(q) || (m.getSite() != null && m.getSite().toLowerCase().contains(q)))
                    .limit(5)
                    .collect(Collectors.toList());

            results.put("motors", motors);
            results.put("alerts", new ArrayList<>());
            return results;
        }).subscribeOn(Schedulers.boundedElastic());
    }
}

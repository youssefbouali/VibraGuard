package com.vibraguard.gateway.controller;

import com.vibraguard.gateway.entity.InventoryPart;
import com.vibraguard.gateway.repository.InventoryPartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/v1/iot/inventory-parts")
public class InventoryController {

    @Autowired
    private InventoryPartRepository inventoryPartRepository;

    @GetMapping
    public Flux<InventoryPart> getInventoryParts() {
        return Flux.defer(() -> Flux.fromIterable(inventoryPartRepository.findAll()))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping
    public Mono<InventoryPart> createInventoryPart(@RequestBody InventoryPart part) {
        return Mono.fromCallable(() -> {
            if (part.getId() == null) {
                part.setId("PRT-" + (inventoryPartRepository.count() + 100));
            }
            return inventoryPartRepository.save(part);
        }).subscribeOn(Schedulers.boundedElastic());
    }
}

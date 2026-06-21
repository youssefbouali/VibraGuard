package com.vibraguard.motor;

import com.vibraguard.motor.service.VibrationStreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;

@Component
public class VibrationWebSocketHandler implements WebSocketHandler {

    @Autowired
    private VibrationStreamService vibrationStreamService;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.send(
            vibrationStreamService.getVibrationStream()
                .map(session::textMessage)
        );
    }
}

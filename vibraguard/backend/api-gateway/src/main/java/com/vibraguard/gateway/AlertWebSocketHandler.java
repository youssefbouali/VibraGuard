package com.vibraguard.gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;

@Component
public class AlertWebSocketHandler implements WebSocketHandler {

    @Autowired
    private AlertStreamService alertStreamService;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.send(
            alertStreamService.getAlertStream()
                .map(session::textMessage)
        );
    }
}

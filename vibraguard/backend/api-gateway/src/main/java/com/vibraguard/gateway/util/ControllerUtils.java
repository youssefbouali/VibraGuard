package com.vibraguard.gateway.util;

import com.vibraguard.gateway.auth.model.User;
import com.vibraguard.gateway.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Optional;

@Component
public class ControllerUtils {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> currentUser(Principal principal) {
        if (principal == null) {
            return Optional.empty();
        }
        return userRepository.findByEmail(principal.getName());
    }

    public boolean isAdmin(Principal principal) {
        return currentUser(principal)
                .map(u -> u.getRole() != null && u.getRole().toLowerCase().contains("admin"))
                .orElse(false);
    }

    public boolean isTechnician(Principal principal) {
        return currentUser(principal)
                .map(u -> u.getRole() != null && (u.getRole().toLowerCase().contains("technicien")
                        || u.getRole().toLowerCase().contains("technician")))
                .orElse(false);
    }
}

package com.it342.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dmj6pxksp");
        config.put("api_key", "189898858328816");
        config.put("api_secret", "jbY44fSLXEPrrb5d7CnawLNILyI");

        return new Cloudinary(config);
    }
}

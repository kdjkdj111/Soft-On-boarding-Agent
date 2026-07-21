package com.vector.onboarding.infrastructure.github;

import com.vector.onboarding.global.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class RabbitMqAnalysisService implements GithubAnalysisService {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void analyzeAndSaveProjectStructure(Long spaceId, String repoUrl) {
        log.info("[RabbitMqAnalysisService] 비동기 분석 메세지 큐 발행 - spaceId: {}, repoUrl: {}", spaceId, repoUrl);

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("space_id", spaceId);
            message.put("repo_url", repoUrl);
            message.put("action", "analyze");

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY,
                    message
            );

            log.info("[RabbitMqAnalysisService] 분석 메세지 큐 발행 완료");
        } catch (Exception e) {
            log.error("[RabbitMqAnalysisService] 메세지 큐 발행 중 오류 발생", e);
        }
    }
}

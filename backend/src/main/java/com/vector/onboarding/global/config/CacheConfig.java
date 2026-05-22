package com.vector.onboarding.global.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Cache 설정 클래스.
 * Caffeine 기반 인메모리 캐시를 활성화합니다.
 * - 캐시 스펙: application.yml의 spring.cache.caffeine.spec 참조
 * - TTL: 10분 (expireAfterWrite=10m)
 * - 최대 항목 수: 1,000개
 */
@Configuration
@EnableCaching
public class CacheConfig {
    // application.yml의 spring.cache 설정이 자동으로 적용됩니다.
    // 별도 Bean 정의 없이 @EnableCaching만으로 Caffeine이 활성화됩니다.
}

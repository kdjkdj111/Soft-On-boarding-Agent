package com.vector.onboarding.global.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }

    public AccessDeniedException() {
        super("해당 스페이스에 대한 접근 권한이 없습니다.");
    }
}

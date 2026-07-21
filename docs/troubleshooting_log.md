# SOBA 리팩터링 핵심 트러블슈팅 일지

이 문서는 코드 리팩터링 및 아키텍처 고도화 과정에서 발생한 핵심 문제와 해결 과정을 회상(Recall)하기 쉽게 요약하여 누적하는 일지입니다.

---

### [2026-07-21] 분석 파이프라인 동기화 문제 해결 및 메세지 큐 도입

- **이슈 (Issue)**
  - Spring Boot에서 파이썬 기반 LLM 분석 스크립트를 `ProcessBuilder`로 동기 실행(Synchronous)함에 따라, 분석 완료 전까지 API 응답이 블로킹되고 서버 리소스가 점유되는 문제가 발생함.
  - 또한, 파이썬 스크립트에서 분석 결과를 DB(Supabase)에 직접 접근하여 적재하는 방식으로 인해, Spring Boot의 JPA(Domain) 계층과 데이터 무결성 캡슐화가 깨지는 구조적 문제가 존재.

- **원인 (Cause)**
  - MVP 개발 단계의 편의성 때문에 Spring Boot - Python 간의 강결합(Tightly Coupled) 아키텍처 채택.
  - 데이터의 진입점이 Web API와 Python 스크립트로 파편화됨.

- **해결 (Resolution)**
  1. **RabbitMQ 도입 (비동기 메시징)**: Spring Boot에서 분석 요청 시 RabbitMQ(`analysis.queue`)로 이벤트를 Publish하고, 파이썬 스크립트는 해당 큐의 워커(Consumer) 데몬으로 실행되도록 아키텍처를 변경함.
  2. **Webhook API 구성 (내부 통신)**: 파이썬 워커가 분석을 완료하면 DB에 직접 연결하지 않고, Spring Boot의 Webhook API(`POST /api/internal/webhook/*`)로 데이터를 전송하도록 리팩터링.
  3. **보안 인터셉터**: 외부에서 Webhook API를 악의적으로 호출하는 것을 막기 위해 `X-Internal-Secret` 커스텀 헤더를 이용한 `WebhookInterceptor` 보안 로직 추가.
  4. **데이터 응집도 향상**: 기존에 혼재되어 있던 `CommitHistory` 도메인을 `processflow`에서 완전히 분리(`commit` 패키지)하고, 비어있던 `ProcessView` 컨트롤러/서비스를 구성하여 파이프라인(Webhook) 수신 데이터를 올바르게 맵핑.

- **결과 (Result)**
  - 대용량 트래픽 환경이나 분석 지연 상황에서도 메인 API 스레드가 블로킹되지 않음.
  - 모든 DB 접근(CUD)이 Spring Boot (JPA)를 거치게 되어 데이터 정합성 보장.

---

### [2026-07-21] 백엔드 대시보드 BFF(Backend For Frontend) 도입 및 프론트엔드 컴포넌트 분리

- **이슈 요약:**
  - 기존 `ProcessFlowView` 화면 컴포넌트 내부에 커밋 타임라인과 팀 할 일(Kanban) 로직이 혼재되어 UI가 짬뽕되어 있었음. 프론트엔드 라우팅 및 기획 의도(CI/CD 파이프라인 뷰)와 맞지 않는 문제가 발생함.
- **원인/배경:**
  - 초기 기획의 변경 및 빠른 개발을 위해 여러 화면 데이터를 하나의 컴포넌트(`ProcessFlowView`)에서 각각의 서비스(`CommitHistory`, `BoardTask`)로 분리된 API를 각각 호출하며 렌더링하고 있었음.
  - 단일 화면에서 여러 엔드포인트를 호출하며 로딩 관리가 복잡해지고 프론트엔드의 책임이 비대해짐.
- **해결/결정:**
  1. **백엔드 BFF 패턴 신설:** `dashboardview` 도메인 패키지를 생성하여 `DashboardViewController`와 `DashboardViewService` 신설. 백엔드에서 커밋 내역과 할 일 목록을 단일 DTO(`DashboardResponseDto`)로 취합하여 반환하도록 설계 변경(BFF 패턴).
  2. **프론트엔드 UI 분리 및 정화:** 프론트엔드에서 `DashboardView.tsx`를 생성하고 기존 `ProcessFlowView.tsx`의 커밋/칸반 로직을 100% 이관함. 기존 `ProcessFlowView.tsx`는 향후 CI/CD 시각화를 위한 껍데기(Placeholder)로 정화함.
  3. **라우팅(App.tsx) 및 네비게이션(Sidebar.tsx) 업데이트:** 새로운 Dashboard View를 메인(`index`) 라우트로 설정하고 사이드바 메뉴에 추가함.

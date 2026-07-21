package com.vector.onboarding.domain.webhook;

import com.vector.onboarding.domain.dataview.entity.DataView;
import com.vector.onboarding.domain.dataview.repository.DataViewRepository;
import com.vector.onboarding.domain.functionalview.FunctionalElementAdminService;
import com.vector.onboarding.domain.functionalview.dto.FunctionalElementSaveRequestDto;
import com.vector.onboarding.domain.interfaceview.entity.InterfaceView;
import com.vector.onboarding.domain.interfaceview.repository.InterfaceViewRepository;
import com.vector.onboarding.domain.processflow.entity.ProcessView;
import com.vector.onboarding.domain.processflow.repository.ProcessViewRepository;
import com.vector.onboarding.domain.webhook.dto.WebhookDtos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/internal/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final FunctionalElementAdminService functionalElementAdminService;
    private final InterfaceViewRepository interfaceViewRepository;
    private final DataViewRepository dataViewRepository;
    private final ProcessViewRepository processViewRepository;

    @PostMapping("/functional/{spaceId}")
    public ResponseEntity<Void> saveFunctionalView(
            @PathVariable Long spaceId,
            @RequestBody List<FunctionalElementSaveRequestDto> requests) {
        log.info("[Webhook] Functional View 데이터 수신 (spaceId: {}, size: {})", spaceId, requests.size());
        functionalElementAdminService.replaceAll(spaceId, requests);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/interface/{spaceId}")
    @Transactional
    public ResponseEntity<Void> saveInterfaceView(
            @PathVariable Long spaceId,
            @RequestBody List<WebhookDtos.InterfaceViewPayload> requests) {
        log.info("[Webhook] Interface View 데이터 수신 (spaceId: {}, size: {})", spaceId, requests.size());
        
        List<InterfaceView> entities = requests.stream()
                .map(WebhookDtos.InterfaceViewPayload::toEntity)
                .collect(Collectors.toList());
                
        // 기존 데이터 삭제 후 새 데이터 적재
        List<InterfaceView> oldData = interfaceViewRepository.findAllBySpaceIdOrderByNameAsc(spaceId);
        interfaceViewRepository.deleteAll(oldData);
        interfaceViewRepository.saveAll(entities);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/data/{spaceId}")
    @Transactional
    public ResponseEntity<Void> saveDataView(
            @PathVariable Long spaceId,
            @RequestBody List<WebhookDtos.DataViewPayload> requests) {
        log.info("[Webhook] Data View 데이터 수신 (spaceId: {}, size: {})", spaceId, requests.size());
        
        List<DataView> entities = requests.stream()
                .map(WebhookDtos.DataViewPayload::toEntity)
                .collect(Collectors.toList());
                
        // 기존 데이터 삭제
        List<DataView> oldData = dataViewRepository.findAllBySpaceId(spaceId);
        dataViewRepository.deleteAll(oldData);
        
        dataViewRepository.saveAll(entities);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/process/{spaceId}")
    @Transactional
    public ResponseEntity<Void> saveProcessView(
            @PathVariable Long spaceId,
            @RequestBody List<WebhookDtos.ProcessViewPayload> requests) {
        log.info("[Webhook] Process View 데이터 수신 (spaceId: {}, size: {})", spaceId, requests.size());
        
        List<ProcessView> entities = requests.stream()
                .map(WebhookDtos.ProcessViewPayload::toEntity)
                .collect(Collectors.toList());
                
        // 기존 데이터 삭제
        processViewRepository.deleteBySpaceId(spaceId);
        processViewRepository.saveAll(entities);
        
        return ResponseEntity.ok().build();
    }
}

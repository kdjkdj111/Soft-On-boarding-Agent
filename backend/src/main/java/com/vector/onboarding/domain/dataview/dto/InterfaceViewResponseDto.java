package com.vector.onboarding.domain.dataview.dto;

import com.vector.onboarding.domain.dataview.entity.InterfaceView;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InterfaceViewResponseDto {
    private Long id;
    private String filePath;
    private String elementType;
    private String name;
    private String description;
    private String extraInfo;

    public static InterfaceViewResponseDto from(InterfaceView entity) {
        return InterfaceViewResponseDto.builder()
                .id(entity.getId())
                .filePath(entity.getFilePath())
                .elementType(entity.getElementType())
                .name(entity.getName())
                .description(entity.getDescription())
                .extraInfo(entity.getExtraInfo())
                .build();
    }
}

package com.risherp.dto.report;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic container for paginated report items with embedded summary object.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportPageResponse<T, S> {
    private List<T> data;
    private S summary;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public static <T, S> ReportPageResponse<T, S> of(Page<T> pageData, S summary) {
        return ReportPageResponse.<T, S>builder()
                .data(pageData.getContent())
                .summary(summary)
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .first(pageData.isFirst())
                .last(pageData.isLast())
                .build();
    }
}

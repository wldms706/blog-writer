// Older saved titles can imply a practitioner even when the form says review.
export function resolveArticleStyle(style: string, title: string): string {
  if (style !== 'review') return style;
  const practitionerTitle = /(?:원장|시술자|전문가)(?:이|가|인|인데|으로|로서)/.test(title)
    || /\d+[\s]*(?:명|건)[\s]*(?:작업|시술|해본|해\s*본|진행)/.test(title)
    || /\d+[\s]*년\s*차/.test(title);
  return practitionerTitle ? 'expert' : style;
}

export function getTitleAlignmentRules(title: string): string {
  if (!title) return '';
  return `## 제목과 본문 일치 (다른 예시와 문체 지시보다 우선)
제목: ${title}
- 이 제목이 약속한 질문, 관점, 범위를 도입부터 결론까지 유지하세요.
- 여러 고객의 작업 경험을 다루는 제목은 시술자의 관찰과 반복되는 패턴을 설명하세요. 한 고객의 방문 후기로 바꾸지 마세요.
- 고객 방문 제목은 고객 시점을, 원장 경험 제목은 원장 시점을 유지하세요. 본문에서 화자를 바꾸지 마세요.
- 제목에 숫자가 있어도 제공되지 않은 고객 사례, 경력, 성공률, 통계를 만들어 증명하지 마세요. 확인할 수 없는 세부 이력은 추가하지 마세요.`;
}

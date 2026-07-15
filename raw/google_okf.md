# Google Open Knowledge Format (OKF) — 원본 메모

출처: Google Cloud Blog (2026-06-12), 스펙 repo GoogleCloudPlatform/knowledge-catalog `okf/SPEC.md`, v0.1 draft

OKF는 흩어진 문서를 AI 에이전트가 읽을 수 있는 하나의 표준으로 만드는 파일 포맷이다. 마크다운 + 최소 YAML frontmatter만 사용한다. Google은 이를 "LLM-wiki 패턴을 형식화한 것"이라고 설명한다 — 즉 Karpathy의 아이디어를 표준화한 다운스트림 규격이며, Karpathy가 직접 만든 것은 아니다.

필수 필드: `type` 하나뿐. ("A short string identifying the kind of concept.") 권장(선택) 필드: title, description, resource, tags, timestamp. 생산자는 임의의 추가 키를 넣을 수 있고, 소비자는 모르는 키를 거부하면 안 된다(확장 가능·최소주의 설계).

개념 하나를 파일 하나로 보고, 파일 경로가 곧 식별자가 된다. Obsidian 같은 마크다운 도구와 상호운용되어 지식 그래프를 구성한다. 이 최소 규격 덕분에 사람과 기계(파서)가 동시에 읽고 쓸 수 있다.

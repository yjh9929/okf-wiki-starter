# Karpathy의 LLM Wiki 패턴 (원본 메모)

출처: Andrej Karpathy, GitHub Gist "llm-wiki.md" (2026-04-04)
https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## 핵심 아이디어
LLM이 질의 시점에 원문을 매번 다시 검색하는 대신, 점진적으로 구조화·상호링크된 마크다운 위키를 빌드·유지하는 패턴이다. 핵심은 "위키가 영속적이고 복리로 누적되는 산출물(a persistent, compounding artifact)"이라는 점 — 합성 결과가 질의마다 재도출되지 않고 축적된다.

## 3계층 구조
1. **Raw sources**: 불변의 큐레이션된 원본 (기사·논문·이미지·데이터)
2. **The wiki**: LLM이 전적으로 소유·생성하는 마크다운 파일 디렉터리
3. **The schema**: 위키 구조를 LLM에게 알려주는 문서 — 예: **Claude Code의 `CLAUDE.md`** 또는 Codex의 `AGENTS.md`

## 핵심 작업 3가지
- **Ingest**: 새 원본을 처리해 요약을 쓰고, 위키의 엔티티/개념 페이지를 갱신
- **Query**: 관련 위키 페이지를 검색해 출처를 달아 답을 합성 — **유용한 결과는 다시 위키에 저장(file back)** → 복리화
- **Lint**: 주기적 헬스체크 — 모순, 낡은 주장, 고아 페이지, 누락된 상호참조 점검

## 보조 파일
- **index.md**: 페이지 요약·메타데이터를 담은 콘텐츠 카탈로그
- **log.md**: 파싱 가능한 타임스탬프 접두어를 가진 append-only 시간순 기록

## 비유
"Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." (Obsidian은 IDE, LLM은 프로그래머, 위키는 코드베이스)

## 성격
이 문서는 명시적으로 "아이디어 파일이며, 본인의 LLM 에이전트에 복붙해 쓰도록 설계된, 의도적으로 추상적인" 문서다. 특정 CLI·버전·제품을 규정하지 않으며, 구현 세부는 사용자 선호와 도메인에 따라 달라진다.

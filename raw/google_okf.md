# Google Open Knowledge Format (OKF)

> Sam McVeety, Amir Hormati, "Introducing the Open Knowledge Format" (Google Cloud Blog, 2026-06-12)
> https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
> "Open Knowledge format v0.2 tackles agentic trust" (Google Cloud Blog, 2026-07-24)
> https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals
> GoogleCloudPlatform/knowledge-catalog 저장소의 `okf/SPEC.md`

요약·정리한 메모이며, 원본 내용은 위 주소에서 확인할 수 있습니다.

---

## 어떤 문제를 푸는가

AI가 참고해야 할 지식은 대개 여기저기 흩어져 있다. 카탈로그, 위키, 공유 드라이브, 코드 주석, 그리고 몇몇 사람의 머릿속.

여러 서비스가 각자의 방식으로 이걸 모아 주려 하지만, 어느 것도 다른 제품이나 조직으로 쉽게 옮겨지지 않는다. 결국 지식이 그것을 만든 도구 안에 갇힌다. Google의 진단은 이렇다. 필요한 것은 또 하나의 서비스가 아니라 형식이다.

## OKF가 무엇인가

OKF는 그 답으로 나온 공개 규격이다. Google은 이것을 **LLM Wiki 패턴을 형식화한 것**이라고 설명한다. Karpathy가 제시한 발상을 서로 통하는 형태로 표준화한 것이며, Karpathy가 직접 만든 것은 아니다.

내용은 단순하다. **표식이 붙은 마크다운 파일들의 폴더.** 그게 전부다.

- **마크다운일 뿐이다** — 어떤 편집기로든 열리고, GitHub에서 그대로 보인다
- **파일일 뿐이다** — 압축해 보내거나, git 저장소에 올리거나, 아무 폴더에 넣어 둘 수 있다
- **표식도 최소한이다** — 기계가 찾아봐야 하는 몇 개 항목만 정한다: type, title, description, resource, tags

## 어떻게 생겼나

개념 하나가 파일 하나이고, **파일 경로가 곧 그 개념을 가리키는 이름**이 된다. 표, 지표, 절차서, API 등 담고 싶은 무엇이든 개념이 될 수 있다.

개념끼리는 일반 마크다운 링크로 서로를 가리키고, 이 링크들이 폴더를 관계의 그래프로 바꾼다. 선택적으로 `index.md`(목차)와 `log.md`(변경 이력)를 둘 수 있다.

규격이 이렇게 짧은 데는 이유가 있다.

- **모든 문서에 요구하는 항목은 `type` 하나뿐이다.** 나머지는 만드는 쪽 마음이다.
- **모르는 항목이 있다고 문서를 거부해서는 안 된다.** 그래야 서로 다른 곳에서 만든 위키가 통한다.
- **특정 클라우드나 AI에 묶이지 않는다.** 읽고 쓰는 데 전용 계정이나 도구를 요구하지 않겠다고 명시했다.

## v0.2에서 달라진 것 (2026-07-24)

AI가 문서를 대량으로 만들어 내면서 "이 문서를 믿어도 되는가"라는 질문이 생겼다. v0.2는 그 판단 근거를 표식에서 읽을 수 있게 항목을 몇 개 추가한 업데이트다.

| 항목 | 답하는 질문 |
|---|---|
| `sources` | 어떤 자료에서 나왔나 |
| `generated` | 누가(또는 무엇이) 만들었나 |
| `verified` | 그 뒤에 누가 확인했나 |
| `stale_after` | 언제부터 낡은 것으로 볼까 |
| `status` | 초안인가, 현행인가, 폐기됐나 |

`generated`와 `verified`를 나눈 것은 AI가 만든 문서와 사람이 검토한 문서를 구분하기 위해서다. `stale_after`에 기간이 아니라 날짜를 적게 한 것도 의도적인데, 언제 읽었는지와 무관하게 날짜만 비교하면 판단이 끝나기 때문이다.

항목이 늘었지만 **전부 선택이고, 필수는 여전히 `type` 하나뿐이다.** v0.1로 만든 것도 그대로 쓸 수 있다. Google은 이 업데이트를 "규칙이 아니라 어휘를 늘린 것"이라고 표현했다.

---

## 참고자료

- v0.1 발표 — [How the Open Knowledge Format can improve data sharing](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) (Google Cloud Blog, 2026-06-12)
- v0.2 발표 — [Open Knowledge format v0.2 tackles agentic trust](https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals) (Google Cloud Blog, 2026-07-24)
- 규격과 예제 — [knowledge-catalog 저장소의 okf 폴더](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) (SPEC.md, 예제 번들, 참조 구현)
- 한국어 정리 — [Open Knowledge Format(OKF): Google이 제안한 AI 에이전트 지식 공유 개방형 표준](https://discuss.pytorch.kr/t/open-knowledge-format-okf-google-ai-feat-llm-wiki/10701) (박정환, PyTorchKR, 2026-06-14). v0.1 기준으로 쓰인 글이라 v0.2 내용은 없습니다.
- LLM Wiki — [Andrej Karpathy, LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

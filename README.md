# DAEDONG Great Journey

대동 신규입사자를 위한 공개형 모바일 온보딩 홈페이지입니다. 4박 5일 교육 여정, 미래사업 소개, My Vision Map, 대동인 퀴즈와 교육 운영 관리자 화면을 제공합니다.

## 주요 기능

- 모바일 우선 반응형 홈페이지
- DAY 1~5 교육 일정 탐색
- 대동 미래 5대 사업과 핵심가치 소개
- Vision Map 작성과 7문항 퀴즈
- Vision Map 카드 PNG 다운로드 & 결과 요약 복사
- 데이터베이스(Supabase) 기반 이력 및 퀴즈 관리
- 10명 이상 참여 시 익명 집계 공개
- 관리자 참여 내역·통계·Vision Map 확인 및 퀴즈 편집
- GitHub Pages 자동 배포 지원

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다. 관리자 화면은 `/admin`입니다.

## 폴더 구조

- `src`: 웹앱, 공용 라이브러리, 데이터 접근 코드
- `infrastructure`: Cloudflare Worker, Drizzle 마이그레이션, Supabase 스키마
- `tooling`: 빌드 플러그인과 운영 스크립트
- `quality`: 자동화 테스트
- `samples`: 기능 예제
- `projects`: 독립 실행형 보조 프로젝트
- `artifacts`: 압축본, PDF 이미지, 로그 등 생성 산출물
- `public`: 웹에서 제공되는 정적 이미지와 아이콘

## Supabase 연동 설정

1. [Supabase](https://supabase.com)에 로그인 후 새 프로젝트를 생성합니다.
2. `SQL Editor` 메뉴로 이동하여 저장소의 `infrastructure/database/supabase/schema.sql` 파일 내용을 붙여넣고 실행합니다.
   - `submissions` 테이블 및 `questions` 테이블이 생성되고 초기 퀴즈 데이터가 등록됩니다.
3. 프로젝트의 `Project Settings → API`에서 아래 정보들을 확인합니다:
   - `Project URL`
   - `anon / public key`
4. 로컬 개발 시 `.env.local` 파일에 환경변수를 추가합니다:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## GitHub Pages 자동 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드 후 GitHub Pages로 자동 배포합니다.

1. 저장소의 `Settings → Pages` 메뉴에서 **Source**를 **GitHub Actions**로 설정합니다.
2. `Settings → Secrets and variables → Actions`에 아래 Repository secrets를 추가합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 코드 변경사항을 `main` 브랜치에 push하면 빌드와 배포가 자동으로 실행됩니다.

## 데이터와 개인정보

이름, 소속회사, 사번, 퀴즈 결과와 Vision Map은 교육 참여 이력 관리를 위해 저장됩니다. 공개 통계에는 10명 이상 집계된 결과만 표시하며 원본 참여 정보는 관리자에게만 제공됩니다.

## 브랜드 자료

화면에 사용된 대동 로고와 미래농업 이미지는 대동 공식 홈페이지 자료를 기반으로 합니다. 관련 상표와 이미지의 권리는 대동에 있으며, 별도 허가 없이 다른 프로젝트에 재사용할 수 없습니다.

- [대동 공식 홈페이지](https://ko.daedong.co.kr/)
- [AI to the Field](https://ko.daedong.co.kr/aitothefield)
- [대동이 여는 미래농업 영상](https://www.youtube.com/watch?v=vjzp4rxfxDU)

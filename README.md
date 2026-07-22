# DAEDONG Great Journey

대동 신규입사자를 위한 공개형 모바일 온보딩 홈페이지입니다. 4박 5일 교육 여정, 미래사업 소개, My Vision Map, 대동인 퀴즈와 교육 운영 관리자 화면을 제공합니다.

## 주요 기능

- 모바일 우선 반응형 홈페이지
- DAY 1~5 교육 일정 탐색
- 대동 미래 5대 사업과 핵심가치 소개
- Vision Map 작성과 7문항 퀴즈
- 참여 이력과 재응시 기록 저장
- 10명 이상 참여 시 익명 집계 공개
- 관리자 참여 내역·통계·Vision Map 확인
- 퀴즈 문항 편집, 개별 삭제, 엑셀용 CSV 다운로드

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다. 관리자 화면은 `/admin`입니다.

## 관리자 인증 설정

실제 인증값은 Git에 포함되지 않는 `.env.local` 파일에만 둡니다. `.env.example`을 참고해 다음 값을 설정합니다.

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

새 비밀번호의 해시는 다음 방식으로 생성합니다.

```bash
NEW_ADMIN_PASSWORD="새 비밀번호" npm run admin:hash
```

출력된 값을 `ADMIN_PASSWORD_HASH`에 등록합니다. 배포 환경에서는 호스팅 서비스의 보안 환경변수 기능을 사용해야 합니다.

## GitHub push 자동 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드와 테스트를 실행한 뒤 Cloudflare Workers로 배포합니다. 저장소의 `Settings → Secrets and variables → Actions`에 아래 Repository secrets를 등록해야 합니다.

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

선택적으로 Repository variable `CLOUDFLARE_D1_DATABASE_NAME`을 등록할 수 있으며, 생략하면 `daedong-great-journey-db`를 사용합니다. Cloudflare 정보가 없는 동안 자동 배포 작업은 실행되지 않습니다.

## 데이터와 개인정보

이름, 소속회사, 사번, 퀴즈 결과와 Vision Map은 교육 참여 이력 관리를 위해 저장됩니다. 공개 통계에는 10명 이상 집계된 결과만 표시하며 원본 참여 정보는 관리자에게만 제공됩니다.

로컬 데이터는 `.wrangler/` 아래에 저장되고 Git에서 제외됩니다. 실제 운영 전 개인정보 처리방침과 내부 보안 검토가 필요합니다.

## 브랜드 자료

화면에 사용된 대동 로고와 미래농업 이미지는 대동 공식 홈페이지 자료를 기반으로 합니다. 관련 상표와 이미지의 권리는 대동에 있으며, 별도 허가 없이 다른 프로젝트에 재사용할 수 없습니다.

- [대동 공식 홈페이지](https://ko.daedong.co.kr/)
- [AI to the Field](https://ko.daedong.co.kr/aitothefield)
- [대동이 여는 미래농업 영상](https://www.youtube.com/watch?v=vjzp4rxfxDU)

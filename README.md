# 피싱캘린더

낚시 일정을 공유하는 캘린더 사이트입니다. 로그인 없이 URL만 알면 누구나 일정을 보고 추가/수정/삭제할 수 있습니다.

## 사용 전 준비

1. Supabase 프로젝트의 SQL Editor에서 [supabase-schema.sql](supabase-schema.sql) 내용을 한 번 실행하세요. (`fishing_events` 테이블 생성 + 공유 권한 + 실시간 동기화 설정)
2. `app.js`의 `SUPABASE_URL`, `SUPABASE_KEY`는 피싱캘린더 전용 Supabase 프로젝트를 사용합니다. 다른 프로젝트를 쓰려면 값을 교체하세요.

## 로컬 실행

`scripts/dev-server.ps1`을 실행하면 `http://localhost:5502` 에서 볼 수 있습니다.

## 배포 후 공유하기

정적 파일(index.html, style.css, app.js)을 Vercel, Netlify, GitHub Pages 등에 올리고 그 URL을 공유하면 됩니다.

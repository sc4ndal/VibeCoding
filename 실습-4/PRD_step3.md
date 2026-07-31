# PRD — 3단계: 사용자 프로필 & 레시피 저장

## 1. 개요 / 목표
Supabase Auth를 이용한 회원가입/로그인 기능과 사용자 프로필을 구축하고, 2단계에서 생성된 레시피를 사용자 계정에 저장/조회/삭제할 수 있도록 한다.

- 인증: Supabase Auth (이메일/비밀번호 방식)
- DB: Supabase(Postgres)
- 이번 단계의 성공 기준: 로그인한 사용자가 생성된 레시피를 저장하고, 이후 다시 로그인해 저장된 레시피 목록을 확인/삭제할 수 있다.

## 2. 사용자 스토리
- 사용자로서, 이메일/비밀번호로 회원가입하고 로그인하고 싶다.
- 사용자로서, 마음에 드는 레시피를 저장해두고 나중에 다시 보고 싶다.
- 사용자로서, 저장한 레시피 목록을 확인하고 필요 없는 것은 삭제하고 싶다.
- 사용자로서, 로그인하지 않은 상태에서 저장을 시도하면 로그인 화면으로 안내받고 싶다.

## 3. 기능 요구사항

### 3.1 인증 (Supabase Auth)
- 회원가입: 이메일 + 비밀번호
- 로그인 / 로그아웃
- 로그인 상태 유지 (Supabase 세션/JWT 토큰을 프론트엔드에서 관리, Express API 요청 시 Authorization 헤더로 토큰 전달 및 서버에서 검증)

### 3.2 사용자 프로필
- 프로필 정보: 닉네임(필수), 가입일
- 프로필 조회/수정 화면 (`/profile`)
- 최초 회원가입 시 `profiles` 테이블에 기본 레코드 생성 (Supabase Auth의 `auth.users`와 연동)

### 3.3 레시피 저장
- 2단계 레시피 결과 화면에 "저장하기" 버튼 추가
  - 비로그인 상태: 로그인 페이지로 이동 안내
  - 로그인 상태: 현재 레시피(제목/재료/조리순서/원본 이미지 URL)를 `saved_recipes` 테이블에 저장
- 저장된 레시피 목록 화면 (`/my-recipes`)
  - 카드 형태로 제목/썸네일(원본 냉장고 사진) 목록 표시
  - 클릭 시 상세 화면(재료/조리순서) 조회
  - 삭제 버튼 제공 (본인 소유 레시피만 삭제 가능)

### 3.4 백엔드 API (Node.js + Express)
- `POST /api/recipes` — 레시피 저장 (인증 필요)
- `GET /api/recipes` — 내 저장 레시피 목록 조회 (인증 필요)
- `GET /api/recipes/:id` — 저장 레시피 상세 조회 (인증 필요, 본인 소유만)
- `DELETE /api/recipes/:id` — 저장 레시피 삭제 (인증 필요, 본인 소유만)
- 모든 API는 Supabase가 발급한 JWT를 검증하는 인증 미들웨어를 통과해야 함

### 3.5 데이터 모델 (Supabase / Postgres)
- `profiles`
  - `id` (uuid, PK, `auth.users.id` 참조)
  - `nickname` (text)
  - `created_at` (timestamp)
- `saved_recipes`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → `auth.users.id`)
  - `title` (text)
  - `ingredients` (jsonb) — 사용/추가 재료 배열
  - `steps` (jsonb) — 조리 순서 배열
  - `source_image_url` (text, nullable) — 1단계에서 업로드한 냉장고 사진 URL
  - `created_at` (timestamp)

## 4. 비기능 요구사항
- Supabase RLS(Row Level Security) 정책 적용: `saved_recipes`, `profiles` 테이블 모두 `user_id = auth.uid()` 조건으로 본인 데이터만 조회/수정/삭제 가능하도록 설정
- 비밀번호 등 민감 정보는 Supabase Auth가 관리하므로 자체 저장/처리하지 않음
- 프론트엔드에서 Supabase 세션 만료 시 자동 로그아웃 및 재로그인 유도

## 5. 데이터 흐름 요약
```
[React] 회원가입/로그인 (Supabase Auth)
   → 세션 토큰 발급 및 프론트 저장
   → [React] 레시피 저장 버튼 클릭 (토큰 포함 요청)
   → [Express] 토큰 검증 → POST /api/recipes → Supabase DB insert
   → [React] "내 레시피" 목록에서 GET /api/recipes 조회
```

## 6. 제외 범위 (Out of Scope)
- 소셜 로그인 (Google 등)
- 레시피 공유, 커뮤니티, 댓글/평점 기능
- 비밀번호 찾기 등 부가 인증 플로우의 세부 UX (Supabase 기본 기능 활용 수준으로 한정)

## 7. 성공 지표
- 회원가입 → 로그인 → 레시피 저장 → 목록 조회 전체 플로우 정상 동작
- 본인이 아닌 사용자의 레시피에 API로 접근 시 100% 차단(RLS 검증)

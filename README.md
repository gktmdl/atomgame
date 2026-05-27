# 원자 만들기 시뮬레이션

실제 동위원소(Isotope) 데이터에 기반하여 원자를 구성하고 관찰하는 교육용 시뮬레이션입니다. 플레이어는 양성자, 중성자, 전자 수를 조절하여 원자를 만들고, 해당 원소의 실제 반감기와 안정성에 따라 결과를 확인합니다.

## ✨ 주요 기능
- **실제 과학 데이터**: GitHub에 공개된 NuclideChart 데이터를 바탕으로 각 원소(1~118번)의 가장 안정적인 동위원소 및 반감기 데이터를 빌드 시 정적으로 생성하여 사용합니다.
- **물리/화학 규칙 적용**: 전하 불균형 시 즉시 붕괴, 중성자 수 불일치에 따른 지수적 반감기 패널티를 부여합니다.
- **실시간 랭킹 시스템**: Firebase Firestore를 연동하여 실시간 Top 20 랭킹을 표시합니다.
- **교사용 대시보드 (`/teacher`)**: 실시간으로 플레이 중인 학생들의 기록과 최근 붕괴 로그를 확인할 수 있습니다.
- **화려한 시각화**: Tailwind CSS 애니메이션을 이용한 원자 핵과 전자 궤도 시각화 시스템.

## 📁 프로젝트 구조

```
atomgame/
├── .env.local.example          # 환경 변수 템플릿
├── firestore.rules             # Firestore 보안 규칙
├── package.json
├── tailwind.config.mjs         # Tailwind v4 (globals.css에서 @import 사용)
├── scripts/
│   ├── element-metadata.ts     # 원소 메타데이터 (이름, 기호)
│   └── generate-isotope-data.ts# 데이터 생성 스크립트
├── src/
│   ├── app/
│   │   ├── globals.css         # 글로벌 스타일 및 애니메이션
│   │   ├── layout.tsx          # 루트 레이아웃 (폰트 설정)
│   │   ├── page.tsx            # 메인 게임 페이지
│   │   └── teacher/page.tsx    # 교사용 대시보드
│   ├── components/             # React 컴포넌트
│   │   ├── AtomVisualizer.tsx  # 원자 3D 렌더링
│   │   ├── Controls.tsx        # 입자 조절 패널
│   │   ├── GameClient.tsx      # 메인 게임 클라이언트 통합
│   │   └── Leaderboard.tsx     # 실시간 랭킹 패널
│   ├── data/
│   │   └── isotopes.ts         # (자동생성) 동위원소 데이터
│   ├── hooks/
│   │   ├── useGameEngine.ts    # 핵심 게임 물리 및 타이머 로직
│   │   └── useScores.ts        # Firestore 실시간 구독 로직
│   ├── lib/
│   │   └── firebase.ts         # Firebase 초기화
│   └── types/
│       └── index.ts            # TypeScript 인터페이스
```

## 🚀 설치 및 실행 명령어

```bash
# 1. 패키지 설치
npm install

# 2. 동위원소 데이터 생성 (필수: src/data/isotopes.ts 파일 생성)
npm run generate:isotopes

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드 (자동으로 prebuild 단계에서 데이터를 생성합니다)
npm run build
npm run start
```

## 🔥 Firebase 설정 가이드

1. **Firebase 프로젝트 생성**: [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트를 생성합니다.
2. **웹 앱 추가**: 프로젝트 설정에서 웹 앱(`</>`)을 추가하고 Firebase SDK 구성 정보를 복사합니다.
3. **환경 변수 설정**: 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 값을 채웁니다. (`.env.local.example` 참고)
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. **Firestore Database 생성**: Firebase 콘솔에서 Firestore를 시작(프로덕션 모드)합니다.
5. **보안 규칙 적용**: `firestore.rules` 파일의 내용을 Firestore `규칙` 탭에 붙여넣고 게시합니다. 이 규칙은 지정된 데이터 형식만을 허용하고, 변조를 방지합니다.
6. **인덱스 (선택 사항)**: `scores` 컬렉션에 대해 `score` (내림차순) 및 `createdAt` (내림차순) 쿼리를 사용하므로 쿼리 실행 시 콘솔에 나타나는 링크를 클릭하여 복합 인덱스를 생성하세요.

## 🌍 Vercel 배포 가이드

원자 만들기 시뮬레이션은 Vercel 배포에 완벽히 최적화되어 있습니다.

1. 코드를 GitHub 리포지토리에 푸시합니다.
2. [Vercel](https://vercel.com/)에 로그인하고 **Add New Project**를 선택합니다.
3. 해당 GitHub 리포지토리를 Import 합니다.
4. **Environment Variables** 설정 섹션에 `.env.local`에 작성했던 `NEXT_PUBLIC_FIREBASE_*` 변수들을 모두 추가합니다.
5. **Build and Output Settings**는 기본값(`Next.js`)을 유지합니다. (`package.json`에 `prebuild` 스크립트가 정의되어 있어 Vercel 빌드 시 자동으로 동위원소 데이터를 최신으로 생성합니다.)
6. **Deploy** 버튼을 클릭합니다.

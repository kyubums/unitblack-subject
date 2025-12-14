# Unitblack Subject - Survey Service

설문조사 서비스를 제공하는 REST API 서버입니다. 사용자는 설문조사를 시작하고, 세션 내에서 질문에 순차적으로 답변합니다.

## 설계

### 주요 기술

#### TypeORM + PostgreSQL
- **관계형 데이터 모델링**: 세션, 질문 답변, 답변 옵션 간의 관계 표현
- **마이그레이션 지원**: 스키마 변경 이력을 관리하고 롤백 가능
- **트랜잭션 관리**: 답변 제출 시 세션 상태 업데이트와 답변 저장을 원자적으로 처리
- **PostgreSQL**: 범용 읽기 쓰기 성능 및 동시성 처리 성능 우수.

#### Zod
- **런타임 검증**: HTTP 요청 및 데이터베이스 경계에서 데이터 검증을 수행하여 잘못된 데이터가 도메인 내부로 유입되는 것을 방지
- **타입 추론**: Zod 스키마로부터 TypeScript 타입을 자동 생성하여 컴파일 타임 타입 안정성 확보
- **에러 메시지**: 구조화된 검증 에러를 제공하여 디버깅 용이

#### Functional 비즈니스 로직
- **책임 분리**: 도메인 모델은 데이터만 정의하고, 비즈니스 로직은 Service, Processor로 분리
- **테스트 용이성**: 순수 함수 형태로 구현하여 단위 테스트 작성이 간단
- **typescript class 에서의 문제**: 클래스 생성자의 사용 편의성 문제, 인스턴승 생성 및  `instanceof` 검증의 복잡성 회피
- **확장성**: 도메인 모델의 과도한 로직 포함을 회피. 비즈니스 로직 추가시 추가되는 행동에 대한 정의를 분리하여 관리.
- **Processor**: Constraint 검증 및 처리 로직 등 복잡한 비즈니스 로직을 담당

#### Strategy 패턴 (QuestionStrategy)
- **질문 유형별 처리**: SingleChoice, MultiChoice, Text 질문 유형에 따라 다른 검증 및 처리 로직 적용
- **확장성**: 새로운 질문 유형 추가 시 기존 코드 수정 없이 Strategy 구현체만 추가
- **단일 책임**: 각 Strategy는 특정 질문 유형의 검증과 답변 제출만 담당

#### 레이어 분리 (App Layer ↔ Database Layer)
- **의존성 역전**: App Layer에서 Repository 인터페이스를 정의하고, Database Layer에서 구현
- **테스트 용이성**: Mock Repository를 쉽게 주입하여 단위 테스트 작성
- **데이터베이스 독립성**: 데이터베이스 변경 시 App Layer 코드 수정 최소화

### 아키텍처 설계

#### 레이어 구조
```
App Layer (src/app/*)
├── Controller: HTTP 요청/응답 처리
├── Service: 비즈니스 로직 조율
├── Processor: 복잡한 비즈니스 로직 (SessionProcessor, QuestionAnswerProcessor)
├── Schema: 도메인 모델 정의 (Zod 스키마)
└── Repository: 데이터 접근 인터페이스

Database Layer (src/database/)
├── Entity: TypeORM 엔티티
├── Repository: App Layer 의 Repository 인터페이스 구현
├── Services: TransactionService 등 데이터 베이스 의존성을 가진 로직
└── Migrations: 데이터베이스 스키마 마이그레이션
```

## 로컬 빌드 및 테스트 방법

### 실행 환경 요구사항
- node.js 18 이상
- yarn 
- docker-compose

### 설치 및 환경 설정

1. **Yarn 설치** (필요한 경우)
```bash
npm i -g corepack
corepack enable
```

2. **의존성 설치**
```bash
yarn install
```

3. **데이터베이스 실행 및 마이그레이션**
```bash
docker compose up -d # postgres 를 5432 포트로 실행
./scripts/migrate.sh run
```

### 실행 방법

```bash
yarn start
```

**기본 포트**: 3000 (환경 변수 `PORT`로 변경 가능)

### 로컬 테스트 방법

**단위 테스트**
```bash
yarn test
```

**E2E 테스트**
```bash
yarn test:e2e
```

## 기타

### 가정 (Assumption)

1. **설문조사 데이터는 static**
   - 설문조사 데이터는 JSON 파일로 저장되며, 런타임에 외부에서 변경되지 않음

2. **Survey 데이터는 이미 검증된 데이터로 신뢰**
   - 질문 순서의 순환 참조나 무한 루프는 검증하지 않음
   - schema 에 따른 타입 및 구조에 대한 검증만 수행

3. **답변은 수정 불가**
   - 한 번 제출된 답변은 수정할 수 없음
   - 이미 제출된 질문에 대한 재제출 시도는 에러 발생

4. **질문 스냅샷 저장**
   - 답변 제출 시 해당 질문의 스냅샷을 저장
   - 설문조사 원본이 변경되어도 이미 제출된 답변은 스냅샷 기준으로 검증

### 트레이드오프 (Trade-off)

1. **Survey node-json-db vs RDB**
   - **선택**: 설문조사 데이터는 JSON 파일, 세션/답변 데이터는 PostgreSQL
   - **이유**: 설문조사는 구현 상 읽기 전용이고 변경 빈도가 낮아 JSON이 적합, 세션/답변은 관계형 구조와 트랜잭션이 필요
   - **단점**: 외부에서 survey.json 변경 시 서버 재시작 필요, 두 저장소의 직접적인 참조가 어려움. json 사이즈가 크면 데이터베이스 쓰기 성능 저하 이슈.

2. **Functional vs OOP**
   - **선택**: 모델은 데이터 정의만, 비즈니스 로직을 Service 및 Processor 가 담당 (Functional 스타일)
   - **이유**: 클래스 인스턴스 생성 및 검증 오버헤드 감소, 테스트 용이성, 모델의 비대화 방지
   - **단점**: 모델의 자체적인 Constraint 가 서비스 로직에 의존됨.

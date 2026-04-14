# TailLog 로컬 행동 라벨링 툴 설계 문서

> 작성일: 2026-04-10
> 목적: 개 행동 감지 훈련을 위한 로컬 실행 라벨링 툴 자체 개발 가이드
> 목표: 로컬 환경에서 최대한 돌아가는 행동감지 훈련추천 서비스의 데이터 기반 구축

---

## 1. 왜 자체 라벨링 툴인가?

### 기존 툴의 한계

| 툴 | 강점 | 개 행동 라벨링 한계 |
|----|------|------------------|
| CVAT | 이미지/비디오 박스·세그먼트 | ABC 구조 없음, 행동 컨텍스트 없음 |
| Label Studio | 범용 멀티모달 | 커스텀 설정 복잡, 클라우드 의존 |
| Roboflow | AI 자동화 강함 | 유료, 로컬 불가, 시계열 미지원 |
| Noldus Observer XT | 동물 행동 연구 표준 | 고가($5,000+), 비공개 포맷 |

### TailLog 라벨링 툴이 필요한 이유

1. **ABC 구조 네이티브 지원**: Antecedent-Behavior-Consequence 3-tuple이 1급 데이터 타입
2. **시계열 컨텍스트**: 단일 프레임이 아닌 행동 시퀀스(before → during → after) 라벨링
3. **TailLog DB 직접 연동**: `behavior_logs` 테이블과 직접 동기화
4. **완전 로컬 실행**: 인터넷 없이 동작, 데이터 외부 전송 없음
5. **저비용 구축**: 오픈소스 스택으로 개인 개발자 1명이 구축 가능

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│              TailLog Labeling Tool (Local)            │
│                                                       │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ 미디어 뷰 │   │ ABC 라벨 패널 │   │  통계/검증   │  │
│  │ (비디오/  │   │              │   │  패널        │  │
│  │  이미지)  │   │ A: [텍스트]  │   │              │  │
│  │          │   │ B: [유형선택]│   │ 완료율: 73%  │  │
│  │ ▶ 재생  │   │ C: [강도1-5] │   │ 분포 차트    │  │
│  │ 타임라인  │   │              │   │ 불일치 경고  │  │
│  └──────────┘   └──────────────┘   └──────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │         행동 시퀀스 타임라인                      │  │
│  │  0:00 ──[앉기]──[짖음]────[점프]──── 1:30       │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
           ↓                        ↓
    로컬 SQLite DB           TailLog API 동기화
    (오프라인 저장)          (선택적, 온라인 시)
```

---

## 3. 기술 스택 (로컬 우선)

### Option A: Electron + React (추천)

```
Frontend: React 18 + TypeScript + Tailwind CSS
Desktop Shell: Electron 28
로컬 DB: better-sqlite3 (SQLite 바인딩)
비디오: video.js 또는 네이티브 HTML5 video
차트: Recharts
AI 보조: llamafile (로컬 LLM, 선택 사항)
빌드: electron-builder (macOS/Windows/Linux)
```

**장점:**
- 완전한 로컬 실행
- 기존 TailLog 프론트엔드 코드 재사용 가능
- 크로스 플랫폼
- 파일시스템 직접 접근 가능

**단점:**
- Electron 번들 크기 (~150MB)

### Option B: Next.js + Tauri (경량)

```
Frontend: Next.js (기존 TailLog 코드베이스)
Desktop Shell: Tauri 2.0 (Rust 기반, 훨씬 가벼움)
로컬 DB: SQLite via tauri-plugin-sql
```

**장점:**
- 번들 크기 ~10MB (Electron 대비 15배 가벼움)
- TailLog 기존 코드 최대 재사용
- 메모리 사용량 낮음

**단점:**
- Rust 빌드 환경 필요

### Option C: Python + Streamlit (가장 빠른 개발)

```
Frontend: Streamlit
로컬 DB: SQLite (sqlite3 내장)
비디오: OpenCV (cv2)
AI: transformers (로컬 모델)
패키징: PyInstaller
```

**장점:**
- 가장 빠른 프로토타이핑
- 데이터 사이언스 생태계 완전 활용
- pandas, sklearn, torch 즉시 사용

**단점:**
- UI 커스터마이징 제한
- 비디오 성능 낮음

**→ 권장: Option A (Electron + React)로 시작. 기존 TailLog 컴포넌트 재사용 최대화.**

---

## 4. 핵심 데이터 모델

### 4.1 로컬 SQLite 스키마

```sql
-- 라벨링 프로젝트 (세션 단위)
CREATE TABLE labeling_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dog_breed TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' -- active | completed | paused
);

-- 원본 미디어 파일
CREATE TABLE media_files (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES labeling_projects(id),
    file_path TEXT NOT NULL,  -- 로컬 절대 경로
    file_type TEXT NOT NULL,  -- video | image | audio | csv
    duration_sec REAL,         -- 비디오인 경우
    fps REAL,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 핵심: ABC 라벨 (behavior_logs와 호환)
CREATE TABLE behavior_labels (
    id TEXT PRIMARY KEY,
    media_id TEXT REFERENCES media_files(id),

    -- ABC 트리플
    antecedent TEXT,           -- 선행 자극 (텍스트)
    antecedent_tags JSON,      -- ['자전거', '낯선사람', '초인종'] 등 태그
    behavior_type_id INTEGER,  -- TailLog type_id와 동일
    behavior_text TEXT,        -- 자유 텍스트 설명
    consequence TEXT,          -- 결과 설명

    -- 강도 & 메타
    intensity INTEGER CHECK(intensity BETWEEN 1 AND 5),
    duration_sec REAL,

    -- 시간 위치 (비디오인 경우)
    start_time_sec REAL,
    end_time_sec REAL,
    frame_start INTEGER,
    frame_end INTEGER,

    -- 공간 위치 (이미지인 경우)
    bbox_x REAL,
    bbox_y REAL,
    bbox_w REAL,
    bbox_h REAL,

    -- 품질 관리
    annotator_id TEXT DEFAULT 'local',
    confidence REAL DEFAULT 1.0,  -- 0~1, AI 예측인 경우 < 1
    is_ai_predicted INTEGER DEFAULT 0,
    review_status TEXT DEFAULT 'pending', -- pending | approved | rejected
    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 행동 유형 사전 (TailLog와 공유)
CREATE TABLE behavior_types (
    id INTEGER PRIMARY KEY,
    name_ko TEXT NOT NULL,
    name_en TEXT,
    category TEXT,  -- 공격성 | 불안 | 강박 | 학습 | 사회화
    description TEXT,
    examples JSON   -- 예시 상황 배열
);

-- 어노테이터 (멀티 어노테이터 지원)
CREATE TABLE annotators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'annotator', -- annotator | reviewer | expert
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inter-annotator 일치도 추적
CREATE TABLE annotation_agreements (
    id TEXT PRIMARY KEY,
    label_id_1 TEXT REFERENCES behavior_labels(id),
    label_id_2 TEXT REFERENCES behavior_labels(id),
    agreement_score REAL,  -- Cohen's kappa
    disagreement_fields JSON,  -- 불일치한 필드 목록
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TailLog 서버와 동기화 기록
CREATE TABLE sync_history (
    id TEXT PRIMARY KEY,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    label_count INTEGER,
    status TEXT,  -- success | failed | partial
    error_message TEXT
);
```

### 4.2 행동 유형 표준 사전

```json
[
  { "id": 1, "name_ko": "짖음", "category": "의사소통", "name_en": "barking" },
  { "id": 2, "name_ko": "점프", "category": "과잉흥분", "name_en": "jumping_up" },
  { "id": 3, "name_ko": "당김", "category": "충동성", "name_en": "leash_pulling" },
  { "id": 4, "name_ko": "으르렁", "category": "공격성", "name_en": "growling" },
  { "id": 5, "name_ko": "물기 시도", "category": "공격성", "name_en": "snapping" },
  { "id": 6, "name_ko": "분리불안", "category": "불안", "name_en": "separation_anxiety" },
  { "id": 7, "name_ko": "강박행동", "category": "강박", "name_en": "compulsive_behavior" },
  { "id": 8, "name_ko": "무시/무반응", "category": "학습", "name_en": "ignoring_cue" },
  { "id": 9, "name_ko": "회피", "category": "불안", "name_en": "avoidance" },
  { "id": 10, "name_ko": "과잉흥분", "category": "과잉흥분", "name_en": "hyperarousal" }
]
```

---

## 5. 핵심 기능 구현 계획

### 5.1 비디오 라벨링 모드

```
[비디오 타임라인 라벨링 흐름]

1. 파일 열기 → 로컬 경로 등록
2. 재생 중 단축키로 행동 구간 마킹
   - [S] 시작점 마킹
   - [E] 끝점 마킹 + ABC 패널 팝업
   - [1~5] 강도 빠른 입력
   - [A] Antecedent 텍스트 입력
   - [C] Consequence 선택

3. 구간이 저장되면 타임라인에 색상 블록 표시
   - 공격성: 빨강
   - 불안: 노랑
   - 과잉흥분: 주황
   - 학습 실패: 보라
   - 정상: 초록

4. 전체 비디오 완료 → 리뷰 모드
   - 모든 라벨 목록 표시
   - 의심스러운 라벨 하이라이트 (AI 자동 검출)
```

### 5.2 CSV/시계열 라벨링 모드 (가속도계 데이터)

```python
# 예: 스마트 목걸이 CSV 데이터 라벨링
# columns: timestamp, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z

import pandas as pd
import numpy as np

class TimeSeriesLabeler:
    """가속도계/자이로스코프 시계열 데이터 라벨링"""

    def __init__(self, csv_path: str, window_size: int = 100):
        self.df = pd.read_csv(csv_path)
        self.window_size = window_size  # 샘플 수 (100Hz → 1초)
        self.labels = []

    def add_label(
        self,
        start_idx: int,
        end_idx: int,
        behavior_type_id: int,
        intensity: int,
        antecedent: str = "",
        consequence: str = ""
    ):
        """구간 라벨 추가"""
        segment = self.df.iloc[start_idx:end_idx]

        # 특징 자동 추출
        features = self._extract_features(segment)

        self.labels.append({
            "start_idx": start_idx,
            "end_idx": end_idx,
            "duration_sec": (end_idx - start_idx) / self._get_sample_rate(),
            "behavior_type_id": behavior_type_id,
            "intensity": intensity,
            "antecedent": antecedent,
            "consequence": consequence,
            **features
        })

    def _extract_features(self, segment: pd.DataFrame) -> dict:
        """행동 구간에서 특징 자동 추출"""
        acc_magnitude = np.sqrt(
            segment['acc_x']**2 +
            segment['acc_y']**2 +
            segment['acc_z']**2
        )
        return {
            "mean_acc_magnitude": float(acc_magnitude.mean()),
            "std_acc_magnitude": float(acc_magnitude.std()),
            "max_acc_magnitude": float(acc_magnitude.max()),
            "dominant_frequency": self._dominant_freq(acc_magnitude)
        }

    def export_to_taillog_format(self) -> list[dict]:
        """TailLog behavior_logs 테이블 포맷으로 변환"""
        return [
            {
                "type_id": l["behavior_type_id"],
                "intensity": l["intensity"],
                "duration": int(l["duration_sec"]),
                "antecedent": l["antecedent"],
                "consequence": l["consequence"],
                "is_quick_log": False
            }
            for l in self.labels
        ]
```

### 5.3 AI 보조 사전 라벨링 (Pre-annotation)

```python
# 라벨링 전에 AI가 후보 라벨을 먼저 생성
# 어노테이터는 검토·수정만 하면 됨 (시간 50-80% 단축)

class AIPreAnnotator:
    """
    로컬 경량 모델로 사전 라벨링
    - 인터넷 연결 없이 동작
    - 어노테이터가 검토·수정만 수행
    """

    def __init__(self, model_path: str = "./models/dog_behavior_v1.onnx"):
        import onnxruntime as ort
        self.session = ort.InferenceSession(model_path)

    def predict_segment(self, features: np.ndarray) -> dict:
        """행동 구간 예측"""
        output = self.session.run(None, {"input": features})
        probabilities = output[0][0]

        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])

        return {
            "behavior_type_id": predicted_class,
            "confidence": confidence,
            "is_ai_predicted": True,
            "review_status": "pending" if confidence < 0.9 else "approved"
        }

    def batch_predict(self, segments: list) -> list[dict]:
        """배치 예측 (전체 비디오/CSV 처리)"""
        results = []
        for segment in segments:
            features = self._extract_features(segment)
            pred = self.predict_segment(features)
            results.append(pred)
        return results
```

### 5.4 품질 관리 — Inter-annotator Agreement

```python
from sklearn.metrics import cohen_kappa_score

def calculate_agreement(labels_annotator_1: list, labels_annotator_2: list) -> float:
    """
    두 어노테이터 간 일치도 계산 (Cohen's Kappa)
    - 0.8 이상: 우수
    - 0.6~0.8: 양호
    - 0.6 미만: 재검토 필요
    """
    types_1 = [l["behavior_type_id"] for l in labels_annotator_1]
    types_2 = [l["behavior_type_id"] for l in labels_annotator_2]

    kappa = cohen_kappa_score(types_1, types_2)
    return kappa

def find_disagreements(labels_1: list, labels_2: list) -> list[dict]:
    """불일치 구간 자동 식별"""
    disagreements = []
    for l1, l2 in zip(labels_1, labels_2):
        if l1["behavior_type_id"] != l2["behavior_type_id"]:
            disagreements.append({
                "start_idx": l1["start_idx"],
                "annotator_1_label": l1["behavior_type_id"],
                "annotator_2_label": l2["behavior_type_id"],
                "needs_expert_review": True
            })
    return disagreements
```

---

## 6. 폴더 구조

```
taillog-labeler/
├── README.md
├── package.json
├── electron/
│   ├── main.ts              # Electron 메인 프로세스
│   ├── preload.ts           # IPC 브릿지
│   └── db/
│       ├── schema.sql       # SQLite 스키마
│       ├── migrations/      # DB 마이그레이션
│       └── database.ts      # better-sqlite3 래퍼
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx         # 프로젝트 목록
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # 파일 목록
│   │   │       ├── video/[fileId]/  # 비디오 라벨링 뷰
│   │   │       └── csv/[fileId]/    # 시계열 라벨링 뷰
│   │   └── settings/
│   │       └── page.tsx             # 행동 유형 관리, 동기화 설정
│   │
│   ├── components/
│   │   ├── VideoLabeler/
│   │   │   ├── index.tsx        # 메인 비디오 플레이어
│   │   │   ├── Timeline.tsx     # 행동 타임라인
│   │   │   ├── ABCPanel.tsx     # ABC 입력 패널
│   │   │   └── LabelList.tsx    # 라벨 목록
│   │   │
│   │   ├── TimeSeriesLabeler/
│   │   │   ├── index.tsx        # 시계열 차트
│   │   │   ├── SensorChart.tsx  # 가속도계 시각화
│   │   │   └── SegmentMarker.tsx
│   │   │
│   │   ├── shared/
│   │   │   ├── BehaviorTypeSelector.tsx  # 행동 유형 드롭다운
│   │   │   ├── IntensitySlider.tsx
│   │   │   └── QualityBadge.tsx          # 품질 표시
│   │   │
│   │   └── stats/
│   │       ├── AnnotationStats.tsx  # 완료율, 분포 차트
│   │       └── AgreementReport.tsx  # 일치도 리포트
│   │
│   ├── lib/
│   │   ├── ipc.ts           # Electron IPC 클라이언트
│   │   ├── ai-predictor.ts  # AI 사전 라벨링
│   │   ├── sync.ts          # TailLog API 동기화
│   │   └── export.ts        # 데이터 내보내기
│   │
│   └── types/
│       ├── label.ts
│       ├── project.ts
│       └── behavior.ts
│
├── models/
│   └── dog_behavior_v1.onnx  # 로컬 추론 모델 (향후)
│
├── scripts/
│   ├── seed_behavior_types.ts  # 행동 유형 초기화
│   ├── import_taillog_logs.ts  # TailLog DB에서 가져오기
│   └── export_dataset.ts       # HuggingFace/CVAT 포맷 내보내기
│
└── tests/
    ├── labeling.test.ts
    └── export.test.ts
```

---

## 7. AI 사전 라벨링 모델 — 로컬 학습 파이프라인

### 7.1 초기 모델 학습 (Bootstrap)

```python
# scripts/train_local_model.py
# TailLog에 쌓인 라벨 데이터로 첫 모델 학습

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np

class DogBehaviorDataset(Dataset):
    """TailLog behavior_logs를 학습 데이터셋으로 변환"""

    def __init__(self, logs_df: pd.DataFrame, window_size: int = 50):
        self.logs = logs_df
        self.window_size = window_size

    def __len__(self):
        return len(self.logs)

    def __getitem__(self, idx):
        log = self.logs.iloc[idx]

        # 특징 벡터 구성 (텍스트 임베딩 + 수치)
        features = np.array([
            log['intensity'] / 5.0,          # 정규화 강도
            log['duration'] / 3600.0,         # 정규화 지속시간
            log['hour_of_day'] / 24.0,        # 시간대
            log['day_of_week'] / 7.0,         # 요일
            # antecedent 텍스트는 TF-IDF 또는 임베딩으로 변환
        ], dtype=np.float32)

        label = log['type_id'] - 1  # 0-indexed
        return torch.FloatTensor(features), torch.LongTensor([label])


class BehaviorClassifier(nn.Module):
    """경량 행동 분류 모델 (로컬 추론용)"""

    def __init__(self, input_dim: int, num_classes: int = 10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        return self.net(x)


def train_model(logs_csv_path: str, output_path: str = "./models/dog_behavior_v1.pt"):
    df = pd.read_csv(logs_csv_path)
    dataset = DogBehaviorDataset(df)

    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    model = BehaviorClassifier(input_dim=4, num_classes=10)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(50):
        for features, labels in loader:
            optimizer.zero_grad()
            outputs = model(features)
            loss = criterion(outputs, labels.squeeze())
            loss.backward()
            optimizer.step()

    torch.save(model.state_dict(), output_path)

    # ONNX 변환 (크로스 플랫폼 배포)
    dummy_input = torch.randn(1, 4)
    torch.onnx.export(model, dummy_input, output_path.replace('.pt', '.onnx'))
    print(f"모델 저장 완료: {output_path}")
```

### 7.2 능동 학습 (Active Learning)

AI가 확신하지 못하는 샘플을 우선적으로 어노테이터에게 제시:

```python
def select_uncertain_samples(predictions: list[dict], top_k: int = 50) -> list[int]:
    """
    불확실한 샘플 선택 (Least Confidence Sampling)
    어노테이터가 가장 효과적으로 시간을 쓸 수 있는 샘플 제시
    """
    uncertainties = [(i, 1 - p['confidence']) for i, p in enumerate(predictions)]
    uncertainties.sort(key=lambda x: x[1], reverse=True)
    return [idx for idx, _ in uncertainties[:top_k]]
```

---

## 8. TailLog 메인 서비스와의 통합

### 8.1 데이터 동기화 API

```typescript
// src/lib/sync.ts

interface SyncConfig {
  apiUrl: string;  // TailLog 백엔드 URL
  apiKey: string;  // 서비스 API 키
}

export async function syncLabelsToTailLog(
  labels: BehaviorLabel[],
  config: SyncConfig
): Promise<SyncResult> {
  const payload = labels
    .filter(l => l.review_status === 'approved')
    .map(l => ({
      type_id: l.behavior_type_id,
      antecedent: l.antecedent,
      behavior: l.behavior_text,
      consequence: l.consequence,
      intensity: l.intensity,
      duration: l.duration_sec,
      occurred_at: l.occurred_at,
      is_quick_log: false
    }));

  const response = await fetch(`${config.apiUrl}/behavior-logs/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey
    },
    body: JSON.stringify({ logs: payload })
  });

  return response.json();
}
```

### 8.2 내보내기 포맷 지원

```typescript
// 다양한 포맷으로 내보내기 (연구기관 협력용)

export function exportToCVAT(labels: BehaviorLabel[]): string {
  // CVAT XML 포맷
}

export function exportToHuggingFace(labels: BehaviorLabel[]): object {
  // HuggingFace Dataset 포맷
  return {
    features: { ... },
    data: labels.map(l => ({ ... }))
  };
}

export function exportToCSV(labels: BehaviorLabel[]): string {
  // 범용 CSV (Noldus Observer XT 호환)
}
```

---

## 9. 개발 로드맵

### Phase 1: 기반 구축 (2주)
- [ ] Electron + React 환경 셋업
- [ ] SQLite 스키마 + 마이그레이션
- [ ] 행동 유형 사전 시드
- [ ] 프로젝트 생성/목록 UI

### Phase 2: 핵심 라벨링 (3주)
- [ ] 비디오 플레이어 + 타임라인
- [ ] ABC 패널 구현
- [ ] 키보드 단축키 시스템
- [ ] 라벨 저장/수정/삭제

### Phase 3: 품질 관리 (2주)
- [ ] 완료율/분포 통계 대시보드
- [ ] Inter-annotator agreement 계산
- [ ] 불일치 리뷰 모드
- [ ] 내보내기 (CSV, JSON)

### Phase 4: AI 보조 (3주)
- [ ] 로컬 모델 학습 스크립트
- [ ] ONNX 추론 통합
- [ ] Pre-annotation 표시
- [ ] Active learning 샘플 선택

### Phase 5: TailLog 통합 (1주)
- [ ] API 동기화
- [ ] 승인된 라벨 자동 업로드
- [ ] 양방향 데이터 연동

**총 개발 기간: 약 11주 (개인 개발자 1명 기준)**

---

## 10. 행동 감지 모델의 미래 아키텍처

```
[장기 목표: 완전 자동화 행동 감지 서비스]

입력 레이어 (멀티모달)
│
├── 텍스트 로그 (TailLog ABC 입력)
│   └── → BERT 계열 임베딩
│
├── 가속도계 데이터 (스마트 목걸이)
│   └── → 1D CNN + Transformer
│
└── 비디오 (선택적)
    └── → EfficientNet + LSTM
              ↓
       MoE 게이팅 네트워크
       (입력 모달리티 자동 선택)
              ↓
    ┌─────┬─────┬─────┬─────┐
    │ E1  │ E2  │ E3  │ E4  │
    │공격  │불안  │흥분  │학습  │
    │전문  │전문  │전문  │전문  │
    └─────┴─────┴─────┴─────┘
              ↓
       행동 분류 + 강도 추정
              ↓
       개인화 훈련 추천 생성
       (RAG + TailLog 위키)
```

이 구조에서 **라벨링 툴로 구축한 데이터**가 각 전문가 모델을 훈련시키는 핵심 자산이 됩니다.

---

*문서 끝 — 다음 업데이트: Phase 1 완료 후*

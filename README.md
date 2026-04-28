# 📍 StudySpot

> **"나의 학습 스타일과 목적에 딱 맞는 최적의 공부 장소 탐색 및 추천 웹 서비스"**

## 📌 프로젝트 소개
StudySpot은 사용자가 근처의 스터디룸이나 카페, 도서관 등을 조회하고, 방문 경험을 리뷰로 남길 수 있는 풀스택 웹 서비스입니다. 

이 프로젝트는 2인 팀으로 진행되었으나, 단순한 기능 분배를 넘어 **전체 데이터베이스 아키텍처(ERD, SQL)와 백엔드/프론트엔드의 핵심 데이터 흐름을 정교하게 설계하고 구현**하는 데 초점을 맞추었습니다. 

* **핵심 가치**: 데이터 무결성을 보장하는 탄탄한 DB 설계와 안정적인 핵심 기능 구현
* **개발 초점**: 실무 협업 흐름(Git Flow) 경험 및 풀스택 데이터 파이프라인 구축

---

## 👥 팀 구성 및 역할
| 이름 | 역할 | 담당 분야 및 기여도 |
| :--- | :--- | :--- |
| **이지수 (PM & PL)** | Full-stack (Main) | 프로젝트 총괄 리딩<br>👉 **전체 도메인 DB 모델링(ERD) 및 SQL 설계 단독 수행**<br>👉 프론트/백엔드 핵심 아키텍처 설계 및 메인 비즈니스 로직 구현 |
| **문이화** | Full-stack (Sub) | 프론트엔드 UI 컴포넌트 구성 및 퍼블리싱<br>👉 백엔드 로직 보조 및 데이터 테스트 진행 |

---

## ✨ 현재 구현된 주요 기능 (MVP)
- **회원 인증 시스템**: JWT 기반의 안전한 로그인 및 회원가입 환경 제공
- **상세 조회 및 태그 리뷰**: 장소 상세 정보 제공 및 사용자 경험을 바탕으로 한 태그 기반 리뷰 작성
- **마이페이지**: 본인이 작성한 리뷰 내역 모아보기 기능 (※ 회원 탈퇴 기능은 향후 고도화 시 추가)

---

## 🚀 향후 고도화 계획 (Roadmap)
현재 MVP 모델을 바탕으로 아래의 기능들을 순차적으로 도입할 예정입니다.
- **실시간 예약 시스템**: 날짜별 1시간 단위 슬롯 선택 및 중복 예약 방지 데이터베이스 락(Lock) 적용
- **상태 관리 자동화**: 백엔드 스케줄러(Scheduler)를 통한 이용 상태(`예약됨` → `이용 완료`) 자동 갱신
- **마이페이지 고도화**: 예약 내역 확인 및 회원 탈퇴 프로세스 구현
- **위치 기반 서비스**: 카카오 맵 API를 연동한 내 주변 스터디룸 시각화

---

## 🛠️ 기술 스택
### **Frontend**
- **Language**: JavaScript (ES6+)
- **Library**: React.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Hooks
- **Build Tool**: Vite

### **Backend & Database**
- **Language**: Java 17
- **Framework**: Spring Boot 3.x
- **ORM**: Spring Data JPA
- **Database**: H2 (Dev) / MySQL (Prod)

### **Collaboration & Tools**
- **Version Control**: Git, GitHub
- **UI Design**: v0.dev (AI Driven UI)
- **API Testing**: Postman
- **Git GUI**: SourceTree

---

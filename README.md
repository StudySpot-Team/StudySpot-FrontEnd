# 📍 StudySpot (Frontend)

> **"우리 동네 스터디 공간, 한 눈에 찾고 1시간 단위로 간편하게 예약하자!"** > StudySpot은 사용자가 근처 스터디룸을 조회하고, 실시간 혼잡도 확인 및 시간별 예약을 할 수 있는 라이트한 풀스택 웹 서비스입니다.

---

## 📌 프로젝트 소개
StudySpot은 **로그인 기반의 스터디룸 예약 시스템**입니다.  
사용자가 자신의 동네에 있는 스터디룸을 조회하고 날짜별로 **1시간 단위의 시간 슬롯을 선택해 예약**할 수 있는 직관적인 기능을 제공합니다.

이 프로젝트는 **2인 팀 프로젝트**로 진행되며, 특정 포지션에 국한되지 않고 **프론트엔드와 백엔드 전반을 함께 구현하는 풀스택 개발**을 지향합니다.

* **핵심 가치**: 복잡한 기능보다는 안정적인 핵심 기능 구현
* **개발 초점**: 실무 협업 흐름(Git Flow) 및 전체 서비스 사이클 경험

---

## 👥 팀 구성
| 이름 | 역할 | 담당 분야 |
| :--- | :--- | :--- |
| **이지수 (PM)** | Full-stack Developer | 프로젝트 리딩, 프론트엔드 UI/UX, 백엔드 API 설계 |
| **문이화** | Full-stack Developer | 프론트엔드 기능 구현, 백엔드 로직 및 DB 스키마 설계 |

---

## ✨ 주요 기능 (MVP)
- **회원 관리**: 회원가입 및 JWT 기반 로그인 기능
- **장소 탐색**: 스터디룸 목록 조회 및 카카오 맵 API를 활용한 위치 확인
- **스마트 예약**: 
  - 날짜별/장소별 예약 현황 조회
  - 1시간 단위 예약 슬롯 선택 및 중복 예약 방지
- **상태 관리 시스템**:
  - `예약됨 → 이용 완료` 상태 변환
  - 스케줄러를 통한 이용 시간 종료 후 자동 상태 변경
- **실시간 정보**: 장소별 혼잡도 표시 및 필터링 기능

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


# Testing Scenarios Overview

> Test documentation for QA teams.

---

## Test Categories

| Category | Purpose | Location |
|----------|---------|----------|
| **Smoke Tests** | Page-level verification | [smoke-tests/](./smoke-tests/) |
| **Intra-Login Tests** | Module dependencies within portal | [intra-login-tests/](./intra-login-tests/) |
| **Inter-Login Tests** | Cross-portal scenarios | [inter-login-tests/](./inter-login-tests/) |

---

## Smoke Tests

Quick verification that each page loads and functions:
- [SuperAdmin](./smoke-tests/superadmin.md)
- [Institute](./smoke-tests/institute.md)
- [Teacher](./smoke-tests/teacher.md)
- [Student](./smoke-tests/student.md)

## Intra-Login Tests

Test dependencies within a single portal:
- Batch creation → Timetable
- Teacher creation → Batch assignment
- [Lesson Packages QA (SuperAdmin)](./inter-login-tests/packages-qa.md)

## Inter-Login Tests

Test data flow across portals:
- Content creation → Visibility downstream
- Exam assignment → Student access
- Teaching confirmation → Progress update

---

*Last Updated: March 2025*

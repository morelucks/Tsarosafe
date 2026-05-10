;; title: tsaro-payroll
;; version: 1.0
;; summary: Decentralized payroll platform for paying employees in crypto/stablecoins
;; description: Enables companies to onboard employees, set salaries, and execute
;;              batch payments using SIP-010 tokens. Supports role-based access,
;;              payment history tracking, and multi-token payouts.

;; ==========================================
;; Traits
;; ==========================================

(use-trait sip-010-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; ==========================================
;; Constants
;; ==========================================

(define-constant CONTRACT_OWNER tx-sender)

;; Errors
(define-constant ERR_NOT_AUTHORIZED (err u1000))
(define-constant ERR_COMPANY_EXISTS (err u1001))
(define-constant ERR_COMPANY_NOT_FOUND (err u1002))
(define-constant ERR_EMPLOYEE_EXISTS (err u1003))
(define-constant ERR_EMPLOYEE_NOT_FOUND (err u1004))
(define-constant ERR_INVALID_AMOUNT (err u1005))
(define-constant ERR_INSUFFICIENT_BALANCE (err u1006))
(define-constant ERR_EMPLOYEE_INACTIVE (err u1007))
(define-constant ERR_ALREADY_PAID (err u1008))
(define-constant ERR_INVALID_ROLE (err u1009))
(define-constant ERR_MAX_EMPLOYEES (err u1010))
(define-constant ERR_PAYMENT_FAILED (err u1011))

;; Roles
(define-constant ROLE_ADMIN u1)
(define-constant ROLE_MANAGER u2)
(define-constant ROLE_VIEWER u3)

;; Limits
(define-constant MAX_EMPLOYEES_PER_COMPANY u200)

;; ==========================================
;; Data Variables
;; ==========================================

(define-data-var next-company-id uint u1)
(define-data-var next-payment-id uint u1)

;; ==========================================
;; Data Maps
;; ==========================================

;; Company registry: company-id -> company details
(define-map companies
  uint
  {
    name: (string-ascii 64),
    owner: principal,
    treasury: principal,
    employee-count: uint,
    total-paid: uint,
    created-at: uint,
    active: bool
  }
)

;; Lookup: owner principal -> company-id
(define-map company-by-owner
  principal
  uint
)

;; Company roles: { company-id, member } -> role
(define-map company-roles
  { company-id: uint, member: principal }
  uint
)

;; Employee registry: { company-id, employee-wallet } -> employee details
(define-map employees
  { company-id: uint, employee: principal }
  {
    name: (string-ascii 64),
    salary: uint,
    start-date: uint,
    active: bool,
    total-received: uint,
    last-paid-at: uint
  }
)

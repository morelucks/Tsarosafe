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

;; Payment records: payment-id -> payment details
(define-map payments
  uint
  {
    company-id: uint,
    employee: principal,
    amount: uint,
    paid-at: uint,
    memo: (string-ascii 128)
  }
)

;; Track payment count per company for analytics
(define-map company-payment-count
  uint
  uint
)

;; ==========================================
;; Private Helper Functions
;; ==========================================

;; Check if caller is the company owner
(define-private (is-company-owner (company-id uint) (caller principal))
  (match (map-get? companies company-id)
    company (is-eq (get owner company) caller)
    false
  )
)

;; Check if caller has at least the required role level
;; ROLE_ADMIN (1) > ROLE_MANAGER (2) > ROLE_VIEWER (3)
;; Lower number = higher privilege
(define-private (has-role (company-id uint) (caller principal) (required-role uint))
  (if (is-company-owner company-id caller)
    true
    (match (map-get? company-roles { company-id: company-id, member: caller })
      role (<= role required-role)
      false
    )
  )
)

;; ==========================================
;; Public Functions: Company Management
;; ==========================================

;; Register a new company
(define-public (register-company (name (string-ascii 64)) (treasury principal))
  (let
    (
      (company-id (var-get next-company-id))
    )
    ;; Ensure sender hasn't already registered a company
    (asserts! (is-none (map-get? company-by-owner tx-sender)) ERR_COMPANY_EXISTS)

    ;; Create the company record
    (map-set companies company-id
      {
        name: name,
        owner: tx-sender,
        treasury: treasury,
        employee-count: u0,
        total-paid: u0,
        created-at: burn-block-height,
        active: true
      }
    )

    ;; Map owner to company
    (map-set company-by-owner tx-sender company-id)

    ;; Grant admin role to the owner
    (map-set company-roles { company-id: company-id, member: tx-sender } ROLE_ADMIN)

    ;; Increment company ID counter
    (var-set next-company-id (+ company-id u1))

    (print { event: "company-registered", company-id: company-id, name: name, owner: tx-sender })
    (ok company-id)
  )
)

;; Assign a role to a team member (Admin only)
(define-public (assign-role (company-id uint) (member principal) (role uint))
  (begin
    ;; Only admin/owner can assign roles
    (asserts! (has-role company-id tx-sender ROLE_ADMIN) ERR_NOT_AUTHORIZED)
    ;; Validate role value
    (asserts! (and (>= role ROLE_ADMIN) (<= role ROLE_VIEWER)) ERR_INVALID_ROLE)

    (map-set company-roles { company-id: company-id, member: member } role)

    (print { event: "role-assigned", company-id: company-id, member: member, role: role })
    (ok true)
  )
)

;; Remove a team member's role (Admin only)
(define-public (revoke-role (company-id uint) (member principal))
  (begin
    (asserts! (has-role company-id tx-sender ROLE_ADMIN) ERR_NOT_AUTHORIZED)

    (map-delete company-roles { company-id: company-id, member: member })

    (print { event: "role-revoked", company-id: company-id, member: member })
    (ok true)
  )
)

;; ==========================================
;; Public Functions: Employee Management
;; ==========================================

;; Onboard a new employee (Admin or Manager)
(define-public (add-employee
    (company-id uint)
    (employee principal)
    (name (string-ascii 64))
    (salary uint)
  )
  (let
    (
      (company (unwrap! (map-get? companies company-id) ERR_COMPANY_NOT_FOUND))
    )
    ;; Must be admin or manager
    (asserts! (has-role company-id tx-sender ROLE_MANAGER) ERR_NOT_AUTHORIZED)
    ;; Employee must not already exist
    (asserts! (is-none (map-get? employees { company-id: company-id, employee: employee })) ERR_EMPLOYEE_EXISTS)
    ;; Check max employees limit
    (asserts! (< (get employee-count company) MAX_EMPLOYEES_PER_COMPANY) ERR_MAX_EMPLOYEES)
    ;; Salary must be > 0
    (asserts! (> salary u0) ERR_INVALID_AMOUNT)

    ;; Create employee record
    (map-set employees
      { company-id: company-id, employee: employee }
      {
        name: name,
        salary: salary,
        start-date: burn-block-height,
        active: true,
        total-received: u0,
        last-paid-at: u0
      }
    )

    ;; Update employee count
    (map-set companies company-id
      (merge company { employee-count: (+ (get employee-count company) u1) })
    )

    (print { event: "employee-added", company-id: company-id, employee: employee, name: name, salary: salary })
    (ok true)
  )
)

;; Update an employee's salary (Admin or Manager)
(define-public (update-salary (company-id uint) (employee principal) (new-salary uint))
  (let
    (
      (emp (unwrap! (map-get? employees { company-id: company-id, employee: employee }) ERR_EMPLOYEE_NOT_FOUND))
    )
    (asserts! (has-role company-id tx-sender ROLE_MANAGER) ERR_NOT_AUTHORIZED)
    (asserts! (> new-salary u0) ERR_INVALID_AMOUNT)

    (map-set employees
      { company-id: company-id, employee: employee }
      (merge emp { salary: new-salary })
    )

    (print { event: "salary-updated", company-id: company-id, employee: employee, new-salary: new-salary })
    (ok true)
  )
)

;; Deactivate an employee (Admin or Manager)
(define-public (deactivate-employee (company-id uint) (employee principal))
  (let
    (
      (emp (unwrap! (map-get? employees { company-id: company-id, employee: employee }) ERR_EMPLOYEE_NOT_FOUND))
      (company (unwrap! (map-get? companies company-id) ERR_COMPANY_NOT_FOUND))
    )
    (asserts! (has-role company-id tx-sender ROLE_MANAGER) ERR_NOT_AUTHORIZED)

    (map-set employees
      { company-id: company-id, employee: employee }
      (merge emp { active: false })
    )

    ;; Decrement employee count
    (map-set companies company-id
      (merge company { employee-count: (- (get employee-count company) u1) })
    )

    (print { event: "employee-deactivated", company-id: company-id, employee: employee })
    (ok true)
  )
)

;; Reactivate an employee (Admin or Manager)
(define-public (reactivate-employee (company-id uint) (employee principal))
  (let
    (
      (emp (unwrap! (map-get? employees { company-id: company-id, employee: employee }) ERR_EMPLOYEE_NOT_FOUND))
      (company (unwrap! (map-get? companies company-id) ERR_COMPANY_NOT_FOUND))
    )
    (asserts! (has-role company-id tx-sender ROLE_MANAGER) ERR_NOT_AUTHORIZED)
    (asserts! (not (get active emp)) ERR_EMPLOYEE_EXISTS)

    (map-set employees
      { company-id: company-id, employee: employee }
      (merge emp { active: true })
    )

    ;; Increment employee count
    (map-set companies company-id
      (merge company { employee-count: (+ (get employee-count company) u1) })
    )

    (print { event: "employee-reactivated", company-id: company-id, employee: employee })
    (ok true)
  )
)

;; ==========================================
;; Public Functions: Payments
;; ==========================================

;; Pay a single employee (Admin or Manager)
(define-public (pay-employee
    (company-id uint)
    (employee principal)
    (amount uint)
    (memo (string-ascii 128))
    (token <sip-010-trait>)
  )
  (let
    (
      (company (unwrap! (map-get? companies company-id) ERR_COMPANY_NOT_FOUND))
      (emp (unwrap! (map-get? employees { company-id: company-id, employee: employee }) ERR_EMPLOYEE_NOT_FOUND))
      (payment-id (var-get next-payment-id))
      (treasury (get treasury company))
    )
    ;; Must be admin or manager to pay
    (asserts! (has-role company-id tx-sender ROLE_MANAGER) ERR_NOT_AUTHORIZED)
    ;; Employee must be active
    (asserts! (get active emp) ERR_EMPLOYEE_INACTIVE)
    ;; Amount must be > 0
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)

    ;; Execute the SIP-010 token transfer from treasury to employee
    (unwrap! (contract-call? token transfer amount treasury employee none) ERR_PAYMENT_FAILED)

    ;; Record the payment
    (map-set payments payment-id
      {
        company-id: company-id,
        employee: employee,
        amount: amount,
        paid-at: burn-block-height,
        memo: memo
      }
    )

    ;; Update employee's payment history
    (map-set employees
      { company-id: company-id, employee: employee }
      (merge emp {
        total-received: (+ (get total-received emp) amount),
        last-paid-at: burn-block-height
      })
    )

    ;; Update company's total paid
    (map-set companies company-id
      (merge company { total-paid: (+ (get total-paid company) amount) })
    )

    ;; Update payment count
    (map-set company-payment-count company-id
      (+ (default-to u0 (map-get? company-payment-count company-id)) u1)
    )

    ;; Increment payment ID
    (var-set next-payment-id (+ payment-id u1))


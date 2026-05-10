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

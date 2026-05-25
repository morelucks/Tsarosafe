;; title: tsaro-token
;; version: 1.0
;; summary: SIP-010 Fungible Token for TsaroSafe platform
;; description: A standard SIP-010 fungible token contract for TSARO

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; ==========================================
;; Constants and Variables
;; ==========================================

;; The contract owner (deployer)
(define-data-var contract-owner principal tx-sender)

;; Token Definitions
(define-fungible-token tsaro-token u1000000000000000000000000000)

;; Errors
(define-constant err-not-owner (err u100))
(define-constant err-unauthorized (err u101))

;; ==========================================
;; SIP-010 Standard Functions
;; ==========================================

;; Transfer tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-unauthorized)
    (try! (ft-transfer? tsaro-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok "TsaroToken")
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok "TSARO")
)

;; Get number of decimals
(define-read-only (get-decimals)
  (ok u18)
)

;; Get balance for an account
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance tsaro-token account))
)

;; Get current total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply tsaro-token))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok none)
)

;; ==========================================
;; Administrative Functions
;; ==========================================

;; Mint new tokens (Owner only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-owner)
    (ft-mint? tsaro-token amount recipient)
  )
)

;; Burn tokens (Owner only)
(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-owner)
    (ft-burn? tsaro-token amount sender)
  )
)

;; Transfer contract ownership
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-owner)
    (ok (var-set contract-owner new-owner))
  )
)

;; ==========================================
;; Initialization
;; ==========================================

;; Mint the initial supply to the contract owner
(begin
  (try! (ft-mint? tsaro-token u1000000000000000000000000000 tx-sender))
)

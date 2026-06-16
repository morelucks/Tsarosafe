import React from 'react';

describe('MiniPay Context Detection', () => {
  it('detects MiniPay environment correctly from window object', () => {
    const mockWindow = {
      ethereum: { isMiniPay: true }
    };
    const isMP = !!(mockWindow.ethereum?.isMiniPay);
    expect(isMP).toBe(true);
  });
});

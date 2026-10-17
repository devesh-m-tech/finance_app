export class Money {
  /**
   * Performs standard round-half-up on float numbers.
   */
  static roundHalfUp(value: number): number {
    return Math.floor(value + 0.5);
  }

  /**
   * Converts rupees to integer paise.
   */
  static rupeesToPaise(rupees: number): number {
    return this.roundHalfUp(rupees * 100);
  }

  /**
   * Converts integer paise to rupees float.
   */
  static paiseToRupees(paise: number): number {
    return paise / 100;
  }

  /**
   * Flat Interest Rate Calculation.
   * Total Interest = Principal * (annualRatePercent / 100) * (tenureMonths / 12)
   */
  static calculateFlatLoan(
    principalPaise: number,
    annualRatePercent: number,
    tenureMonths: number
  ): {
    totalInterestPaise: number;
    totalPayablePaise: number;
    monthlyInstallmentPaise: number;
    schedule: Array<{
      installmentNo: number;
      principalPaise: number;
      interestPaise: number;
      totalDuePaise: number;
    }>;
  } {
    const annualRate = annualRatePercent / 100;
    const totalInterestPaise = this.roundHalfUp(
      principalPaise * annualRate * (tenureMonths / 12)
    );
    const totalPayablePaise = principalPaise + totalInterestPaise;

    const baseMonthlyPrincipal = Math.floor(principalPaise / tenureMonths);
    const baseMonthlyInterest = Math.floor(totalInterestPaise / tenureMonths);

    const schedule = [];
    let accumulatedPrincipal = 0;
    let accumulatedInterest = 0;

    for (let i = 1; i <= tenureMonths; i++) {
      const isLast = i === tenureMonths;
      const principalPart = isLast
        ? principalPaise - accumulatedPrincipal
        : baseMonthlyPrincipal;
      const interestPart = isLast
        ? totalInterestPaise - accumulatedInterest
        : baseMonthlyInterest;

      accumulatedPrincipal += principalPart;
      accumulatedInterest += interestPart;

      schedule.push({
        installmentNo: i,
        principalPaise: principalPart,
        interestPaise: interestPart,
        totalDuePaise: principalPart + interestPart,
      });
    }

    return {
      totalInterestPaise,
      totalPayablePaise,
      monthlyInstallmentPaise: schedule[0]?.totalDuePaise || 0,
      schedule,
    };
  }

  /**
   * Reducing Balance (EMI) Calculation.
   * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
   */
  static calculateReducingLoan(
    principalPaise: number,
    annualRatePercent: number,
    tenureMonths: number
  ): {
    totalInterestPaise: number;
    totalPayablePaise: number;
    monthlyEmiPaise: number;
    schedule: Array<{
      installmentNo: number;
      openingBalancePaise: number;
      principalPaise: number;
      interestPaise: number;
      totalDuePaise: number;
      closingBalancePaise: number;
    }>;
  } {
    const monthlyRate = annualRatePercent / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const rawEmi = (principalPaise * monthlyRate * factor) / (factor - 1);
    const monthlyEmiPaise = this.roundHalfUp(rawEmi);

    const schedule = [];
    let currentBalancePaise = principalPaise;
    let totalInterestPaise = 0;

    for (let i = 1; i <= tenureMonths; i++) {
      const isLast = i === tenureMonths;
      const interestPart = this.roundHalfUp(currentBalancePaise * monthlyRate);
      let principalPart = monthlyEmiPaise - interestPart;

      if (isLast || principalPart > currentBalancePaise) {
        principalPart = currentBalancePaise;
      }

      const closingBalancePaise = Math.max(0, currentBalancePaise - principalPart);
      totalInterestPaise += interestPart;

      schedule.push({
        installmentNo: i,
        openingBalancePaise: currentBalancePaise,
        principalPaise: principalPart,
        interestPaise: interestPart,
        totalDuePaise: principalPart + interestPart,
        closingBalancePaise,
      });

      currentBalancePaise = closingBalancePaise;
    }

    return {
      totalInterestPaise,
      totalPayablePaise: principalPaise + totalInterestPaise,
      monthlyEmiPaise,
      schedule,
    };
  }

  /**
   * Daily / Weekly Micro Loan Calculation.
   * (Principal + Processing/Charges) divided across total installments.
   */
  static calculateMicroLoan(
    principalPaise: number,
    chargeRatePercent: number,
    installmentsCount: number
  ): {
    totalChargesPaise: number;
    totalPayablePaise: number;
    installmentPaise: number;
    schedule: Array<{
      installmentNo: number;
      principalPaise: number;
      chargePaise: number;
      totalDuePaise: number;
    }>;
  } {
    const totalChargesPaise = this.roundHalfUp(
      principalPaise * (chargeRatePercent / 100)
    );
    const totalPayablePaise = principalPaise + totalChargesPaise;

    const basePrincipal = Math.floor(principalPaise / installmentsCount);
    const baseCharge = Math.floor(totalChargesPaise / installmentsCount);

    const schedule = [];
    let accumulatedPrincipal = 0;
    let accumulatedCharges = 0;

    for (let i = 1; i <= installmentsCount; i++) {
      const isLast = i === installmentsCount;
      const principalPart = isLast
        ? principalPaise - accumulatedPrincipal
        : basePrincipal;
      const chargePart = isLast
        ? totalChargesPaise - accumulatedCharges
        : baseCharge;

      accumulatedPrincipal += principalPart;
      accumulatedCharges += chargePart;

      schedule.push({
        installmentNo: i,
        principalPaise: principalPart,
        chargePaise: chargePart,
        totalDuePaise: principalPart + chargePart,
      });
    }

    return {
      totalChargesPaise,
      totalPayablePaise,
      installmentPaise: schedule[0]?.totalDuePaise || 0,
      schedule,
    };
  }

  /**
   * Payment Waterfall Allocation:
   * 1. Settle Overdue Penalty
   * 2. Settle Accrued Interest
   * 3. Settle Outstanding Principal
   */
  static allocatePayment(
    amountPaidPaise: number,
    penaltyDuePaise: number,
    interestDuePaise: number,
    principalDuePaise: number
  ): {
    penaltyPaidPaise: number;
    interestPaidPaise: number;
    principalPaidPaise: number;
    remainingAmountPaise: number;
  } {
    let unallocated = amountPaidPaise;

    // 1. Settle Penalty
    const penaltyPaidPaise = Math.min(unallocated, penaltyDuePaise);
    unallocated -= penaltyPaidPaise;

    // 2. Settle Interest
    const interestPaidPaise = Math.min(unallocated, interestDuePaise);
    unallocated -= interestPaidPaise;

    // 3. Settle Principal
    const principalPaidPaise = Math.min(unallocated, principalDuePaise);
    unallocated -= principalPaidPaise;

    return {
      penaltyPaidPaise,
      interestPaidPaise,
      principalPaidPaise,
      remainingAmountPaise: unallocated, // Advance payment toward future installments
    };
  }
}

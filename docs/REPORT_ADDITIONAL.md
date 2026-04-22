# REPORT GENERATION SPECIFICATION – CARWASH MANAGEMENT SYSTEM

## Overview
This document defines the requirements for generating analytical reports in the Carwash Management System. Each report must use accumulated transaction data and provide meaningful insights for operational and business decision-making.

---

## 1. Payment Method Report

### Description
This report displays transaction data grouped by payment method within a selected period.

### Data to Display
- Payment Method Name
- Total Number of Transactions per Method
- Total Revenue per Method
- Percentage Usage per Method (optional)

### Purpose
- Identify customer payment preferences
- Support decisions for adding or optimizing payment options

---

## 2. Top Customer Report

### Description
This report displays customers with the highest transaction activity or total spending within a selected period.

### Data to Display
- Customer Name
- Total Number of Transactions
- Total Spending Amount
- Last Transaction Date (optional)

### Purpose
- Identify loyal or high-value customers
- Support marketing strategies such as promotions or membership programs

---

## 3. Transaction Distribution Report

### Description
This report shows the distribution of transactions over time (daily or monthly).

### Data to Display
- Date (daily) or Month (monthly)
- Total Number of Transactions per Period
- Total Revenue per Period (optional)

### Purpose
- Analyze transaction patterns over time
- Identify peak days or periods
- Support operational planning (e.g., staff scheduling)

---

## General Requirements

- Reports must support filtering by date range
- Data must be aggregated from transaction records
- Reports should be presented in:
  - Table format (mandatory)
  - Chart format (optional, recommended)
- All data must be dynamically updated based on stored historical transactions

---

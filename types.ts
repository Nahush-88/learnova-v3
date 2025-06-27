
import React from 'react';

export enum ExplanationLevel {
  GENERAL = "GENERAL",
  CLASS_6 = "CLASS_6",
  CLASS_10 = "CLASS_10",
  NEET_JEE = "NEET_JEE", // Combined for simplicity
}

export interface Subject {
  id: string;
  name: string;
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>; // Changed from React.ReactNode/React.ReactElement
}

export interface ExplanationLevelOption {
  value: ExplanationLevel;
  label: string;
}

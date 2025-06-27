// src/constants.ts

import React from 'react';
import { ExplanationLevel, Subject, ExplanationLevelOption } from './types';
import { BookOpenIcon, BeakerIcon, CalculatorIcon, HeartIcon, SparklesIcon } from './components/icons';

// Set the free query limit. For virtually unlimited, use a very large number.
// If you want to disable the limit and make all features free, you'd generally set isPremiumUser to true by default
// or remove the checks entirely. For now, setting a high limit for "free" use.
export const FREE_USES_LIMIT = 200; // Changed from 10 to 200

// If you want to make all features free, you can remove PREMIUM_PRICE_INR
// and simplify premium checks throughout the app. For this update, I'm removing the price.
export const PREMIUM_PRICE_INR = 0; // Set to 0 to effectively make premium free, or remove if not needed.

export const GEMINI_TEXT_MODEL_NAME = 'gemini-2.0-flash';
export const GEMINI_MULTIMODAL_MODEL_NAME = 'gemini-2.0-flash'; // Corrected variable name from GEMINI_MULTIMODAL_MODEL_MODEL_NAME

export const SUBJECTS: Subject[] = [
  { id: 'general', name: 'General', icon: React.createElement(SparklesIcon, { className: "w-5 h-5 mr-2" }) },
  { id: 'physics', name: 'Physics', icon: React.createElement(BeakerIcon, { className: "w-5 h-5 mr-2" }) },
  { id: 'chemistry', name: 'Chemistry', icon: React.createElement(BeakerIcon, { className: "w-5 h-5 mr-2" }) },
  { id: 'biology', name: 'Biology', icon: React.createElement(HeartIcon, { className: "w-5 h-5 mr-2" }) },
  { id: 'maths', name: 'Mathematics', icon: React.createElement(CalculatorIcon, { className: "w-5 h-5 mr-2" }) },
];

export const EXPLANATION_LEVEL_OPTIONS: ExplanationLevelOption[] = [
  { value: ExplanationLevel.GENERAL, label: 'General Explanation' },
  { value: ExplanationLevel.CLASS_6, label: 'For Class 6' },
  { value: ExplanationLevel.CLASS_10, label: 'For Class 10' },
  { value: ExplanationLevel.NEET_JEE, label: 'For NEET/JEE Aspirants' },
];

export const getSystemInstructionForLevel = (level: ExplanationLevel): string => {
  switch (level) {
    case ExplanationLevel.CLASS_6:
      return "You are an AI assistant. Explain the following concept in simple terms, using age-appropriate language and examples suitable for a 6th-grade student. Avoid complex jargon. Format your response clearly.";
    case ExplanationLevel.CLASS_10:
      return "You are an AI assistant. Explain the following concept in a clear and structured manner suitable for a 10th-grade student. Cover key definitions, principles, and provide relevant examples. Assume a foundational understanding of basic science/math. Format your response clearly.";
    case ExplanationLevel.NEET_JEE:
      return "You are an AI assistant. Explain the following concept with a strong focus on details, nuances, and applications relevant for competitive exams like NEET and JEE. Highlight important formulas, exceptions, and potential trick questions if applicable. Assume the user is preparing for advanced competitive science examinations. Format your response clearly, using markdown for structure if helpful.";
    case ExplanationLevel.GENERAL:
    default:
      return "You are a helpful AI assistant. Provide a clear, concise, and well-structured explanation for the following query. Use markdown for formatting if it enhances readability.";
  }
};
export type RiskLevel = "low" | "medium" | "high";
export type Decision = "ALLOW" | "STEP_UP" | "BLOCK";
export type SignalStatus = "clear" | "watch" | "alert";

export interface RiskSignal {
  id: string;
  label: string;
  value: string;
  status: SignalStatus;
  /** Points this signal contributes to the 0-100 risk score. */
  weight: number;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  decision: Decision;
  threat: string;
  headline: string;
  recommendation: string;
  signals: RiskSignal[];
}

export interface RiskScenarioMeta {
  level: RiskLevel;
  code: string;
  title: string;
  subtitle: string;
  range: string;
}

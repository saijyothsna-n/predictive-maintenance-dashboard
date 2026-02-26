import dotenv from 'dotenv';
dotenv.config();

class AIProvider {
  constructor() {
    this.mode = process.env.AI_MODE || 'STUB';
  }

  async analyzeTelemetry(telemetry) {
    if (this.mode === 'STUB') {
      return this.stubAnalysis(telemetry);
    } else {
      // AWS/REAL mode - not implemented in MVP
      throw new Error('AWS mode not implemented in MVP');
    }
  }

  stubAnalysis(telemetry) {
    let healthScore = 100;
    const issues = [];

    // Temperature analysis
    if (telemetry.temperature > 80) {
      healthScore -= 25;
      issues.push({
        sensor: 'temperature',
        value: telemetry.temperature,
        threshold: 80,
        impact: 25
      });
    }

    // Vibration analysis  
    if (telemetry.vibration > 60) {
      healthScore -= 25;
      issues.push({
        sensor: 'vibration',
        value: telemetry.vibration,
        threshold: 60,
        impact: 25
      });
    }

    // Power consumption analysis
    if (telemetry.power_consumption > 500) {
      healthScore -= 20;
      issues.push({
        sensor: 'power_consumption',
        value: telemetry.power_consumption,
        threshold: 500,
        impact: 20
      });
    }

    // Pressure analysis
    if (telemetry.pressure < 30 || telemetry.pressure > 70) {
      healthScore -= 15;
      issues.push({
        sensor: 'pressure',
        value: telemetry.pressure,
        threshold: '30-70',
        impact: 15
      });
    }

    // Ensure health score doesn't go below 0
    healthScore = Math.max(0, healthScore);

    // Determine risk level
    let riskLevel;
    if (healthScore >= 75) {
      riskLevel = 'Low';
    } else if (healthScore >= 40) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'High';
    }

    // Find primary contributing sensor
    const primaryContributingSensor = issues.length > 0 
      ? issues.sort((a, b) => b.impact - a.impact)[0].sensor 
      : 'none';

    // Generate recommendation
    let recommendedAction;
    if (riskLevel === 'High') {
      recommendedAction = 'Immediate maintenance required. Schedule inspection within 24 hours.';
    } else if (riskLevel === 'Medium') {
      recommendedAction = 'Schedule maintenance within 1 week. Monitor closely.';
    } else {
      recommendedAction = 'Normal operation. Continue routine monitoring.';
    }

    return {
      health_score: healthScore,
      risk_level: riskLevel,
      primary_contributing_sensor: primaryContributingSensor,
      recommended_action: recommendedAction,
      issues: issues
    };
  }
}

export default new AIProvider();

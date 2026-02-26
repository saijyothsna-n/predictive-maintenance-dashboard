import sqlite3 from 'sqlite3';
import { promisify } from 'util';

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = './maintenance.db';
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async initialize() {
    await this.connect();
    
    const run = promisify(this.db.run.bind(this.db));
    
    // Create machines table
    await run(`
      CREATE TABLE IF NOT EXISTS machines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id TEXT NOT NULL,
        temperature REAL NOT NULL,
        vibration REAL NOT NULL,
        power_consumption REAL NOT NULL,
        pressure REAL NOT NULL,
        health_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        contributing_sensor TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed sample data
    await this.seedSampleData();
  }

  async seedSampleData() {
    const run = promisify(this.db.run.bind(this.db));
    
    const sampleData = [
      {
        machine_id: 'MACHINE-001',
        temperature: 75,
        vibration: 45,
        power_consumption: 450,
        pressure: 55,
        health_score: 85,
        risk_level: 'Low',
        contributing_sensor: 'none',
        recommended_action: 'Normal operation. Continue routine monitoring.'
      },
      {
        machine_id: 'MACHINE-002',
        temperature: 85,
        vibration: 65,
        power_consumption: 520,
        pressure: 25,
        health_score: 35,
        risk_level: 'High',
        contributing_sensor: 'temperature',
        recommended_action: 'Immediate maintenance required. Schedule inspection within 24 hours.'
      },
      {
        machine_id: 'MACHINE-003',
        temperature: 78,
        vibration: 55,
        power_consumption: 480,
        pressure: 60,
        health_score: 75,
        risk_level: 'Low',
        contributing_sensor: 'none',
        recommended_action: 'Normal operation. Continue routine monitoring.'
      }
    ];

    for (const data of sampleData) {
      await run(`
        INSERT INTO machines (
          machine_id, temperature, vibration, power_consumption, pressure,
          health_score, risk_level, contributing_sensor, recommended_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.machine_id, data.temperature, data.vibration, 
        data.power_consumption, data.pressure, data.health_score,
        data.risk_level, data.contributing_sensor, data.recommended_action
      ]);
    }
  }

  async insertAnalysis(data) {
    const run = promisify(this.db.run.bind(this.db));
    
    await run(`
      INSERT INTO machines (
        machine_id, temperature, vibration, power_consumption, pressure,
        health_score, risk_level, contributing_sensor, recommended_action
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.machine_id, data.temperature, data.vibration,
      data.power_consumption, data.pressure, data.health_score,
      data.risk_level, data.primary_contributing_sensor, data.recommended_action
    ]);
  }

  async getHistory(machineId = null) {
    const all = promisify(this.db.all.bind(this.db));
    
    let query = 'SELECT * FROM machines ORDER BY created_at DESC';
    let params = [];
    
    if (machineId) {
      // Use parameterized query to prevent SQL injection
      query = 'SELECT * FROM machines WHERE machine_id = ? ORDER BY created_at DESC';
      params = [machineId];
    }
    
    return await all(query, params);
  }

  async getMachineIds() {
    const all = promisify(this.db.all.bind(this.db));
    const result = await all('SELECT DISTINCT machine_id FROM machines ORDER BY machine_id');
    return result.map(row => row.machine_id);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default new Database();

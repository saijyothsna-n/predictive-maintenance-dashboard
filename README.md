# Predictive Maintenance Dashboard MVP

A locally running full-stack predictive maintenance dashboard for manufacturing companies that analyzes machine telemetry data and provides health scoring with anomaly detection.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone and install dependencies:**
```bash
npm run install-all
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Start the application:**
```bash
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

The application will automatically:
- Initialize the SQLite database
- Seed sample data for testing
- Start both frontend and backend servers

## 📁 Project Structure

```
├── client/                 # Next.js frontend
│   ├── pages/
│   │   ├── index.js       # Telemetry input form
│   │   ├── result.js      # Analysis results display
│   │   ├── history.js     # Historical data with charts
│   │   └── _app.js        # Next.js app configuration
│   ├── styles/
│   │   └── globals.css    # Global styles with Tailwind
│   ├── package.json       # Frontend dependencies
│   └── next.config.js     # Next.js configuration
├── server/                # Express backend
│   ├── ai/
│   │   └── provider.js    # AI provider with stub logic
│   ├── db/
│   │   └── database.js    # SQLite database operations
│   ├── server.js          # Express server and API routes
│   └── package.json       # Backend dependencies
├── .env.example           # Environment variables template
├── package.json           # Root package with scripts
└── README.md             # This file
```

## 🔧 Features

### 1. Machine Telemetry Input
- Form with validation for machine telemetry data
- Fields: Machine ID, Temperature, Vibration, Power Consumption, Pressure
- Real-time validation and error handling
- Loading states during analysis

### 2. AI Health Score Engine
- **Stub Mode**: Deterministic health scoring algorithm
- **Health Score Calculation** (0-100 scale):
  - Temperature > 80°C: -25 points
  - Vibration > 60Hz: -25 points  
  - Power Consumption > 500W: -20 points
  - Pressure < 30 or > 70 PSI: -15 points
- Risk Level Classification: Low (75-100), Medium (40-74), High (0-39)
- Primary contributing sensor identification
- Maintenance recommendations

### 3. Backend API
- `POST /api/analyze` - Analyze machine telemetry
- `GET /api/history` - Retrieve analysis history
- `GET /api/machines` - Get list of machine IDs
- `GET /api/health` - Health check endpoint

### 4. SQLite Database
- Automatic database initialization
- Sample data seeding (3 machine records)
- Persistent storage of analysis results

### 5. Dashboard UI
- **Input Page**: Telemetry data entry form
- **Results Page**: Health score visualization with risk assessment
- **History Page**: Historical data with interactive charts

### 6. Data Visualization
- Line charts showing health score trends over time
- Responsive design for mobile and desktop
- Color-coded risk indicators

## 🎯 Usage Workflow

1. **Enter Telemetry Data**: Navigate to the home page and input machine readings
2. **View Analysis**: See immediate health score and risk assessment
3. **Review History**: Access historical data and trends for all machines
4. **Monitor Patterns**: Track health score changes over time

## ☁️ AWS Deployment Plan (Not executed for MVP)

| Local Component | AWS Equivalent | Description |
|----------------|----------------|-------------|
| SQLite | Amazon RDS | Relational database service for persistent storage |
| AI Stub | Amazon Lookout for Equipment | ML service for equipment anomaly detection |
| Express API | AWS Elastic Beanstalk / ECS | Container orchestration for backend services |
| Next.js frontend | AWS Amplify | Static site hosting with CI/CD |
| .env | AWS Secrets Manager | Secure environment variable management |

### AWS Implementation Notes

For production deployment with `AI_MODE=REAL`:

1. **Replace AI Provider**: Modify `/server/ai/provider.js` to integrate with AWS Lookout for Equipment SDK
2. **Database Migration**: Migrate SQLite schema to Amazon RDS (MySQL/PostgreSQL)
3. **Environment Configuration**: Use AWS Secrets Manager for sensitive configuration
4. **API Gateway**: Implement AWS API Gateway for REST API management
5. **Monitoring**: Add AWS CloudWatch for logging and monitoring

Example AWS integration:
```javascript
// In provider.js - AWS mode implementation
if (this.mode === 'REAL') {
  const lookout = new AWS.LookoutEquipment();
  // Call AWS Lookout for Equipment API
  return await lookout.analyzeTelemetry(telemetry);
}
```

## 🧪 Testing

The application includes sample data for immediate testing:
- **MACHINE-001**: Normal operation (Health: 85)
- **MACHINE-002**: High risk (Health: 35) 
- **MACHINE-003**: Low risk (Health: 75)

Test with sample telemetry:
```
Machine ID: TEST-001
Temperature: 85
Vibration: 65
Power Consumption: 520
Pressure: 25
Expected Result: Health Score ~35, High Risk
```

## 🔒 Environment Variables

```bash
AI_MODE=STUB          # STUB (default) or REAL (AWS integration)
DATABASE_URL=sqlite.db # SQLite database file path
PORT=3001             # Backend server port
```

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices
- Mobile phones (iOS and Android)

## 🚫 Out of Scope (MVP Limitations)

- User authentication and authorization
- Real-time data streaming
- ERP system integration
- AWS SDK implementation (stub only)
- Docker containerization
- Production deployment automation

## 🛠️ Development Scripts

```bash
npm run install-all    # Install all dependencies
npm run dev           # Start both frontend and backend
npm run server        # Start backend only
npm run client        # Start frontend only
```

## 📊 Success Criteria

✅ **Complete when:**
- Application runs on localhost with `npm run dev`
- Form submission triggers health score calculation
- Results are stored in SQLite database
- History page displays stored data with charts
- Health scores are calculated by stub AI logic
- README contains AWS deployment mapping

## 🐛 Troubleshooting

**Port conflicts:**
- Ensure ports 3000 and 3001 are available
- Modify PORT in .env if needed

**Database issues:**
- Delete `server/db/maintenance.db` to reinitialize
- Check write permissions in server/db directory

**Frontend build errors:**
- Run `npm run install-all` to ensure all dependencies
- Clear Next.js cache: `rm -rf .next`

---

Built with ❤️ using Next.js, Express, SQLite, and Tailwind CSS

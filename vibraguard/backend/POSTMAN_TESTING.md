# VibraGuard API - Integration Testing Guide

## Overview

This directory contains comprehensive Postman collections and environments for integration testing the VibraGuard API.

## Files

### Collection
- **VibraGuard-API-Tests.postman_collection.json** - Complete integration test suite with 25+ requests organized by resource type

### Environments
- **VibraGuard-Local.postman_environment.json** - Local development environment configuration

## Quick Start

### 1. Import in Postman

1. Open Postman
2. Click **Import** button (top-left)
3. Select **VibraGuard-API-Tests.postman_collection.json**
4. Click **Import**
5. Import the environment: **VibraGuard-Local.postman_environment.json**

### 2. Configure Environment

1. Click the environment dropdown (top-right)
2. Select **VibraGuard Local Development**
3. Click the **eye icon** to verify variables
4. Update `baseUrl` if your API is running on a different address:
   - Default: `http://localhost:8080/api/v1`
   - Production: `https://api.vibraguard.com/api/v1`

### 3. Run Tests

#### Single Request
- Click any request and press **Send**
- View response in the response panel

#### Full Test Suite
1. Select the collection
2. Click **Run** (or use the Collection Runner)
3. Select the environment
4. Configure test settings:
   - Iterations: `1`
   - Delay: `100ms` (prevents rate limiting)
5. Click **Start Run**

#### Specific Test Groups
Run tests by category:

```
Authentication → Motors → Vibrations → Alerts → Work Orders → Technicians → Analytics
```

## Test Flow

The collection follows a logical workflow that captures values from responses:

```
1. Register User (captures: userId)
   ↓
2. Login (captures: authToken)
   ↓
3. Create Motor (captures: motorId)
   ↓
4. Record Vibration Data
   ↓
5. Create Alert (captures: alertId)
   ↓
6. Update Alert Status
   ↓
7. Create Work Order (captures: workOrderId)
   ↓
8. Update Work Order
   ↓
9. List & View Analytics
```

## Environment Variables

| Variable | Description | Auto-Captured |
|----------|-------------|---|
| `baseUrl` | API base URL | ✗ |
| `testEmail` | Email for registration | ✗ |
| `authToken` | JWT token from login | ✓ |
| `userId` | User ID from registration | ✓ |
| `motorId` | Motor ID from creation | ✓ |
| `vibrationId` | Vibration ID from recording | ✓ |
| `alertId` | Alert ID from creation | ✓ |
| `workOrderId` | Work Order ID from creation | ✓ |

## Test Assertions

Each request includes automated tests that verify:

- ✅ Correct HTTP status codes
- ✅ Required response properties
- ✅ Valid enum values
- ✅ Data type correctness
- ✅ Proper error responses

### View Test Results

1. After running a request, check the **Tests** tab
2. Green checkmarks = passed assertions
3. Red X marks = failed assertions
4. View detailed results in Collection Runner output

## API Endpoints Tested

### Authentication (3 tests)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate and get JWT
- `GET /auth/me` - Retrieve current user profile

### Motors (4 tests)
- `POST /iot/motors` - Create new motor
- `GET /iot/motors` - List all motors
- `GET /iot/motors/{id}` - Get motor details
- `PUT /iot/motors/{id}` - Update motor information

### Vibrations (3 tests)
- `POST /iot/motors/vibrations` - Record sensor data
- `GET /iot/motors/{id}/vibration` - Get motor vibration history
- `GET /iot/motors/vibrations` - Get all vibrations

### Alerts (5 tests)
- `POST /ml/alerts` - Create new alert
- `GET /ml/alerts` - List alerts
- `PUT /ml/alerts/{id}` - Update alert status
- `POST /ml/alerts/{id}/read` - Mark single alert as read
- `POST /ml/alerts/mark-all-read` - Mark all alerts as read

### Work Orders (3 tests)
- `POST /iot/work-orders` - Create work order
- `GET /iot/work-orders` - List work orders
- `PUT /iot/work-orders/{id}` - Update work order

### Technicians (3 tests)
- `GET /iot/technicians` - List technicians
- `GET /iot/technicians/{id}` - Get technician profile
- `PUT /iot/technicians/{id}` - Update technician info

### Analytics (5 tests)
- `GET /bi/kpis` - Get KPI data
- `POST /bi/kpis/upsert` - Upsert KPI
- `GET /bi/mtbf-by-site` - Get MTBF metrics
- `GET /bi/maintenance-costs` - Get cost analysis
- `GET /bi/interventions` - Get intervention stats

## Common Issues & Troubleshooting

### 401 Unauthorized
- **Cause**: Invalid or expired JWT token
- **Solution**: 
  1. Run the Login request again
  2. Verify `authToken` is set in environment
  3. Check if token has expired

### 404 Not Found
- **Cause**: Resource ID doesn't exist
- **Solution**:
  1. Verify the request is executed in correct order
  2. Check that IDs are captured in previous requests
  3. Verify variables are set in environment

### 400 Bad Request
- **Cause**: Invalid request data
- **Solution**:
  1. Check request body format
  2. Verify required fields are included
  3. Validate enum values (e.g., status, priority)

### Connection Refused
- **Cause**: API server is not running
- **Solution**:
  1. Start the API server: `docker-compose up` or `mvn spring-boot:run`
  2. Verify baseUrl is correct
  3. Check firewall settings

## Advanced Usage

### Pre-request Scripts

Some requests use pre-request scripts to generate dynamic data:

```javascript
// Generate unique email with timestamp
pm.variables.set("testEmail", `test.user+${Date.now()}@vibraguard.com`);
```

### Test Scripts

Automated assertions validate responses:

```javascript
pm.test('Status is 200', function() {
    pm.response.to.have.status(200);
});

pm.test('Response has required properties', function() {
    let jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});
```

### Create Custom Tests

1. Open any request
2. Go to **Tests** tab
3. Add Postman test snippets
4. Use pm.test() for assertions

Example:
```javascript
pm.test('Custom validation', function() {
    let response = pm.response.json();
    pm.expect(response.value).to.be.above(0);
});
```

## Performance Testing

For load testing the API:

1. Open Collection Runner
2. Set **Iterations** to `50+`
3. Set **Delay** to `50ms` or less
4. Monitor response times and success rate
5. Export results for analysis

## CI/CD Integration

### Run in CI/CD Pipeline

```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run collection with environment
newman run VibraGuard-API-Tests.postman_collection.json \
  -e VibraGuard-Local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### GitHub Actions Example

```yaml
- name: Run API Tests
  run: |
    npm install -g newman
    newman run ./vibraguard/backend/VibraGuard-API-Tests.postman_collection.json \
      -e ./vibraguard/backend/VibraGuard-Local.postman_environment.json \
      --reporters cli
```

## Additional Resources

- [Postman Documentation](https://learning.postman.com/)
- [Newman CLI Guide](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [OpenAPI Specification](./openapi.yaml)
- [API Documentation](https://api.vibraguard.com/docs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review request test assertions
3. Enable Postman console (Ctrl+Alt+C) for debugging
4. Check API server logs

---

**Last Updated**: May 11, 2024  
**API Version**: 1.0.0  
**Collection Version**: 1.0.0

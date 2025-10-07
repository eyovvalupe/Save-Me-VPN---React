# Retail/Distributor API Documentation

## API Directory

### Core APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plans` | Get available subscription plans |
| `POST` | `/api/retail/grant-subscription` | Grant subscription to user |
| `GET` | `/api/retail/users` | Get retailer's user list |
| `GET` | `/api/retail/users/{uuid}` | Get user detail |

### Authentication
All APIs require `X-Access-Key` header with distributor's access key (format: `ak-xxxxxxxxxxxxxxxxx`).

### Base URL
```
http://k2.52j.me
```

## API Reference

### GET /api/plans

Get available subscription plans and pricing information.

**Summary**: Get subscription plans  
**Tags**: Plans  

#### Request

**Content-Type**: Not required (GET request)

**Parameters**: None

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "pid": "monthly_basic",
        "label": "Basic Monthly Plan",
        "price": 999,
        "originPrice": 1299,
        "month": 1,
        "highlight": false,
        "isActive": true
      },
      {
        "pid": "monthly_pro",
        "label": "Pro Monthly Plan", 
        "price": 2999,
        "originPrice": 3999,
        "month": 1,
        "highlight": true,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 100,
      "total": 2
    }
  }
}
```

**Plan Object Structure**:
| Field | Type | Description |
|-------|------|-------------|
| `pid` | string | Plan identifier (use this in grant-subscription requests) |
| `label` | string | Plan display name |
| `price` | integer | Current price in cents |
| `originPrice` | integer | Original price in cents |
| `month` | integer | Number of months this plan provides |
| `highlight` | boolean | Whether this plan should be highlighted in UI |
| `isActive` | boolean | Whether this plan is available for purchase |

**Error Response** (500):
```json
{
  "code": 500,
  "message": "Failed to load plans"
}
```

### POST /api/retail/grant-subscription

Grants a subscription plan to a user on behalf of a distributor.

**Summary**: Grant subscription to user  
**Tags**: Distributor APIs  

#### Request

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "email": "user@example.com",
  "planPid": "monthly_plan",
  "quantity": 1,
  "dryRun": false
}
```

**Request Parameters**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `email` | string | Yes | Target user email address (must be valid email format) | `"user@example.com"` |
| `planPid` | string | Yes | Plan identifier/PID to grant (get from /api/plans) | `"monthly_plan"` |
| `quantity` | integer | Yes | Number of plan periods to grant (minimum 1) | `1` |
| `dryRun` | boolean | No | Validation mode - performs all checks without executing the grant | `false` |

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "uuid": "user_abc123",
      "expiredAt": 1640995200,
      "isFirstOrderDone": true
    },
    "grant": {
      "uuid": "rgr_xyz789",
      "planPid": "monthly_plan",
      "quantity": 1,
      "amount": 1000,
      "grantedAt": 1640995200
    }
  }
}
```

**Error Responses**:

| HTTP Status | Error Code | Description | Example Response |
|------------|------------|-------------|------------------|
| 200 | 422 | Invalid request parameters | `{"code": 422, "message": "Email format invalid"}` |
| 200 | 409 | User ownership conflict | `{"code": 409, "message": "User already belongs to another distributor"}` |
| 200 | 401 | Authentication required | `{"code": 401, "message": "Authentication required"}` |
| 200 | 500 | Internal server error | `{"code": 500, "message": "Grant failed due to system error"}` |

#### Response Data Structures

**User Object**:
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | User's unique identifier |
| `expiredAt` | integer | Subscription expiration timestamp |
| `isFirstOrderDone` | boolean | Whether user has completed first order |

**Grant Object**:
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Grant record unique identifier |
| `planPid` | string | Plan identifier that was granted |
| `quantity` | integer | Number of periods granted |
| `amount` | integer | Total amount in cents (Plan.Price � Quantity) |
| `grantedAt` | integer | Grant execution timestamp |

## Business Logic

### Subscription Grant Process

1. **Distributor Authentication**: Verify the request comes from an authenticated distributor
2. **Plan Validation**: Ensure the specified plan exists and is active
3. **User Processing**: Find existing user or create new user account
4. **Ownership Check**: Verify user doesn't belong to a different distributor
5. **Subscription Calculation**: Calculate new expiration time based on current status
6. **Grant Execution**: Create grant record and update user subscription
7. **Response**: Return user and grant information

### Subscription Time Calculation

- **Active Users**: If user's current expiration is in the future, add plan duration to existing expiration
- **Expired Users**: If user is expired, start plan duration from current time
- **New Users**: Start plan duration from current time

**Example**:
- Current time: January 1, 2024
- User expires: March 1, 2024 (future)
- Granting: 1-month plan
- New expiration: April 1, 2024 (March 1 + 1 month)

## Error Handling

### Common Error Scenarios

| Scenario | Error Code | Message |
|----------|------------|---------|
| Invalid email format | 422 | "Email format invalid" |
| Missing required fields | 422 | "Field [name] is required" |
| Inactive plan | 422 | "Plan inactive or not found" |
| User ownership conflict | 409 | "User already belongs to another distributor" |
| Authentication failure | 401 | "Authentication required" |
| System/database error | 500 | "Grant failed due to system error" |

### Error Response Format

All errors follow the standard response format:
```json
{
  "code": <error_code>,
  "message": "<error_description>",
  "data": null
}
```

## Usage Examples

### Core API Examples

### Example 1: Grant Monthly Plan to New User

**Request**:
```bash
curl -X POST http://k2.52j.me/api/retail/grant-subscription \
  -H "X-Access-Key: <your_access_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "planPid": "monthly_pro",
    "quantity": 1
  }'
```

**Response**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "uuid": "user_def456",
      "expiredAt": 1643673600,
      "isFirstOrderDone": true
    },
    "grant": {
      "uuid": "rgr_ghi789",
      "planPid": "monthly_pro",
      "quantity": 1,
      "amount": 2999,
      "grantedAt": 1640995200
    }
  }
}
```

### Example 2: Multiple Quantity Grant

**Request**:
```bash
curl -X POST http://k2.52j.me/api/retail/grant-subscription \
  -H "X-Access-Key: <your_access_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "planPid": "monthly_basic",
    "quantity": 6
  }'
```

This would grant 6 months of the basic monthly plan to the user.

### Example 3: DryRun Validation

**Request**:
```bash
curl -X POST http://k2.52j.me/api/retail/grant-subscription \
  -H "X-Access-Key: <your_access_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "planPid": "monthly_pro",
    "quantity": 1,
    "dryRun": true
  }'
```

**Response**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "uuid": "user_abc123",
      "expiredAt": 1643673600,
      "isFirstOrderDone": true
    },
    "grant": {
      "uuid": "dry_run_grant",
      "planPid": "monthly_pro",
      "quantity": 1,
      "amount": 2999,
      "grantedAt": 1640995200
    }
  }
}
```

This validates the request without actually creating the grant record.

### Example 4: Get Available Plans

**Request**:
```bash
curl -X GET http://k2.52j.me/api/plans \
  -H "X-Access-Key: <your_access_key>"
```

**Response**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "pid": "monthly_basic",
        "label": "Basic Monthly",
        "price": 999,
        "originPrice": 1299,
        "month": 1,
        "highlight": false,
        "isActive": true
      },
      {
        "pid": "annual_pro",
        "label": "Pro Annual", 
        "price": 9999,
        "originPrice": 14999,
        "month": 12,
        "highlight": true,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 100,
      "total": 2
    }
  }
}
```

Use the `pid` values from this response when calling the grant-subscription endpoint.

## User Management APIs

The following APIs allow distributors to manage and view their assigned users.

### GET /api/retail/users

Get list of users managed by the authenticated distributor.

**Summary**: Get retailer's user list
**Tags**: Distributor APIs

#### Request

**Content-Type**: Not required (GET request)

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | integer | No | Page number (0-based) | `0` |
| `pageSize` | integer | No | Items per page | `10` |
| `email` | string | No | Filter by user email (exact match) | - |

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "uuid": "user_abc123",
        "email": "user@example.com",
        "expiredAt": 1640995200,
        "grantCount": 3,
        "orderCount": 2,
        "createdAt": 1609459200
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 10,
      "total": 1
    }
  }
}
```

**User List Item Structure**:
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | User's unique identifier |
| `email` | string | User's email address |
| `expiredAt` | integer | Subscription expiration timestamp |
| `grantCount` | integer | Number of grants received from this distributor |
| `orderCount` | integer | Number of orders placed by this user |
| `createdAt` | integer | User creation timestamp |

**Error Responses**:

| HTTP Status | Error Code | Description | Example Response |
|------------|------------|-------------|------------------|
| 200 | 422 | Invalid request parameters | `{"code": 422, "message": "Invalid page parameter"}` |
| 200 | 401 | Authentication required | `{"code": 401, "message": "Authentication required"}` |
| 200 | 403 | Insufficient permissions | `{"code": 403, "message": "Retailer permission required"}` |
| 200 | 500 | Internal server error | `{"code": 500, "message": "Database query failed"}` |

### GET /api/retail/users/{uuid}

Get detailed information about a specific user managed by the authenticated distributor.

**Summary**: Get user detail
**Tags**: Distributor APIs

#### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | User's unique identifier |

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "uuid": "user_abc123",
      "email": "user@example.com",
      "expiredAt": 1640995200,
      "createdAt": 1609459200,
      "grantCount": 3,
      "orderCount": 2
    },
    "grants": [
      {
        "uuid": "rgr_xyz789",
        "planPid": "monthly_pro",
        "quantity": 1,
        "amount": 2999,
        "grantedAt": 1640995200
      }
    ],
    "orders": [
      {
        "uuid": "ord_abc123",
        "title": "Monthly Pro Subscription",
        "originAmount": 2999,
        "payAmount": 2999,
        "isPaid": true,
        "paidAt": 1640995200,
        "createdAt": 1640995200
      }
    ]
  }
}
```

**User Detail Structure**:
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | User's unique identifier |
| `email` | string | User's email address |
| `expiredAt` | integer | Subscription expiration timestamp |
| `createdAt` | integer | User creation timestamp |
| `grantCount` | integer | Number of grants received from this distributor |
| `orderCount` | integer | Number of orders placed by this user |

**Grant Object Structure**:
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Grant record unique identifier |
| `planPid` | string | Plan identifier that was granted |
| `quantity` | integer | Number of periods granted |
| `amount` | integer | Grant amount in cents |
| `grantedAt` | integer | Grant execution timestamp |

**Order Object Structure**:
| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Order unique identifier |
| `title` | string | Order title/description |
| `originAmount` | integer | Original order amount in cents |
| `payAmount` | integer | Final payment amount in cents |
| `isPaid` | boolean | Whether the order has been paid |
| `paidAt` | integer | Payment timestamp (null if not paid) |
| `createdAt` | integer | Order creation timestamp |

**Error Responses**:

| HTTP Status | Error Code | Description | Example Response |
|------------|------------|-------------|------------------|
| 200 | 422 | Invalid request parameters | `{"code": 422, "message": "User UUID cannot be empty"}` |
| 200 | 404 | User not found or no permission | `{"code": 404, "message": "User not found or no permission"}` |
| 200 | 401 | Authentication required | `{"code": 401, "message": "Authentication required"}` |
| 200 | 403 | Insufficient permissions | `{"code": 403, "message": "Retailer permission required"}` |
| 200 | 500 | Internal server error | `{"code": 500, "message": "Database query failed"}` |

## User Management Examples

### Example 5: Get User List

**Request**:
```bash
curl -X GET http://k2.52j.me/api/retail/users?page=0&pageSize=10 \
  -H "X-Access-Key: <your_access_key>"
```

**Response**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "uuid": "user_abc123",
        "email": "customer1@example.com",
        "expiredAt": 1640995200,
        "grantCount": 1,
        "orderCount": 1,
        "createdAt": 1609459200
      },
      {
        "uuid": "user_def456",
        "email": "customer2@example.com",
        "expiredAt": 1643673600,
        "grantCount": 2,
        "orderCount": 2,
        "createdAt": 1609459200
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 10,
      "total": 2
    }
  }
}
```

### Example 6: Search User by Email

**Request**:
```bash
curl -X GET "http://k2.52j.me/api/retail/users?email=customer1@example.com" \
  -H "X-Access-Key: <your_access_key>"
```

### Example 7: Get User Detail

**Request**:
```bash
curl -X GET http://k2.52j.me/api/retail/users/user_abc123 \
  -H "X-Access-Key: <your_access_key>"
```

**Response**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "uuid": "user_abc123",
      "email": "customer1@example.com",
      "expiredAt": 1640995200,
      "createdAt": 1609459200,
      "grantCount": 1,
      "orderCount": 1
    },
    "grants": [
      {
        "uuid": "rgr_xyz789",
        "planPid": "monthly_pro",
        "quantity": 1,
        "amount": 2999,
        "grantedAt": 1640995200
      }
    ],
    "orders": [
      {
        "uuid": "ord_def456",
        "title": "Monthly Pro Subscription",
        "originAmount": 2999,
        "payAmount": 2999,
        "isPaid": true,
        "paidAt": 1640995200,
        "createdAt": 1640995200
      }
    ]
  }
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid Access Key authentication
2. **Ownership Validation**: Users can only be managed by their associated distributor
3. **Distributor Authorization**: Only authenticated distributors can grant subscriptions
4. **Input Validation**: All inputs are validated for format and business rules
5. **Transaction Safety**: Database operations use transactions for data consistency
6. **Access Key Security**: Keep your Access Key secure and do not share it publicly

## Rate Limiting

- Standard API rate limits apply
- Excessive failed authentication attempts may result in temporary blocking
- Contact support for higher rate limits if needed

## Support

For API support or questions:
- Check the system logs for detailed error information
- Ensure all required parameters are provided and correctly formatted
- Verify Access Key validity and distributor permissions
- Contact technical support with specific error details if issues persist
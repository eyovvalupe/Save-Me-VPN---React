# Retail/Distributor API Documentation

## API Directory

### Core APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plans` | Get available subscription plans |
| `POST` | `/api/retail/grant-subscription` | Grant subscription to user |

### Invite Code Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/invite/my-codes/latest` | Get/create latest invite code |
| `GET` | `/api/invite/my-codes` | List all my invite codes |
| `POST` | `/api/invite/my-codes` | Create new invite code |
| `PUT` | `/api/invite/my-codes/{code}/remark` | Update invite code remark |
| `GET` | `/api/invite/my-users` | Get invited users list |
| `GET` | `/api/invite/code` | Get public invite code info |

### Authentication
All APIs require `X-Access-Key` header with distributor's access key (format: `ak-xxxxxxxxxxxxxxxxx`).

### Base URL
```
https://k2.52j.me
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
  "inviteCode": "INVITE123", 
  "planPid": "monthly_plan",
  "quantity": 1,
  "dryRun": false
}
```

**Request Parameters**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `email` | string | Yes | Target user email address (must be valid email format) | `"user@example.com"` |
| `inviteCode` | string | Yes | Distributor's invite code | `"INVITE123"` |
| `planPid` | string | Yes | Plan identifier/PID to grant (get from /api/plans) | `"monthly_plan"` |
| `quantity` | integer | Yes | Number of plan periods to grant (minimum 1) | `1` |

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
      "isFirstOrderDone": true,
      "inviteCode": {
        "code": "INVITE123",
        "createdAt": 1609459200,
        "remark": "Distributor invite code"
      }
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
| `inviteCode` | object | Associated invite code information |

**Invite Code Object**:
| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Invite code value |
| `createdAt` | integer | Creation timestamp |
| `remark` | string | Code description/remark |

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

1. **Invite Code Validation**: Verify the invite code belongs to the authenticated distributor
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
| Invalid invite code | 422 | "Invite code invalid" |
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
curl -X POST https://k2.52j.me/api/retail/grant-subscription \
  -H "X-Access-Key: <your_access_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "inviteCode": "ABC123",
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
      "isFirstOrderDone": true,
      "inviteCode": {
        "code": "ABC123",
        "createdAt": 1609459200,
        "remark": "Premium distributor code"
      }
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
curl -X POST https://k2.52j.me/api/retail/grant-subscription \
  -H "X-Access-Key: <your_access_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "inviteCode": "XYZ789",
    "planPid": "monthly_basic", 
    "quantity": 6
  }'
```

This would grant 6 months of the basic monthly plan to the user.

### Example 3: Get Available Plans

**Request**:
```bash
curl -X GET https://k2.52j.me/api/plans \
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

## Invite Code Management APIs

The following APIs allow distributors to manage their invite codes used for granting subscriptions.

### GET /api/invite/my-codes/latest

Get or create the latest invite code for the authenticated distributor.

**Summary**: Get latest invite code  
**Tags**: Invite Codes  
**Authentication**: Required (`X-Access-Key`)

#### Request

**Parameters**: None

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "code": "ABC123",
    "createdAt": 1609459200,
    "remark": "Invite Code",
    "link": "https://kaitu.app/invite?code=ABC123",
    "config": {
      "downloadRewardDays": 3,
      "purchaseRewardDays": 7
    },
    "downloadCount": 15,
    "downloadReward": 45,
    "purchaseCount": 5,
    "purchaseReward": 35
  }
}
```

**Data Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Invite code value (use this in grant-subscription) |
| `createdAt` | integer | Creation timestamp |
| `remark` | string | Code description/remark |
| `link` | string | Full invite link URL |
| `config` | object | Invite reward configuration |
| `downloadCount` | integer | Number of users who downloaded via this code |
| `downloadReward` | integer | Total reward days earned from downloads |
| `purchaseCount` | integer | Number of users who purchased via this code |
| `purchaseReward` | integer | Total reward days earned from purchases |

### GET /api/invite/my-codes

Get all invite codes for the authenticated distributor with pagination.

**Summary**: List my invite codes  
**Tags**: Invite Codes  
**Authentication**: Required (`X-Access-Key`)

#### Request

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | integer | No | Page number (0-based) | `0` |
| `pageSize` | integer | No | Items per page | `20` |

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "code": "ABC123",
        "createdAt": 1609459200,
        "remark": "Primary Code",
        "link": "https://kaitu.app/invite?code=ABC123",
        "config": {
          "downloadRewardDays": 3,
          "purchaseRewardDays": 7
        },
        "downloadCount": 15,
        "downloadReward": 45,
        "purchaseCount": 5,
        "purchaseReward": 35
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 20,
      "total": 3
    }
  }
}
```

### POST /api/invite/my-codes

Create a new invite code for the authenticated distributor.

**Summary**: Create new invite code  
**Tags**: Invite Codes  
**Authentication**: Required (`X-Access-Key`)

#### Request

**Parameters**: None (automatically creates with default remark)

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "code": "XYZ789",
    "createdAt": 1640995200,
    "remark": "邀请码",
    "link": "https://kaitu.app/invite?code=XYZ789",
    "config": {
      "downloadRewardDays": 3,
      "purchaseRewardDays": 7
    },
    "downloadCount": 0,
    "downloadReward": 0,
    "purchaseCount": 0,
    "purchaseReward": 0
  }
}
```

### PUT /api/invite/my-codes/{code}/remark

Update the remark/description for a specific invite code.

**Summary**: Update invite code remark  
**Tags**: Invite Codes  
**Authentication**: Required (`X-Access-Key`)

#### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Invite code to update |

**Request Body**:
```json
{
  "remark": "Updated description"
}
```

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success"
}
```

### GET /api/invite/my-users

Get list of users invited by the authenticated distributor.

**Summary**: Get invited users  
**Tags**: Invite Codes  
**Authentication**: Required (`X-Access-Key`)

#### Request

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | integer | No | Page number (0-based) | `0` |
| `pageSize` | integer | No | Items per page | `20` |
| `inviteCode` | string | No | Filter by specific invite code | - |

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
        "expiredAt": 1643673600,
        "isFirstOrderDone": true,
        "inviteCode": {
          "code": "ABC123",
          "createdAt": 1609459200,
          "remark": "Primary Code"
        },
        "deviceCount": 2
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 20,
      "total": 15
    }
  }
}
```

### GET /api/invite/code

Get public information about any invite code (no authentication required).

**Summary**: Get invite code info  
**Tags**: Invite Codes  
**Authentication**: Not required

#### Request

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Invite code to lookup |

#### Response

**Success Response** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "code": "ABC123",
    "createdAt": 1609459200,
    "remark": "Primary Code",
    "link": "https://kaitu.app/invite?code=ABC123",
    "config": {
      "downloadRewardDays": 3,
      "purchaseRewardDays": 7
    }
  }
}
```

## Invite Code Management Examples

### Example 1: Get Latest Invite Code

```bash
curl -X GET https://k2.52j.me/api/invite/my-codes/latest \
  -H "X-Access-Key: <your_access_key>"
```

### Example 2: Create New Invite Code

```bash
curl -X POST https://k2.52j.me/api/invite/my-codes \
  -H "X-Access-Key: <your_access_key>"
```

### Example 3: Update Invite Code Remark

```bash
curl -X PUT https://k2.52j.me/api/invite/my-codes/ABC123/remark \
  -H "X-Access-Key: <your_access_key>" \
  -H "Content-Type: application/json" \
  -d '{"remark": "Premium Distributor Code"}'
```

### Example 4: Get Invited Users

```bash
curl -X GET https://k2.52j.me/api/invite/my-users?page=0&pageSize=10&inviteCode=ABC123 \
  -H "X-Access-Key: <your_access_key>"
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid Access Key authentication
2. **Ownership Validation**: Users can only be managed by their associated distributor
3. **Invite Code Security**: Distributors can only use their own invite codes
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
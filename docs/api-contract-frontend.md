# OneSuite Frontend - API Contract Reference

**Version**: 1.0 (FROZEN)  
**Last Updated**: 2026-01-21  
**Backend Base URL**: `NEXT_PUBLIC_API_BASE_URL`

---

## F1 - Authentication Endpoints

### POST `/users/auth/login/`
**Purpose**: User login  
**Required Role**: None (public)  
**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "access": "string",
  "refresh": "string",
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    "role": "consultant" | "manager" | "finance" | "director" | "admin"
  }
}
```

### POST `/users/auth/refresh/`
**Purpose**: Refresh access token  
**Required Role**: Authenticated  
**Request**:
```json
{
  "refresh": "string"
}
```
**Response**:
```json
{
  "access": "string",
  "refresh": "string" (optional, if rotated)
}
```

### POST `/users/auth/logout/`
**Purpose**: Logout  
**Required Role**: Authenticated  
**Request**: None  
**Response**: 204 No Content

---

## F2 - User Management

### GET `/users/me/`
**Purpose**: Get current user profile  
**Required Role**: Authenticated  
**Response**:
```json
{
  "id": number,
  "username": "string",
  "email": "string",
  "role": "string",
  "first_name": "string",
  "last_name": "string"
}
```

---

## F3 - Commissions Endpoints

### GET `/commissions/my-commissions/`
**Purpose**: Get user's own commissions  
**Required Role**: Consultant  
**Query Params**: `status`, `startDate`, `endDate`  
**Response**:
```json
{
  "count": number,
  "results": [
    {
      "id": number,
      "consultant": { "id": number, "username": "string" },
      "reference_number": "string",
      "transaction_date": "string",
      "sale_amount": "string",
      "calculated_amount": "string",
      "commission_type": "base" | "override",
      "state": "draft" | "submitted" | "approved" | "rejected" | "paid",
      "created_at": "string"
    }
  ]
}
```

### GET `/commissions/summary/`
**Purpose**: Get commission stats  
**Required Role**: Authenticated  
**Response**: Varies by role

### POST `/commissions/create/`
**Purpose**: Submit new commission  
**Required Role**: Consultant  
**Request**:
```json
{
  "clientName": "string",
  "productType": "string",
  "paymentDate": "YYYY-MM-DD",
  "grossRevenue": number,
  "sfa": number,
  "tiering": number,
  "referralPercentage": number (optional),
  "referralName": "string" (optional),
  "probationIncentive": number (optional),
  "otherClaimsAmount": number (optional),
  "otherClaimsRemarks": "string" (optional),
  "gstPaid": "yes" | "no"
}
```

### POST `/commissions/{id}/approve/`
**Purpose**: Approve commission  
**Required Role**: Manager/Admin  

### POST `/commissions/{id}/reject/`
**Purpose**: Reject commission  
**Required Role**: Manager/Admin  
**Request**:
```json
{
  "rejection_reason": "string"
}
```

### GET `/commissions/approvals/pending/`
**Purpose**: Get pending approvals for manager  
**Required Role**: Manager  
**Response**:
```json
{
  "count": number,
  "results": [
    {
      "id": number,
      "commission": { /* commission object */ },
      "created_at": "string"
    }
  ]
}
```

---

## F4 - Payouts Endpoints

### GET `/payouts/my-payouts/`
**Purpose**: Get user's payouts  
**Required Role**: Consultant  
**Response**:
```json
{
  "count": number,
  "results": [
    {
      "id": number,
      "batch_name": "string",
      "period_start": "string",
      "period_end": "string",
      "total_amount": "string",
      "status": "pending" | "approved" | "paid",
      "paid_date": "string"
    }
  ]
}
```

### GET `/payouts/{id}/`
**Purpose**: Get payout detail  
**Required Role**: Consultant  

---

## F5 - Analytics Endpoints

### GET `/analytics/dashboards/consultant/`
**Purpose**: Consultant dashboard analytics  
**Required Role**: Consultant  
**Query Params**: `months` (default 6)  
**Response**:
```json
{
  "summary": {
    "total_paid_ytd": "string",
    "pending_amount": "string",
    "w9_status": "string",
    "tax_docs_count": number
  },
  "earnings_trend": [
    {
      "month": "string",
      "total": "string",
      "count": number
    }
  ],
  "recent_payouts": [
    {
      "date": "string",
      "amount": "string",
      "status": "string"
    }
  ],
  "computed_at": "string"
}
```

### GET `/analytics/dashboards/manager/`
**Purpose**: Manager dashboard analytics  
**Required Role**: Manager  
**Query Params**: `months` (default 6)  
**Response**:
```json
{
  "summary": {
    "team_total_ytd": "string",
    "team_size": number,
    "pending_approvals": number
  },
  "team_trend": [ /* TrendItem[] */ ],
  "top_team_members": [
    {
      "rank": number,
      "consultant_id": number,
      "name": "string",
      "total": "string"
    }
  ],
  "computed_at": "string"
}
```

### GET `/analytics/dashboards/finance/`
**Purpose**: Finance dashboard analytics  
**Required Role**: Finance/Admin  
**Query Params**: `year`, `months` (default 12)  
**Response**:
```json
{
  "summary": {
    "total_paid_ytd": "string",
    "outstanding_liability": "string",
    "payment_success_rate": "string",
    "avg_cycle_days": "string"
  },
  "commission_trend": [ /* TrendItem[] */ ],
  "top_performers": [ /* Performer[] */ ],
  "reconciliation_status": {
    "matched": number,
    "pending": number,
    "discrepancy": number
  },
  "computed_at": "string"
}
```

### GET `/analytics/commissions/pending-count/`
**Purpose**: Real-time pending count for manager  
**Required Role**: Manager  
**Response**:
```json
{
  "pending_count": number,
  "pending_amount": "string",
  "as_of": "string"
}
```

---

## F6 - Notifications Endpoints

### GET `/notifications/inbox/`
**Purpose**: Get user's notifications  
**Required Role**: Authenticated  
**Query Params**: `status` ("UNREAD" | "READ" | "ARCHIVED"), `priority`, `limit`, `offset`, `ordering`  
**Response**:
```json
{
  "count": number,
  "results": [
    {
      "id": number,
      "event_type": "string",
      "title": "string",
      "message": "string",
      "priority": "NORMAL" | "HIGH" | "CRITICAL",
      "status": "UNREAD" | "READ" | "ARCHIVED",
      "action_url": "string | null",
      "created_at": "string",
      "read_at": "string | null",
      "archived_at": "string | null"
    }
  ]
}
```

### GET `/notifications/inbox/unread-count/`
**Purpose**: Get unread notification count  
**Required Role**: Authenticated  
**Response**:
```json
{
  "unread_count": number,
  "high_priority_count": number
}
```

### POST `/notifications/inbox/{id}/read/`
**Purpose**: Mark notification as read  
**Required Role**: Authenticated (owner only)  

### POST `/notifications/inbox/{id}/archive/`
**Purpose**: Archive notification  
**Required Role**: Authenticated (owner only)  

### POST `/notifications/inbox/mark-all-read/`
**Purpose**: Mark all notifications as read  
**Required Role**: Authenticated  
**Response**:
```json
{
  "updated_count": number
}
```

---

## Global Error Responses

### 401 Unauthorized
Triggers automatic token refresh. If refresh fails, redirects to `/login`.

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "string",
  "status_code": 403
}
```
Frontend redirects to `/access-denied`.

### 422 Validation Error
```json
{
  "field_name": ["error message"]
}
```
Frontend displays field-level errors.

### 500 Server Error
Frontend shows graceful error toast and allows retry.

---

## Authentication Flow

1. All API requests automatically include `Authorization: Bearer {token}` header
2. On 401 response, frontend attempts token refresh using refresh token
3. If refresh succeeds, original request is retried
4. If refresh fails, user is redirected to `/login`
5. On 403 response, user is redirected to `/access-denied` (stays logged in)

---

## Rate Limiting

Backend APIs may implement rate limiting. Frontend handles 429 responses by:
- Showing error message to user
- Respecting `Retry-After` header if provided

---

## Notes

- All dates should be in ISO 8601 format
- All monetary amounts are strings to preserve decimal precision
- Pagination uses `limit` and `offset` parameters
- All endpoints require authentication unless specified as "public"
- Role-based access is enforced on backend - frontend provides UX only

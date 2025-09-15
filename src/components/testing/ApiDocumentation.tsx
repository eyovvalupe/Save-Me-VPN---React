import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  ContentCopy,
  PlayArrow,
} from '@mui/icons-material';

interface ApiEndpointDoc {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authentication: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }[];
  requestBody?: {
    type: string;
    description: string;
    example: any;
  };
  responses: {
    status: number;
    description: string;
    example: any;
  }[];
  notes?: string[];
}

export const ApiDocumentation: React.FC = () => {
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  const apiEndpoints: ApiEndpointDoc[] = [
    {
      id: 'get-plans',
      name: 'Get Subscription Plans',
      method: 'GET',
      path: '/api/plans',
      description: 'Retrieve all available subscription plans with pricing and details.',
      authentication: true,
      responses: [
        {
          status: 200,
          description: 'Successfully retrieved plans',
          example: {
            plans: [
              {
                pid: 'monthly_basic',
                name: 'Basic Monthly',
                description: 'Basic VPN plan for 1 month',
                price: 9.99,
                currency: 'USD',
                duration: 1,
                durationUnit: 'month',
                features: ['Unlimited bandwidth', '50+ servers', '24/7 support'],
                isActive: true,
                discount: {
                  percentage: 10,
                  validUntil: '2024-12-31T23:59:59Z'
                }
              }
            ]
          }
        },
        {
          status: 401,
          description: 'Unauthorized - Invalid access key',
          example: { error: 'Invalid access key' }
        }
      ]
    },
    {
      id: 'get-latest-invite-code',
      name: 'Get Latest Invite Code',
      method: 'GET',
      path: '/api/invite/my-codes/latest',
      description: 'Get the latest invite code or create a new one if none exists.',
      authentication: true,
      responses: [
        {
          status: 200,
          description: 'Latest invite code retrieved',
          example: {
            code: 'ABC123XYZ',
            isActive: true,
            createdAt: '2024-01-15T10:30:00Z',
            downloadCount: 25,
            purchaseCount: 5,
            remark: 'Main invite code'
          }
        }
      ]
    },
    {
      id: 'list-invite-codes',
      name: 'List Invite Codes',
      method: 'GET',
      path: '/api/invite/my-codes',
      description: 'Get paginated list of invite codes with statistics.',
      authentication: true,
      parameters: [
        {
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number (0-based)',
          example: 0
        },
        {
          name: 'pageSize',
          type: 'integer',
          required: false,
          description: 'Number of items per page',
          example: 10
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Invite codes retrieved successfully',
          example: {
            inviteCodes: [
              {
                code: 'ABC123XYZ',
                isActive: true,
                createdAt: '2024-01-15T10:30:00Z',
                downloadCount: 25,
                purchaseCount: 5,
                remark: 'Main invite code'
              }
            ],
            totalCount: 1,
            page: 0,
            pageSize: 10
          }
        }
      ]
    },
    {
      id: 'create-invite-code',
      name: 'Create Invite Code',
      method: 'POST',
      path: '/api/invite/my-codes',
      description: 'Create a new invite code.',
      authentication: true,
      responses: [
        {
          status: 201,
          description: 'Invite code created successfully',
          example: {
            code: 'NEW123CODE',
            isActive: true,
            createdAt: '2024-01-15T10:30:00Z',
            downloadCount: 0,
            purchaseCount: 0,
            remark: null
          }
        }
      ]
    },
    {
      id: 'grant-subscription',
      name: 'Grant Subscription',
      method: 'POST',
      path: '/api/retail/grant-subscription',
      description: 'Grant a subscription to a user using an invite code.',
      authentication: true,
      requestBody: {
        type: 'application/json',
        description: 'Subscription grant details',
        example: {
          email: 'user@example.com',
          inviteCode: 'ABC123XYZ',
          planPid: 'monthly_basic',
          quantity: 1,
          dryRun: true
        }
      },
      responses: [
        {
          status: 200,
          description: 'Subscription granted successfully',
          example: {
            success: true,
            message: 'Subscription granted successfully',
            transactionId: 'txn_1234567890',
            subscriptionDetails: {
              planName: 'Basic Monthly',
              duration: 1,
              totalCost: 9.99,
              currency: 'USD'
            }
          }
        },
        {
          status: 400,
          description: 'Bad request - Invalid parameters',
          example: {
            success: false,
            message: 'Invalid email address',
            errors: ['Email is required', 'Plan not found']
          }
        }
      ],
      notes: [
        'Use dryRun: true for testing without creating actual subscriptions',
        'Quantity represents the number of months (1-12)',
        'The invite code must be active and belong to the distributor'
      ]
    },
    {
      id: 'get-invited-users',
      name: 'Get Invited Users',
      method: 'GET',
      path: '/api/invite/my-users',
      description: 'Get list of users invited by the distributor.',
      authentication: true,
      parameters: [
        {
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number (0-based)',
          example: 0
        },
        {
          name: 'pageSize',
          type: 'integer',
          required: false,
          description: 'Number of items per page',
          example: 10
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Invited users retrieved successfully',
          example: {
            users: [
              {
                email: 'user@example.com',
                inviteCode: 'ABC123XYZ',
                registeredAt: '2024-01-15T10:30:00Z',
                hasPurchased: true,
                totalPurchases: 2
              }
            ],
            totalCount: 1,
            page: 0,
            pageSize: 10
          }
        }
      ]
    }
  ];

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'primary';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        API Documentation
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Base URL:</strong> Your configured API base URL<br />
          <strong>Authentication:</strong> All endpoints require X-Access-Key header<br />
          <strong>Content-Type:</strong> application/json for POST/PUT requests
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authentication
          </Typography>
          <Typography variant="body2" paragraph>
            All API endpoints require authentication using the X-Access-Key header:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
            <Typography variant="body2">
              X-Access-Key: your-access-key-here
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {apiEndpoints.map((endpoint) => (
        <Accordion
          key={endpoint.id}
          expanded={expandedPanel === endpoint.id}
          onChange={handlePanelChange(endpoint.id)}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip
                label={endpoint.method}
                color={getMethodColor(endpoint.method) as any}
                size="small"
              />
              {endpoint.authentication && (
                <Chip label="AUTH" color="warning" size="small" />
              )}
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {endpoint.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {endpoint.path}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" paragraph>
                  {endpoint.description}
                </Typography>
              </Grid>

              {endpoint.parameters && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Parameters
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Required</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Example</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {endpoint.parameters.map((param) => (
                          <TableRow key={param.name}>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{param.name}</TableCell>
                            <TableCell>{param.type}</TableCell>
                            <TableCell>
                              <Chip
                                label={param.required ? 'Yes' : 'No'}
                                color={param.required ? 'error' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{param.description}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {param.example !== undefined ? JSON.stringify(param.example) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}

              {endpoint.requestBody && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Request Body
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {endpoint.requestBody.description}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', position: 'relative' }}>
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.875rem' }}>
                      {JSON.stringify(endpoint.requestBody.example, null, 2)}
                    </Typography>
                    <Tooltip title="Copy example">
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => copyToClipboard(JSON.stringify(endpoint.requestBody!.example, null, 2))}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Responses
                </Typography>
                {endpoint.responses.map((response, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={response.status}
                        color={getStatusColor(response.status) as any}
                        size="small"
                      />
                      <Typography variant="body2">
                        {response.description}
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', position: 'relative' }}>
                      <Typography variant="body2" component="pre" sx={{ fontSize: '0.875rem' }}>
                        {JSON.stringify(response.example, null, 2)}
                      </Typography>
                      <Tooltip title="Copy example">
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2))}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  </Box>
                ))}
              </Grid>

              {endpoint.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Alert severity="info">
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {endpoint.notes.map((note, index) => (
                        <li key={index}>
                          <Typography variant="body2">{note}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

# Backend Server Reference for Email Verification

This is a reference implementation for the backend server that handles email verification codes.

## Server Code (server.js)

```javascript
// Example server.js for handling email verification codes
// This is a reference implementation - customize as needed for your backend

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Store verification codes temporarily (in production, use a database)
const verificationCodes = new Map();

// Register endpoint - sends verification code
app.post('/register', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a 4-digit verification code
  const code = Math.floor(1000 + Math.random() * 9000);

  // Store the code (expires after 10 minutes in production)
  verificationCodes.set(email, {
    code,
    timestamp: Date.now()
  });

  console.log(`Verification code for ${email}: ${code}`);

  // In production, send this code via email
  // For now, just return it in the response
  res.json({
    success: true,
    code,
    message: 'Verification code sent to email'
  });
});

// Forgot password endpoint - sends verification code
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000);

  // Store the code
  verificationCodes.set(email, {
    code,
    timestamp: Date.now()
  });

  console.log(`Password reset code for ${email}: ${code}`);

  // In production, send this code via email
  res.json({
    success: true,
    code,
    message: 'Verification code sent to email'
  });
});

// Verify code endpoint (optional - for server-side verification)
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  const stored = verificationCodes.get(email);

  if (!stored) {
    return res.status(404).json({ error: 'No verification code found' });
  }

  // Check if code matches
  if (stored.code === parseInt(code)) {
    // Clear the code after successful verification
    verificationCodes.delete(email);
    return res.json({ success: true, message: 'Code verified' });
  } else {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Endpoints:');
  console.log('  POST /register - Send registration verification code');
  console.log('  POST /forgot-password - Send password reset code');
  console.log('  POST /verify-code - Verify a code');
});
```

## Setup Instructions

To run this server:

1. Create a new file called `server.js` in your project root
2. Install dependencies:
   ```bash
   npm install express cors
   ```
3. Run the server:
   ```bash
   node server.js
   ```
4. The server will run on `http://localhost:3000`

## API Endpoints

### POST /register
Sends a verification code for registration.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "code": 1234,
  "message": "Verification code sent to email"
}
```

### POST /forgot-password
Sends a verification code for password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "code": 123456,
  "message": "Verification code sent to email"
}
```

### POST /verify-code (Optional)
Verifies a code on the server side.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code verified"
}
```

## Production Considerations

In production, you should:
- Use a real email service (SendGrid, AWS SES, Mailgun, etc.)
- Store codes in a database (Redis, MongoDB, PostgreSQL) with expiration
- Add rate limiting to prevent abuse
- Use HTTPS
- Implement proper security measures
- Hash/encrypt sensitive data
- Add logging and monitoring
- Implement proper error handling

## Email Service Integration Example

```javascript
// Using SendGrid as an example
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(email, code) {
  const msg = {
    to: email,
    from: 'noreply@yourapp.com',
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<strong>Your verification code is: ${code}</strong>`,
  };

  await sgMail.send(msg);
}
```

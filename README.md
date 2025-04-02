# Vulnerable Test Application

This is an intentionally vulnerable web application created for security testing and learning purposes. **DO NOT USE IN PRODUCTION!**

## Vulnerabilities Present

1. **SQL Injection**
   - Location: `/login` endpoint
   - Vector: Unsanitized user input in SQL query
   - Example: `' OR '1'='1`

2. **Command Injection**
   - Location: `/ping` endpoint
   - Vector: Unsanitized user input in system command
   - Example: `google.com && dir`

3. **Stored XSS (Cross-Site Scripting)**
   - Location: Notes feature
   - Vector: Unsanitized note content
   - Example: `<script>alert(document.cookie)</script>`

4. **Insecure Session Management**
   - Location: Cookie handling
   - Issue: Non-httpOnly cookies, no session tokens
   - Vector: Client-side cookie manipulation

5. **Information Disclosure**
   - Location: `/debug` endpoint
   - Issue: Exposes sensitive system information
   - Vector: Direct access to endpoint

6. **Plain Text Password Storage**
   - Location: Database
   - Issue: Passwords stored without hashing

## Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the application:
   ```bash
   yarn start
   ```

3. Access the application at `http://localhost:3000`

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Warning

This application contains intentional security vulnerabilities for educational purposes. DO NOT:
- Deploy this application in a production environment
- Use any of the code patterns demonstrated here in real applications
- Expose this application to the public internet

## Testing the Vulnerabilities

1. **SQL Injection Test**
   - Try logging in with: `' OR '1'='1` as both username and password

2. **Command Injection Test**
   - In the ping tool, try: `google.com && dir` (Windows) or `google.com && ls` (Unix)

3. **XSS Test**
   - Add a note with: `<script>alert(document.cookie)</script>`

4. **Session Hijacking Test**
   - Inspect the cookies in browser dev tools
   - Try modifying the user cookie value

5. **Information Disclosure Test**
   - Visit the `/debug` endpoint to see exposed system information 
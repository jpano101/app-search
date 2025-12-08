# QA Test Plan: User Authentication System

## 🐛 **CRITICAL BUG IDENTIFIED**

**Bug Location**: `user_auth.py`, line 52-55 in `_validate_password()` method

**Bug Description**: Password validation uses OR logic instead of AND logic, making it accept weak passwords that only meet one requirement instead of all requirements.

**Security Impact**: HIGH - Allows users to register with extremely weak passwords like "12345678" or "password"

---

## Test Execution Steps

### Prerequisites
1. Ensure Python 3.6+ is installed
2. Place `user_auth.py` and `test_user_auth.py` in the same directory
3. No external dependencies required (uses only standard library)

### Automated Testing

#### Step 1: Run Unit Tests
```bash
python test_user_auth.py
```

**Expected Results:**
- ❌ `test_password_validation_bug` will FAIL (this reveals the bug)
- ✅ Other tests should pass
- The failure demonstrates that weak passwords are incorrectly accepted

#### Step 2: Run Manual Test Scenarios
The script automatically runs manual tests after unit tests complete.

**Expected Output:**
```
1. Testing Password Validation Bug:
✅ PASS | Password: 'onlylowercase' | Should fail: only lowercase letters
✅ PASS | Password: 'ONLYUPPERCASE' | Should fail: only uppercase letters  
✅ PASS | Password: '12345678' | Should fail: only numbers
✅ PASS | Password: '!@#$%^&*()' | Should fail: only special characters
✅ PASS | Password: 'ValidPass123!' | Should pass: meets all requirements
```

**🚨 BUG EVIDENCE**: The first 4 passwords show "PASS" but should show "FAIL"

### Manual Testing Scenarios

#### Test Case 1: Password Validation Bug
**Objective**: Verify that weak passwords are incorrectly accepted

**Steps:**
1. Run `python user_auth.py` 
2. Observe that user "testuser" with password "weak" is successfully registered
3. **Expected**: Registration should fail due to weak password
4. **Actual**: Registration succeeds (BUG!)

#### Test Case 2: Security Vulnerability Test
**Objective**: Demonstrate the security risk

**Test Data:**
| Password | Should Be | Actual Result | Security Risk |
|----------|-----------|---------------|---------------|
| `lowercase` | ❌ REJECTED | ✅ ACCEPTED | HIGH |
| `UPPERCASE` | ❌ REJECTED | ✅ ACCEPTED | HIGH |
| `12345678` | ❌ REJECTED | ✅ ACCEPTED | CRITICAL |
| `!@#$%^&*` | ❌ REJECTED | ✅ ACCEPTED | HIGH |

**Steps:**
1. Attempt to register users with each password above
2. Verify that all are incorrectly accepted
3. Attempt to login with these weak passwords
4. Confirm successful authentication with weak credentials

#### Test Case 3: Boundary Testing
**Objective**: Test edge cases around password requirements

**Steps:**
1. Test minimum length (7 chars): `Aa1!567` → Should fail ✅
2. Test exactly 8 chars with one requirement: `Aa111111` → Should fail but passes ❌
3. Test 8+ chars with all requirements: `Aa1!5678` → Should pass ✅

#### Test Case 4: Regression Testing
**Objective**: Ensure other functionality works correctly

**Steps:**
1. Test duplicate username prevention ✅
2. Test email validation ✅  
3. Test login with correct/incorrect passwords ✅
4. Test password change functionality ✅

### Performance Testing

#### Test Case 5: File I/O Operations
**Steps:**
1. Register 100 users rapidly
2. Verify users.json file integrity
3. Test concurrent access (if applicable)

### Security Testing

#### Test Case 6: Password Storage
**Steps:**
1. Register a user with password "TestPass123!"
2. Check users.json file
3. Verify password is hashed (not stored in plaintext) ✅
4. Verify hash is SHA256 format ✅

#### Test Case 7: Authentication Bypass Attempts
**Steps:**
1. Attempt login with empty username/password
2. Attempt login with SQL injection patterns
3. Attempt login with non-existent users

---

## Bug Fix Verification

### After Fix Implementation
Once the bug is fixed (changing OR to AND in line 52), re-run tests:

**Expected Results:**
- ✅ All unit tests should pass
- ❌ Weak passwords should be rejected
- ✅ Strong passwords should still be accepted

### Fix Validation Steps
1. Change line 52 from: `if has_upper or has_lower or has_digit or has_special:`
2. To: `if has_upper and has_lower and has_digit and has_special:`
3. Re-run all tests
4. Verify security vulnerability is resolved

---

## Test Environment

**Operating System**: Any (Python cross-platform)
**Python Version**: 3.6+
**Dependencies**: None (standard library only)
**Test Data**: Temporary files (auto-cleanup)

---

## Risk Assessment

| Risk Level | Issue | Impact |
|------------|-------|---------|
| 🔴 CRITICAL | Weak password acceptance | Account compromise |
| 🟡 MEDIUM | No rate limiting | Brute force attacks |
| 🟢 LOW | Basic email validation | Invalid email storage |

---

## Recommendations

1. **IMMEDIATE**: Fix password validation logic (OR → AND)
2. **SHORT TERM**: Add password strength meter
3. **MEDIUM TERM**: Implement rate limiting
4. **LONG TERM**: Add 2FA support

---

## Test Execution Checklist

- [ ] Run automated unit tests
- [ ] Execute manual test scenarios  
- [ ] Verify bug reproduction
- [ ] Document security implications
- [ ] Test fix implementation
- [ ] Perform regression testing
- [ ] Update documentation

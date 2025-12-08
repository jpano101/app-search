"""
Test Suite for User Authentication System
This file contains comprehensive test cases to identify bugs in the authentication system.
"""

import os
import tempfile
import unittest
from user_auth import UserAuthenticator


class TestUserAuthenticator(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test"""
        # Use a temporary file for testing
        self.temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.json')
        self.temp_file.close()
        self.auth = UserAuthenticator(self.temp_file.name)
    
    def tearDown(self):
        """Clean up after each test"""
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
    
    def test_password_validation_bug(self):
        """
        Test Case: Password Validation Logic Bug
        Expected: Strong password requirements should be enforced
        Actual: Weak passwords are accepted due to OR logic instead of AND
        """
        print("\n=== Testing Password Validation Bug ===")
        
        # Test cases that should FAIL but currently PASS due to the bug
        weak_passwords = [
            "lowercase",  # Only lowercase - should fail
            "UPPERCASE",  # Only uppercase - should fail  
            "12345678",   # Only digits - should fail
            "!@#$%^&*",   # Only special chars - should fail
        ]
        
        for password in weak_passwords:
            success, message = self.auth.register_user(f"user_{password[:3]}", password, "test@example.com")
            print(f"Password '{password}': Success={success}, Message='{message}'")
            
            # This assertion will FAIL, revealing the bug
            self.assertFalse(success, f"Weak password '{password}' should be rejected but was accepted!")
    
    def test_proper_password_validation(self):
        """Test that truly strong passwords are accepted"""
        strong_passwords = [
            "StrongPass123!",
            "MySecure@Pass1",
            "Complex#Password9"
        ]
        
        for password in strong_passwords:
            success, message = self.auth.register_user(f"user_{len(password)}", password, "test@example.com")
            self.assertTrue(success, f"Strong password '{password}' should be accepted")
    
    def test_minimum_length_requirement(self):
        """Test minimum password length requirement"""
        short_passwords = ["1234567", "Aa1!", "short"]
        
        for password in short_passwords:
            success, message = self.auth.register_user(f"user_{len(password)}", password, "test@example.com")
            self.assertFalse(success, f"Short password '{password}' should be rejected")
            self.assertIn("8 characters", message)
    
    def test_user_registration_normal_flow(self):
        """Test normal user registration flow"""
        success, message = self.auth.register_user("normaluser", "ValidPass123!", "user@example.com")
        self.assertTrue(success)
        self.assertEqual(message, "User registered successfully")
    
    def test_duplicate_username(self):
        """Test duplicate username handling"""
        # Register first user
        self.auth.register_user("duplicate", "ValidPass123!", "user1@example.com")
        
        # Try to register with same username
        success, message = self.auth.register_user("duplicate", "AnotherPass456!", "user2@example.com")
        self.assertFalse(success)
        self.assertIn("already exists", message)
    
    def test_login_functionality(self):
        """Test login with correct and incorrect credentials"""
        # Register a user first
        self.auth.register_user("logintest", "ValidPass123!", "login@example.com")
        
        # Test correct login
        success, message = self.auth.login("logintest", "ValidPass123!")
        self.assertTrue(success)
        
        # Test incorrect password
        success, message = self.auth.login("logintest", "WrongPassword")
        self.assertFalse(success)
        
        # Test non-existent user
        success, message = self.auth.login("nonexistent", "AnyPassword")
        self.assertFalse(success)
    
    def test_email_validation(self):
        """Test email format validation"""
        invalid_emails = ["notanemail", "missing@domain", "missing.at.symbol"]
        
        for email in invalid_emails:
            success, message = self.auth.register_user(f"user_{len(email)}", "ValidPass123!", email)
            self.assertFalse(success, f"Invalid email '{email}' should be rejected")


def run_manual_tests():
    """
    Manual test scenarios to demonstrate the bug
    """
    print("=" * 60)
    print("MANUAL QA TEST SCENARIOS")
    print("=" * 60)
    
    auth = UserAuthenticator("test_users.json")
    
    print("\n1. Testing Password Validation Bug:")
    print("-" * 40)
    
    # These should fail but will pass due to the bug
    test_cases = [
        ("onlylowercase", "Should fail: only lowercase letters"),
        ("ONLYUPPERCASE", "Should fail: only uppercase letters"), 
        ("12345678", "Should fail: only numbers"),
        ("!@#$%^&*()", "Should fail: only special characters"),
        ("ValidPass123!", "Should pass: meets all requirements")
    ]
    
    for password, description in test_cases:
        success, message = auth.register_user(f"test_{len(password)}", password, "test@example.com")
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | Password: '{password}' | {description}")
        print(f"     Result: {message}")
        print()
    
    print("\n2. Testing Login with Weak Passwords:")
    print("-" * 40)
    
    # Try to login with the weak passwords that were incorrectly accepted
    weak_passwords = ["onlylowercase", "ONLYUPPERCASE", "12345678"]
    
    for password in weak_passwords:
        success, message = auth.login(f"test_{len(password)}", password)
        if success:
            print(f"🚨 SECURITY ISSUE: User with weak password '{password}' can login!")
        else:
            print(f"✅ User with password '{password}' cannot login (user may not exist)")
    
    # Clean up test file
    if os.path.exists("test_users.json"):
        os.remove("test_users.json")


if __name__ == "__main__":
    print("Running automated tests...")
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    print("\n" + "=" * 60)
    print("Running manual test scenarios...")
    run_manual_tests()

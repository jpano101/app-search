"""
User Authentication System
A simple authentication system with user registration and login functionality.
"""

import hashlib
import json
import os
from typing import Dict, Optional, Tuple


class UserAuthenticator:
    def __init__(self, users_file: str = "users.json"):
        self.users_file = users_file
        self.users = self._load_users()
    
    def _load_users(self) -> Dict[str, Dict]:
        """Load users from JSON file"""
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {}
        return {}
    
    def _save_users(self) -> None:
        """Save users to JSON file"""
        try:
            with open(self.users_file, 'w') as f:
                json.dump(self.users, f, indent=2)
        except IOError as e:
            raise Exception(f"Failed to save users: {e}")
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _validate_password(self, password: str) -> Tuple[bool, str]:
        """
        Validate password requirements
        BUG: This function has a logical error in password validation
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        # BUG: Using OR instead of AND - this makes validation too lenient
        if has_upper or has_lower or has_digit or has_special:
            return True, "Password is valid"
        else:
            return False, "Password must contain uppercase, lowercase, digit, and special character"
    
    def register_user(self, username: str, password: str, email: str) -> Tuple[bool, str]:
        """Register a new user"""
        if not username or not password or not email:
            return False, "All fields are required"
        
        if username in self.users:
            return False, "Username already exists"
        
        # Validate email format (basic check)
        if "@" not in email or "." not in email:
            return False, "Invalid email format"
        
        # Validate password
        is_valid, message = self._validate_password(password)
        if not is_valid:
            return False, message
        
        # Store user
        self.users[username] = {
            "password_hash": self._hash_password(password),
            "email": email,
            "active": True
        }
        
        self._save_users()
        return True, "User registered successfully"
    
    def login(self, username: str, password: str) -> Tuple[bool, str]:
        """Authenticate user login"""
        if not username or not password:
            return False, "Username and password are required"
        
        if username not in self.users:
            return False, "Invalid username or password"
        
        user = self.users[username]
        if not user.get("active", True):
            return False, "Account is deactivated"
        
        password_hash = self._hash_password(password)
        if password_hash == user["password_hash"]:
            return True, "Login successful"
        else:
            return False, "Invalid username or password"
    
    def change_password(self, username: str, old_password: str, new_password: str) -> Tuple[bool, str]:
        """Change user password"""
        # First verify current password
        login_success, _ = self.login(username, old_password)
        if not login_success:
            return False, "Current password is incorrect"
        
        # Validate new password
        is_valid, message = self._validate_password(new_password)
        if not is_valid:
            return False, message
        
        # Update password
        self.users[username]["password_hash"] = self._hash_password(new_password)
        self._save_users()
        return True, "Password changed successfully"
    
    def get_user_info(self, username: str) -> Optional[Dict]:
        """Get user information (excluding password)"""
        if username in self.users:
            user_info = self.users[username].copy()
            user_info.pop("password_hash", None)
            return user_info
        return None


# Example usage
if __name__ == "__main__":
    auth = UserAuthenticator()
    
    # Test registration
    print("=== User Registration Test ===")
    success, message = auth.register_user("testuser", "weak", "test@example.com")
    print(f"Registration result: {success}, Message: {message}")
    
    # Test login
    print("\n=== Login Test ===")
    success, message = auth.login("testuser", "weak")
    print(f"Login result: {success}, Message: {message}")
    
    # Display user info
    if success:
        user_info = auth.get_user_info("testuser")
        print(f"User info: {user_info}")

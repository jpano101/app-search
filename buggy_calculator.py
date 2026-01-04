#!/usr/bin/env python3
"""
A simple calculator with a deliberate bug for demonstration purposes.
"""

def add_numbers(a, b):
    """Add two numbers together."""
    return a + b

def subtract_numbers(a, b):
    """Subtract b from a."""
    return a - b

def multiply_numbers(a, b):
    """Multiply two numbers."""
    return a * b

def divide_numbers(a, b):
    """Divide a by b."""
    # BUG: No check for division by zero!
    return a / b

def calculate_average(numbers):
    """Calculate the average of a list of numbers."""
    if len(numbers) == 0:
        return 0
    
    total = 0
    # BUG: Off-by-one error in the loop!
    for i in range(len(numbers) - 1):  # Should be range(len(numbers))
        total += numbers[i]
    
    return total / len(numbers)

def find_maximum(numbers):
    """Find the maximum number in a list."""
    if not numbers:
        return None
    
    max_num = numbers[0]
    # BUG: Starting from index 0 instead of 1, causing unnecessary comparison
    for i in range(0, len(numbers)):  # Should start from 1
        if numbers[i] > max_num:
            max_num = numbers[i]
    
    return max_num

def factorial(n):
    """Calculate factorial of n."""
    if n < 0:
        return None  # Factorial not defined for negative numbers
    
    # BUG: Missing base case for n = 0!
    if n == 1:  # Should also check for n == 0
        return 1
    
    return n * factorial(n - 1)

def main():
    """Main function to demonstrate the buggy calculator."""
    print("Buggy Calculator Demo")
    print("====================")
    
    # Test basic operations
    print(f"5 + 3 = {add_numbers(5, 3)}")
    print(f"10 - 4 = {subtract_numbers(10, 4)}")
    print(f"6 * 7 = {multiply_numbers(6, 7)}")
    
    # This will crash due to division by zero bug!
    try:
        print(f"8 / 0 = {divide_numbers(8, 0)}")
    except ZeroDivisionError:
        print("Error: Division by zero!")
    
    # Test average calculation (will give wrong result due to off-by-one error)
    test_numbers = [1, 2, 3, 4, 5]
    avg = calculate_average(test_numbers)
    print(f"Average of {test_numbers} = {avg}")  # Should be 3.0, but will be 2.0
    
    # Test maximum finding (works but inefficient due to unnecessary comparison)
    max_val = find_maximum(test_numbers)
    print(f"Maximum of {test_numbers} = {max_val}")
    
    # Test factorial (will crash for factorial(0))
    try:
        print(f"Factorial of 5 = {factorial(5)}")
        print(f"Factorial of 0 = {factorial(0)}")  # This will cause infinite recursion!
    except RecursionError:
        print("Error: Infinite recursion in factorial!")

if __name__ == "__main__":
    main()


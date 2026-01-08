#!/usr/bin/env python3
"""
A simple calculator program with a bug!
This program calculates the average of a list of numbers.
"""

def calculate_average(numbers):
    """Calculate the average of a list of numbers."""
    total = 0
    for num in numbers:
        total += num
    
    # BUG: Division by zero when empty list is passed
    average = total / len(numbers)
    return average

def main():
    print("🐕 Best Doggo Calculator! 🐕")
    print("Enter numbers to calculate their average (or 'done' to finish):")
    
    numbers = []
    while True:
        user_input = input("Enter a number: ").strip()
        if user_input.lower() == 'done':
            break
        
        try:
            number = float(user_input)
            numbers.append(number)
        except ValueError:
            print("Please enter a valid number or 'done' to finish.")
    
    if numbers:
        avg = calculate_average(numbers)
        print(f"The average is: {avg:.2f}")
    else:
        # This will cause a ZeroDivisionError!
        avg = calculate_average(numbers)
        print(f"The average is: {avg:.2f}")

if __name__ == "__main__":
    main()


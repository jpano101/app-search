"""
A simple calculator with intentional bugs for demonstration purposes.
"""

def divide_numbers(a, b):
    """
    Divides two numbers and returns the result.
    BUG: No check for division by zero!
    """
    return a / b

def calculate_average(numbers):
    """
    Calculates the average of a list of numbers.
    BUG: Doesn't handle empty lists!
    """
    total = sum(numbers)
    return total / len(numbers)

def find_maximum(numbers):
    """
    Finds the maximum number in a list.
    BUG: Assumes list is not empty and contains only numbers!
    """
    max_num = numbers[0]
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

def factorial(n):
    """
    Calculates factorial of a number.
    BUG: No validation for negative numbers or non-integers!
    """
    if n == 0:
        return 1
    return n * factorial(n - 1)

def get_user_age():
    """
    Gets user age from input.
    BUG: No validation for non-numeric input!
    """
    age = input("Enter your age: ")
    return int(age)

# Example usage with potential crashes:
if __name__ == "__main__":
    print("Buggy Calculator Demo")
    
    # This will crash with ZeroDivisionError
    # result = divide_numbers(10, 0)
    
    # This will crash with ZeroDivisionError  
    # avg = calculate_average([])
    
    # This will crash with IndexError
    # max_val = find_maximum([])
    
    # This will cause RecursionError for negative numbers
    # fact = factorial(-5)
    
    # This will crash with ValueError for non-numeric input
    # age = get_user_age()
    
    print("Code created with intentional bugs for educational purposes!")


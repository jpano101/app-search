# Lifestyle Offerings Search Service

This repository contains sample code for implementing sort options (relevance, rating, proximity) for lifestyle offerings search functionality.

## Files

- `search_service.py` - Main search service implementation with sorting functionality
- `test_search_bug.py` - Test file that demonstrates the proximity sorting bug

## Features

The search service supports three sorting options:

1. **Relevance** - Sorts by relevance score (highest first) ✅
2. **Rating** - Sorts by user rating (highest first) ✅  
3. **Proximity** - Sorts by distance from user location (nearest first) ❌ **HAS BUG**

## Known Bug 🐛

**Issue**: The proximity sorting is implemented incorrectly in `search_service.py` line 80.

**Problem**: The code uses `reverse=True` when sorting by distance, which causes the farthest locations to appear first instead of the nearest locations.

**Current behavior**: 
```python
# BUG: reverse=True makes it sort farthest first instead of nearest first
sorted_offerings = sorted(offerings_with_distance, key=lambda x: x[1], reverse=True)
```

**Expected behavior**: Should sort with `reverse=False` or omit the reverse parameter entirely to show nearest locations first.

## Running the Code

```bash
# Run the main example
python search_service.py

# Run the bug demonstration
python test_search_bug.py
```

## Example Output (showing the bug)

When running `test_search_bug.py`, you'll see:

```
=== PROXIMITY SORTING BUG DEMONSTRATION ===
Expected order: Close Gym → Medium Spa → Far Studio
Actual order (due to bug):
1. Far Studio - Distance: 6.12 km
2. Medium Spa - Distance: 0.51 km  
3. Close Gym - Distance: 0.04 km

BUG CONFIRMED: Distances are sorted in descending order: [6.12, 0.51, 0.04]
This means users see the FARTHEST locations first, which is incorrect!
```

This bug would significantly impact user experience as users would see the most distant lifestyle offerings first when sorting by proximity, which is the opposite of what they expect.

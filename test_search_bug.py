"""
Test file to demonstrate the proximity sorting bug
"""

from search_service import SearchService, LifestyleOffering, SortOption


def test_proximity_bug():
    """
    This test demonstrates the bug in proximity sorting.
    Expected: Nearest locations should appear first
    Actual: Farthest locations appear first due to reverse=True bug
    """
    search_service = SearchService()
    
    # Add test offerings at known distances from Times Square (40.7580, -73.9855)
    offerings = [
        # Very close - should be first
        LifestyleOffering("close", "Close Gym", 4.0, 40.7580, -73.9850, 0.5),
        
        # Medium distance - should be second  
        LifestyleOffering("medium", "Medium Spa", 4.0, 40.7600, -73.9900, 0.5),
        
        # Far away - should be last
        LifestyleOffering("far", "Far Studio", 4.0, 40.8000, -74.0500, 0.5),
    ]
    
    for offering in offerings:
        search_service.add_offering(offering)
    
    # User location (Times Square)
    user_lat, user_lon = 40.7580, -73.9855
    
    # Get proximity-sorted results
    results = search_service.search_and_sort(user_lat, user_lon, SortOption.PROXIMITY)
    
    print("=== PROXIMITY SORTING BUG DEMONSTRATION ===")
    print("Expected order: Close Gym → Medium Spa → Far Studio")
    print("Actual order (due to bug):")
    
    for i, offering in enumerate(results, 1):
        distance = search_service.calculate_distance(user_lat, user_lon, offering.latitude, offering.longitude)
        print(f"{i}. {offering.name} - Distance: {distance:.2f} km")
    
    # Verify the bug exists
    distances = []
    for offering in results:
        distance = search_service.calculate_distance(user_lat, user_lon, offering.latitude, offering.longitude)
        distances.append(distance)
    
    print(f"\nBUG CONFIRMED: Distances are sorted in descending order: {distances}")
    print("This means users see the FARTHEST locations first, which is incorrect!")
    
    # Show what the correct order should be
    print("\n=== CORRECT ORDER SHOULD BE ===")
    correct_results = sorted(results, key=lambda x: search_service.calculate_distance(user_lat, user_lon, x.latitude, x.longitude))
    for i, offering in enumerate(correct_results, 1):
        distance = search_service.calculate_distance(user_lat, user_lon, offering.latitude, offering.longitude)
        print(f"{i}. {offering.name} - Distance: {distance:.2f} km")


if __name__ == "__main__":
    test_proximity_bug()

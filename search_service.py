"""
Search Service with Sort Options
Implements sorting by relevance, rating, and proximity for lifestyle offerings
"""

import math
from typing import List, Dict, Any
from enum import Enum


class SortOption(Enum):
    RELEVANCE = "relevance"
    RATING = "rating"
    PROXIMITY = "proximity"


class LifestyleOffering:
    def __init__(self, id: str, name: str, rating: float, latitude: float, longitude: float, relevance_score: float):
        self.id = id
        self.name = name
        self.rating = rating
        self.latitude = latitude
        self.longitude = longitude
        self.relevance_score = relevance_score


class SearchService:
    def __init__(self):
        self.offerings = []
    
    def add_offering(self, offering: LifestyleOffering):
        """Add a lifestyle offering to the search index"""
        self.offerings.append(offering)
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
        # Convert latitude and longitude from degrees to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r
    
    def search_and_sort(self, user_lat: float, user_lon: float, sort_by: SortOption) -> List[LifestyleOffering]:
        """
        Search and sort lifestyle offerings based on the specified criteria
        
        BUG: The proximity sorting is implemented incorrectly - it sorts in ascending order
        instead of descending order, showing farthest items first instead of nearest
        """
        if not self.offerings:
            return []
        
        if sort_by == SortOption.RELEVANCE:
            # Sort by relevance score (highest first)
            return sorted(self.offerings, key=lambda x: x.relevance_score, reverse=True)
        
        elif sort_by == SortOption.RATING:
            # Sort by rating (highest first)
            return sorted(self.offerings, key=lambda x: x.rating, reverse=True)
        
        elif sort_by == SortOption.PROXIMITY:
            # BUG: This should sort by distance in ascending order (nearest first)
            # but it's currently sorting in descending order (farthest first)
            offerings_with_distance = []
            for offering in self.offerings:
                distance = self.calculate_distance(user_lat, user_lon, offering.latitude, offering.longitude)
                offerings_with_distance.append((offering, distance))
            
            # BUG: reverse=True makes it sort farthest first instead of nearest first
            sorted_offerings = sorted(offerings_with_distance, key=lambda x: x[1], reverse=True)
            return [offering for offering, distance in sorted_offerings]
        
        else:
            return self.offerings


# Example usage and test data
def main():
    search_service = SearchService()
    
    # Add sample lifestyle offerings
    offerings = [
        LifestyleOffering("1", "Yoga Studio Downtown", 4.5, 40.7128, -74.0060, 0.9),
        LifestyleOffering("2", "Fitness Center Uptown", 4.2, 40.7831, -73.9712, 0.7),
        LifestyleOffering("3", "Spa & Wellness", 4.8, 40.7589, -73.9851, 0.8),
        LifestyleOffering("4", "Rock Climbing Gym", 4.1, 40.6892, -74.0445, 0.6),
        LifestyleOffering("5", "Meditation Center", 4.7, 40.7505, -73.9934, 0.95)
    ]
    
    for offering in offerings:
        search_service.add_offering(offering)
    
    # User location (Times Square, NYC)
    user_latitude = 40.7580
    user_longitude = -73.9855
    
    print("=== Search Results ===")
    
    # Test relevance sorting
    print("\n1. Sorted by Relevance:")
    relevance_results = search_service.search_and_sort(user_latitude, user_longitude, SortOption.RELEVANCE)
    for offering in relevance_results:
        print(f"  {offering.name} - Relevance: {offering.relevance_score}")
    
    # Test rating sorting
    print("\n2. Sorted by Rating:")
    rating_results = search_service.search_and_sort(user_latitude, user_longitude, SortOption.RATING)
    for offering in rating_results:
        print(f"  {offering.name} - Rating: {offering.rating}")
    
    # Test proximity sorting (this will show the bug)
    print("\n3. Sorted by Proximity (BUG: shows farthest first):")
    proximity_results = search_service.search_and_sort(user_latitude, user_longitude, SortOption.PROXIMITY)
    for offering in proximity_results:
        distance = search_service.calculate_distance(user_latitude, user_longitude, offering.latitude, offering.longitude)
        print(f"  {offering.name} - Distance: {distance:.2f} km")


if __name__ == "__main__":
    main()

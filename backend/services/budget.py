import os
import requests
from dotenv import load_dotenv

load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def calculate_the_budget(avg_cost, distance, no_of_people):

    distance = distance.split()[0]
    distance_f = float(distance)

    cost_per_km_bicycle = 7.5
    cost_per_km_car = 20
    cost_per_km_p_bus = 72
    cost_per_km_transit = 2

    people_per_bike = 2
    people_per_car = 5
    people_per_p_bus = 30
    people_per_transit = 50

    no_of_bikes = no_of_people / people_per_bike
    no_of_cars = no_of_people / people_per_car
    no_of_p_buses = no_of_people / people_per_p_bus
    no_of_transits = no_of_people / people_per_transit

    cost_for_bikes = no_of_bikes * cost_per_km_bicycle * distance_f
    cost_for_cars = no_of_cars * cost_per_km_car * distance_f
    cost_for_p_buses = no_of_p_buses * cost_per_km_p_bus * distance_f
    cost_for_transits = no_of_transits * cost_per_km_transit * distance_f

    prob_dict = transport_probabilities(distance_f, no_of_people)

    predicted_transport_cost = ((cost_for_bikes * prob_dict['bicycle']) + (cost_for_cars * prob_dict['car'])
                                + (cost_for_p_buses * prob_dict['bus']) + (cost_for_transits * prob_dict['transit']))

    predicted_location_cost = no_of_people * avg_cost

    predicted_total_cost = predicted_transport_cost + predicted_location_cost
    rounded_total_cost = round(predicted_total_cost)

    return rounded_total_cost

def cost_for_bicycle(distance, no_of_people):
    cost_per_km_bicycle = 7.5
    people_per_bike = 2
    no_of_bikes = no_of_people / people_per_bike
    cost_for_bikes = no_of_bikes * cost_per_km_bicycle * distance

    return cost_for_bikes


def cost_for_car(distance, no_of_people):
    cost_per_km_car = 20
    people_per_car = 5
    no_of_cars = no_of_people / people_per_car
    cost_for_cars = no_of_cars * cost_per_km_car * distance

    return cost_for_cars

def cost_for_p_bus(distance, no_of_people):
    cost_per_km_p_bus = 72
    people_per_p_bus = 30
    no_of_p_buses = no_of_people / people_per_p_bus
    cost_for_p_buses = no_of_p_buses * cost_per_km_p_bus * distance

    return cost_for_p_buses

def cost_for_transit(distance, no_of_people):
    cost_per_km_transit = 2
    people_per_transit = 50
    no_of_transits = no_of_people / people_per_transit
    cost_for_transits = no_of_transits * cost_per_km_transit * distance

    return cost_for_transits

def get_transit_fare(origin_lat, origin_lng, dest_lat, dest_lng):
    # 6.032, 80.217
    galle_lat = 6.032
    galle_long = 80.217

    url = (
        "https://maps.googleapis.com/maps/api/directions/json"
        f"?origin={origin_lat},{origin_lng}"
        f"&destination={galle_lat},{galle_long}"
        f"&mode=transit"
        f"&key={GOOGLE_MAPS_API_KEY}"
    )

    response = requests.get(url)
    data = response.json()

    if data.get("routes"):
        leg = data["routes"][0]["legs"][0]
        fare = leg.get("fare")
        if fare and fare["currency"] == "LKR":
            return fare["value"]  # e.g., 180.0
        else:
            return None  # fare not available
    else:
        raise Exception("No transit route found.")

def transport_probabilities(D, N):
    def suitability_D_and_N(S_D, N_opt, width):
        S_N = 1 / (1 + ((N - N_opt) / width) ** 2)
        return S_D * S_N

    S_bicycle_D = 1 / (1 + (D / 100) ** 2)
    S_car_D = 1 / (1 + ((D - 50) / 100) ** 2)
    S_bus_D = 1 / (1 + ((D - 150) / 100) ** 2)
    S_transit_D = 1 / (1 + (50 / D) ** 2) if D != 0 else 0

    S_bicycle = suitability_D_and_N(S_bicycle_D, N_opt=6, width=3)
    S_car = suitability_D_and_N(S_car_D, N_opt=7, width=3)
    S_bus = suitability_D_and_N(S_bus_D, N_opt=35, width=10)
    S_transit = suitability_D_and_N(S_transit_D, N_opt=10, width=5)

    total = S_bicycle + S_car + S_bus + S_transit

    return {
        'bicycle': S_bicycle / total,
        'car': S_car / total,
        'bus': S_bus / total,
        'transit': S_transit / total
    }



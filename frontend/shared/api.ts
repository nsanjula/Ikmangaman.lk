/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Temp questionnaire interface for backend API
 * Used for getting destination details with temporary questionnaire data
 */
export interface TempQuestionnaire {
  destination_id: number;
  travel_month: string;
  no_of_people: number;
  start_location: string;
}

/**
 * Standard questionnaire interface for full questionnaire submission
 */
export interface QuestionnaireRequest {
  nature: boolean;
  adventure: boolean;
  luxury: boolean;
  culture: boolean;
  relaxation: boolean;
  wellness: boolean;
  local_life: boolean;
  wild_life: boolean;
  food: boolean;
  spirituality: boolean;
  eco_tourism: boolean;
  travel_month: string;
  no_of_people: number;
  start_location: string;
}

/**
 * New hotel data structure from backend API
 * Contains data for 5 hotels per destination
 */
export interface HotelData {
  city: string;
  hotel_name1: string;
  Price_per_night1: number;
  Availability1: string;
  Rating1: number;
  URL1: string;
  hotel_name2: string;
  Price_per_night2: number;
  Availability2: string;
  Rating2: number;
  URL2: string;
  hotel_name3: string;
  Price_per_night3: number;
  Availability3: string;
  Rating3: number;
  URL3: string;
  hotel_name4: string;
  Price_per_night4: number;
  Availability4: string;
  Rating4: number;
  URL4: string;
  hotel_name5: string;
  Price_per_night5: number;
  Availability5: string;
  Rating5: number;
  URL5: string;
  id: string;
  image_url: string;
}

/**
 * Normalized hotel interface for frontend use
 */
export interface Hotel {
  city: string;
  hotel_name: string;
  price: number;
  availability: string;
  rating: number;
  id: string;
  image_url: string;
  url: string;
}

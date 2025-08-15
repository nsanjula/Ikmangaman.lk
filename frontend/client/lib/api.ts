const API_BASE_URL = "http://localhost:8000"; // Backend FastAPI server

// Helper function to check if response indicates database timeout
const isDatabaseTimeout = (response: Response): boolean => {
  return [502, 503, 504].includes(response.status);
};

// Global timeout handler - can be set by AuthContext
let globalTimeoutHandler: ((error: Error) => void) | null = null;

export const setGlobalTimeoutHandler = (handler: (error: Error) => void) => {
  globalTimeoutHandler = handler;
};

// Helper function to handle database timeouts globally
const handleDatabaseTimeout = (response: Response): void => {
  if (isDatabaseTimeout(response) && globalTimeoutHandler) {
    const error = new Error(`Database timeout occurred (${response.status}). Please try again.`);
    globalTimeoutHandler(error);
  }
};

// Helper function for consistent error handling
const handleAPIError = (error: any, context: string): never => {
  console.error(`API call failed in ${context}:`, error);

  // Check for database timeout indicators
  if (error && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    if (message.includes('database timeout') ||
        message.includes('connection timeout') ||
        message.includes('query timeout') ||
        message.includes('server timeout') ||
        message.includes('database connection') ||
        (error.status && [502, 503, 504].includes(error.status))) {
      throw new Error(`Database timeout occurred. Please try again.`);
    }
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw new Error(
      `Unable to connect to backend server at ${API_BASE_URL}. Please check if the backend is running and CORS is configured correctly.`,
    );
  }
  throw error;
};

// Test connection to backend
export const testConnection = async (): Promise<boolean> => {
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/docs`, {
      method: "HEAD",
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error: any) {
    // Silently return false to avoid spamming console with error messages
    // This is expected when the backend is not running
    return false;
  }
};

// Debug function to test API connectivity
export const debugAPIConnection = async (): Promise<void> => {
  console.log("=== API CONNECTION DEBUG ===");
  console.log("Frontend URL:", window.location.origin);
  console.log("Backend URL:", API_BASE_URL);

  // Test basic connectivity
  try {
    const response = await fetch(`${API_BASE_URL}/docs`);
    console.log("Backend /docs status:", response.status);
  } catch (error) {
    console.error("Failed to reach backend:", error);
  }

  // Test starting-locations without auth
  try {
    const response = await fetch(`${API_BASE_URL}/starting-locations`);
    console.log("Starting locations status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Starting locations data:", data);
    } else {
      const errorText = await response.text();
      console.log("Starting locations error:", errorText);
    }
  } catch (error) {
    console.error("Starting locations fetch failed:", error);
  }
};

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname?: string;
  date_of_birth: string; // Format: YYYY-MM-DD
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

export interface UserProfile {
  firstname: string;
  lastname: string | null;
  date_0f_birth: string; // Note: backend has typo in field name
  username: string;
}

export interface UserUpdateRequest {
  firstname?: string;
  lastname?: string;
  date_of_birth?: string; // Format: YYYY-MM-DD
  password?: string;
}

export interface StartingLocationsResponse {
  locations: string[];
}

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

export interface GuideDetails {
  guide_id: number;
  name: string;
  gender: string;
  contact_no: string;
  photo_url: string;
}

export interface DestinationDetails {
  destination_name: string;
  destination_id: number;
  latitude: number;
  longitude: number;
  description: string;
  "things to do": string[];
  distance: string;
  duration: string;
  "weather data": any;
  "hotel data": any;
  "cost for bicycle": number;
  "cost for car": number;
  "cost for private bus": number;
  "cost for transit": number;
  "guide details": GuideDetails[];
  "destination image": string;
}

export interface Destination {
  destination_id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  things_to_do: string;
  avg_cost: number;
  hill_country: boolean;
  coastal: boolean;
  dry_zone: boolean;
  urban: boolean;
}

export interface BackendRecommendation {
  destination_id: number;
  name: string;
  match_score: number;
  rating_label: string;
  estimated_budget: number;
  distance: string;
  travel_time: string;
  thumbnail_img: string;
}

export type RecommendationsResponse = BackendRecommendation[];

class AuthAPI {
  private backendAvailable: boolean | null = null;
  private lastConnectivityCheck: number = 0;
  private readonly CONNECTIVITY_CHECK_INTERVAL = 30000; // 30 seconds

  private async checkBackendConnectivity(): Promise<boolean> {
    const now = Date.now();

    // Only check connectivity every 30 seconds to avoid spam
    if (
      this.backendAvailable !== null &&
      now - this.lastConnectivityCheck < this.CONNECTIVITY_CHECK_INTERVAL
    ) {
      return this.backendAvailable;
    }

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${API_BASE_URL}/docs`, {
        method: "HEAD",
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      this.backendAvailable = response.ok;
      this.lastConnectivityCheck = now;
      return this.backendAvailable;
    } catch (error) {
      // Any error means backend is not available
      // This is expected when the backend is not running
      this.backendAvailable = false;
      this.lastConnectivityCheck = now;
      return false;
    }
  }

  private getFormData(data: LoginRequest): FormData {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    return formData;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const formData = this.getFormData(credentials);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        handleDatabaseTimeout(response);
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Registration failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  // Helper method to format date from DD/MM/YYYY to YYYY-MM-DD
  formatDateForAPI(dateString: string): string {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Helper method to store token in localStorage
  storeToken(token: string): void {
    console.log(
      "Storing token in localStorage:",
      token ? `Token stored (${token.substring(0, 20)}...)` : "Empty token",
    );
    localStorage.setItem("auth_token", token);
  }

  // Helper method to get token from localStorage
  getToken(): string | null {
    const token = localStorage.getItem("auth_token");
    console.log(
      "Getting token from localStorage:",
      token ? `Token exists (${token.substring(0, 20)}...)` : "No token found",
    );
    return token;
  }

  // Helper method to remove token from localStorage
  removeToken(): void {
    localStorage.removeItem("auth_token");
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getFallbackRecommendations(): RecommendationsResponse {
    return [
      {
        destination_id: 1,
        name: "Sigiriya Rock Fortress",
        match_score: 0.92,
        rating_label: "Excellent",
        estimated_budget: 8500,
        distance: "165 km",
        travel_time: "3.5 hours",
        thumbnail_img: "/destination-image/1",
      },
      {
        destination_id: 2,
        name: "Kandy",
        match_score: 0.88,
        rating_label: "Very Good",
        estimated_budget: 6500,
        distance: "120 km",
        travel_time: "2.5 hours",
        thumbnail_img: "/destination-image/2",
      },
      {
        destination_id: 3,
        name: "Galle Fort",
        match_score: 0.84,
        rating_label: "Very Good",
        estimated_budget: 7200,
        distance: "115 km",
        travel_time: "2 hours",
        thumbnail_img: "/destination-image/3",
      },
    ];
  }

  async getRecommendations(): Promise<RecommendationsResponse> {
    try {
      const token = this.getToken();
      console.log(
        "🔑 Getting recommendations - token:",
        token ? "exists" : "missing",
      );

      if (!token) {
        throw new Error(
          "Authentication required. Please log in to access recommendations.",
        );
      }

      console.log("Making request to:", `${API_BASE_URL}/recommendations`);

      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Recommendations response status:", response.status);

      if (!response.ok) {
        handleDatabaseTimeout(response);
        if (response.status === 401) {
          // Clear invalid token
          this.removeToken();
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Successfully fetched recommendations from API");
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch recommendations:", error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/my-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          this.removeToken();
          throw new Error("Authentication required. Please log in again.");
        }
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Failed to fetch user profile");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  async updateUserProfile(
    profileData: UserUpdateRequest,
  ): Promise<{ message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          this.removeToken();
          throw new Error("Authentication required. Please log in again.");
        }
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Failed to update profile");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  async getStartingLocations(): Promise<StartingLocationsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/starting-locations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch starting locations";
        try {
          const error: ApiError = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch {
          // If response.json() fails, use default error message
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.warn("Starting locations API failed, using fallback:", error);
      // Return fallback starting locations
      return {
        locations: [
          "Colombo",
          "Kandy",
          "Galle",
          "Jaffna",
          "Trincomalee",
          "Anuradhapura",
          "Polonnaruwa",
          "Matara",
          "Batticaloa",
          "Kurunegala"
        ]
      };
    }
  }

  async submitQuestionnaire(
    questionnaireData: QuestionnaireRequest,
  ): Promise<{ status: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/questionnaire`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionnaireData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          this.removeToken();
          throw new Error("Authentication required. Please log in again.");
        }
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Failed to submit questionnaire");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  async getQuestionnaire(): Promise<
    QuestionnaireRequest & {
      starting_location_latitudes: number;
      starting_location_longitudes: number;
    }
  > {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/questionnaire`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          this.removeToken();
          throw new Error("Authentication required. Please log in again.");
        }
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Failed to fetch questionnaire");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  // Fallback destination data when backend fails
  private getFallbackDestinationData(
    destinationId: number,
  ): DestinationDetails {
    // Provide some sample destination data based on common Sri Lankan destinations
    const sampleDestinations = [
      {
        name: "Sigiriya Rock Fortress",
        description:
          "Ancient rock citadel and palace ruins known as the Lion Rock, featuring stunning frescoes and breathtaking views.",
        things_to_do: [
          "Climb the rock fortress",
          "View ancient frescoes",
          "Explore palace ruins",
          "Visit museum",
        ],
        lat: 7.9568,
        lng: 80.7597,
      },
      {
        name: "Kandy",
        description:
          "Cultural capital featuring the sacred Temple of the Tooth Relic, beautiful lakeside views, and lush botanical gardens.",
        things_to_do: [
          "Visit Temple of the Tooth",
          "Explore Royal Botanical Gardens",
          "Lake walks",
          "Cultural shows",
        ],
        lat: 7.2906,
        lng: 80.6337,
      },
      {
        name: "Galle Fort",
        description:
          "Historic Dutch colonial fort with charming cobblestone streets, lighthouse, and stunning ocean views.",
        things_to_do: [
          "Walk the ramparts",
          "Visit lighthouse",
          "Explore Dutch architecture",
          "Browse boutique shops",
        ],
        lat: 6.0329,
        lng: 80.2168,
      },
    ];

    const destination =
      sampleDestinations[destinationId % sampleDestinations.length] ||
      sampleDestinations[0];

    return {
      destination_name: destination.name,
      destination_id: destinationId,
      latitude: destination.lat,
      longitude: destination.lng,
      description: `${destination.description}\n\n💡 Note: Some real-time data services (weather, hotels) may be temporarily limited. Core destination information and features are fully functional.`,
      "things to do": destination.things_to_do,
      distance: "150 km",
      duration: "3 hours",
      "weather data": [
        {
          date: new Date().toISOString().split("T")[0],
          temperature: "25-30°C",
          weather: "Typical tropical climate - Weather service updating",
          humidity: "70%",
          visibility: "Good",
          icon_url: "",
        },
      ],
      "hotel data": {
        message: "Hotel information temporarily unavailable",
        hotels: [],
      },
      "cost for bicycle": 1500,
      "cost for car": 6000,
      "cost for private bus": 3500,
      "cost for transit": 800,
      "guide details": [
        {
          guide_id: 1,
          name: "Sample Local Guide",
          gender: "male",
          contact_no: "+94 77 123 4567",
          photo_url: "",
        },
      ],
      "destination image": `/destination-image/${destinationId}`,
    };
  }

  // Separate method to get weather data independently
  async getWeatherData(city: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Weather data unavailable");
      }

      return response.json();
    } catch (error) {
      console.warn("Weather API failed:", error);
      // Return mock weather data as fallback
      return {
        city: city,
        temperature: "N/A",
        description: "Weather data unavailable",
        error: true,
      };
    }
  }

  async getDestinationDetails(
    destinationId: number,
  ): Promise<DestinationDetails> {
    console.log(`🔍 Getting destination details for ID: ${destinationId}`);

    try {
      const token = this.getToken();
      console.log("🔑 Token status:", token ? "exists" : "missing");

      if (!token) {
        throw new Error(
          "Authentication required. Please log in to access destination details.",
        );
      }

      console.log("Making request to:", `${API_BASE_URL}/${destinationId}`);

      const response = await fetch(`${API_BASE_URL}/${destinationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Destination details response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log(
            "🔐 Authentication failed - token may be expired or invalid",
          );
          // Clear the invalid token
          this.removeToken();

          // Get the detailed error from backend
          let errorDetail = "Authentication failed";
          try {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            errorDetail = errorData.detail || errorDetail;
          } catch (e) {
            // If we can't parse the error, use default message
          }

          throw new Error(
            `Authentication failed: ${errorDetail}. Please log in again.`,
          );
        }
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Successfully fetched destination details from API");
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch destination details:", error);

      // Check if this is a network connectivity error (backend not running)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.log("🔧 Backend appears to be offline");
        throw new Error(
          "Backend server is not running. Please start the backend server at http://localhost:8000 and try again.",
        );
      }

      throw error;
    }
  }

  async searchByText(query: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/search/by-destination-name?destination_name=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error("Authentication required. Please log in again.");
        }
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Search failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }

  async searchByImage(imageFile: File): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${API_BASE_URL}/search/by-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error("Authentication required. Please log in again.");
        }
        const error: ApiError = await response.json();
        throw new Error(error.detail || "Image search failed");
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection.",
        );
      }
      throw error;
    }
  }
}

export const authAPI = new AuthAPI();

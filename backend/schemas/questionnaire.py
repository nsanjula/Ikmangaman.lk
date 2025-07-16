from pydantic import BaseModel

class Questionnaire(BaseModel):

    nature: bool
    adventure: bool
    luxury: bool
    culture: bool
    relaxation: bool
    wellness: bool
    local_life: bool
    wild_life: bool
    food: bool
    spirituality: bool
    eco_tourism: bool
    travel_month = str
    no_of_people = int
    start_latitude = float
    start_longitude = float



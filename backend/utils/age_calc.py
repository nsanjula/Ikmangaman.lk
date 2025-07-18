from datetime import date

def calculate_age(date_of_birth: date):
    today = date.today()
    age = today.year - date_of_birth.year

    # If birthday hasn't occurred yet this year, subtract one
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1

    return age

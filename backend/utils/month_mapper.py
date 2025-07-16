def get_month_int(month: str):
    month_int_dict = {
        "January" : 1,
        "February" : 2,
        "March" : 3,
        "April" : 4,
        "May" : 5,
        "June" : 6,
        "July" : 7,
        "August" : 8,
        "September" : 9,
        "October" : 10,
        "November" : 11,
        "December" : 12,
    }

    return month_int_dict[month]

def get_month_season(month:str):
    month_season_dict = {
        "January": 0,
        "February": 0,
        "March": 0,
        "April": 1,
        "May": 1,
        "June": 1,
        "July": 2,
        "August": 2,
        "September": 2,
        "October": 3,
        "November": 3,
        "December": 3,
    }

    return month_season_dict[month]




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

def get_month_season(month:int):
    month_season_dict = {
        1 : 0,
        2 : 0,
        3 : 0,
        4 : 1,
        5 : 1,
        6 : 1,
        7 : 2,
        8 : 2,
        9 : 2,
        10 : 3,
        11 : 3,
        12 : 3,
    }

    return month_season_dict[month]

def get_month_str(month_int: int):
    month_str_dict = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December",
    }

    return month_str_dict.get(month_int, "January")

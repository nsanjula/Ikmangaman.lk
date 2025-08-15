from jinja2 import Environment, FileSystemLoader
import os

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

def render_itinerary_html(travel_month, no_of_people,start_location, accessed_user, route_map_url, total_budget, days):
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    template = env.get_template("itinerary_template.html")

    html_content = template.render(
        travel_month=travel_month,
        no_of_people=no_of_people,
        start_location=start_location,
        accessed_user=accessed_user,
        route_map_url=route_map_url,
        total_budget=total_budget,
        days=days
    )
    return html_content

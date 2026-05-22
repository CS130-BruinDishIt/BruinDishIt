from time import sleep

import requests
from bs4 import BeautifulSoup
import json
 
dining_locations = [
    "bruin-plate",
    "spice-kitchen",
    "de-neve-dining",
    "epicuria-at-covel",
    "sack-lunch-program",
    "bruin-bowl",
    "bruin-cafe",
    "cafe-1919",
    "epicuria-at-ackerman",
    "meal-swipe-exchange",  # food trucks
    "the-drey",
    "the-study-at-hedrick",
    "rendezvous",
    ]
MEAL_ANCHORS = {    # meal period name : id of corresponding div
    "breakfast":    "breakfastmenu",
    "lunch":        "lunchmenu",
    "dinner":       "dinnermenu",
    "extended dinner":   "latenightmenu",
    "allday":       "alldaymenu",
}
 
headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9,ko;q=0.8",
    "cache-control": "max-age=0",
    "referer": "https://dining.ucla.edu/dining-locations/",
    "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    "cookie": "_ga_SPVRMQR9J9=GS2.1.s1773204691$o2$g1$t1773204739$j12$l0$h0; _ga_NDG3M6386J=GS2.1.s1773204685$o2$g1$t1773204745$j60$l0$h0; _ga_JMTR1LE2NT=GS2.1.s1773352551$o1$g0$t1773352553$j58$l0$h0; iwe_user_noticecount_urn%3amace%3aucla.edu%3appid%3aperson%3aE09CE6D1C20041F480D376DFA37EE496=0; iwe_term_student_urn%3amace%3aucla.edu%3appid%3aperson%3aE09CE6D1C20041F480D376DFA37EE496=26S; iwe_term_enrollment_urn%3amace%3aucla.edu%3appid%3aperson%3aE09CE6D1C20041F480D376DFA37EE496=26S; iwe_term_student=26S; iwe_student_studylistchanged_urn%3amace%3aucla.edu%3appid%3aperson%3aE09CE6D1C20041F480D376DFA37EE496_26S=3%2f31%2f2026+2%3a10%3a59+PM; _gid=GA1.2.1887657249.1776811477; _ga=GA1.1.558001358.1773155844; _ga_VDDBFFY2VX=GS2.1.s1776811502$o4$g1$t1776811532$j30$l0$h0; _ga_Y76YP787Q7=GS2.1.s1776811476$o24$g1$t1776811534$j2$l0$h0; _ga_ZYB2S7DBVC=GS2.1.s1776820224$o3$g1$t1776820264$j20$l0$h0",
}

def scrape_hours(soup):
    # Returns dict like {"breakfast": "7:00 a.m. - 9:00 a.m.", "lunch": ...}
    hours = {}
    for item in soup.select(".dining-hours-item"):
        meal = item.select_one(".meal-name")
        time  = item.select_one(".meal-time")
        if not meal or not time:
            continue
        closed = time.select_one(".closed-text")
        hours[meal.get_text(strip=True).lower()] = (
            "Closed" if closed else time.get_text(strip=True)
        )
    return hours
 
def scrape_meal(soup, anchor_id):
    # Returns dict like {"station name": ["food1", "food2", ...], ...}
    anchor_div = soup.find("div", id=anchor_id)
    if not anchor_div:
        print(f"not open during meal period div with id '{anchor_id}'")
        return None
 
    meal_div = anchor_div.find_next_sibling("div")
    if not meal_div:
        print(f"Warning: could not find meal div after anchor '{anchor_id}'")
        return None
 
    stations = {}
    select = meal_div.find("select", class_="category-anchors--dropdown")
    if not select:
        print(f"Warning: could not find select element for anchor '{anchor_id}'")
        return None
 
    for option in select.find_all("option"):
        station_id = option.get("value", "").strip().lstrip("#")
        station_name = option.get_text(strip=True)
 
        if not station_id:
            print(f"not valid station id: '{station_id}', '{station_name}'")
            continue
        if station_id == "!":
            continue
 
        station_div = meal_div.find("div", id=station_id)
        if not station_div:
            print(f"Warning: could not find station div with id '{station_id}'")
            continue
 
        stations[station_name] = [
            h3.get_text(strip=True)
            for h3 in station_div.select(".menu-item-title .ucla-prose h3")
        ]
 
    return stations
 
data = {} 
for location in dining_locations:
    url = f"https://dining.ucla.edu/{location}/"
    print(f"Scraping {location}...")
 
    response = requests.get(url, headers=headers)
    sleep(0.5)  # be polite to the server
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
 
    hours = scrape_hours(soup)
    data[location] = {}
 
    for meal_name, anchor_id in MEAL_ANCHORS.items():
        stations = scrape_meal(soup, anchor_id)
        if stations is None:
            continue  # meal not served today
        
        if meal_name == "allday":
            data[location][meal_name] = {
            "hours": hours,
            **stations,   # unpacks station: [foods] pairs at the same level
        }
        else:
            data[location][meal_name] = {
                "hours": hours.get(meal_name, "N/A"),
                **stations,   # unpacks station: [foods] pairs at the same level
            }
 
with open("dining_data.json", "w") as f:
    json.dump(data, f, indent=2)

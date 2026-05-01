import requests
from bs4 import BeautifulSoup
 
url = "https://dining.ucla.edu/bruin-plate/"
 
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
 
response = requests.get(url, headers=headers)
response.raise_for_status()
 
soup = BeautifulSoup(response.text, "html.parser")
prose_divs = soup.find_all("div", class_="ucla-prose")
 
if not prose_divs:
    print("No <div class='ucla-prose'> found on the page.")
else:
    for i, div in enumerate(prose_divs, start=1):
        text = div.get_text(separator="\n", strip=True)
        print(text)
import requests
import re
from bs4 import BeautifulSoup
from bs4.element import Tag
from tqdm import tqdm
from dataclasses import dataclass
from pathlib import Path
import json
import os
import asyncio
from typing import Literal
PYPPETEER_CHROMIUM_REVISION = '1263111'
os.environ['PYPPETEER_CHROMIUM_REVISION'] = PYPPETEER_CHROMIUM_REVISION
from pyppeteer import launch
from pyppeteer.errors import TimeoutError

SECTIONS_PATH = Path('data/sections.json')
PROTOCOLS_PATH = Path('data/protocols.json')

@dataclass
class Section:
    name: str
    url: str
@dataclass
class Drug:
    drug_name: str
    is_adjuvant: bool
    is_neoadjuvant: bool
    frequency: int #days
    cycles: int
    dose: str
    day: int = 1
    route: Literal["PO","IV","SC","IM"] = "IV"
@dataclass
class Regiment:
    regiment: list[Drug]
@dataclass
class DrugSequence:
    sequence: list[Regiment]
@dataclass
class Protocol:
    protocol_id: str
    drug_sequence: list[Drug]
    section_name: str
    category_name: str
    url: str


def extract_sections(to_file = True) -> list[Section]:

    url = 'https://www.eviq.org.au/medical-oncology'
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    sections = []
    for tag in soup.select('.nav.nav-pills.nav-stacked.secondary li a'):
        sections.append(Section(
            name = tag.string,
            url = tag.get('href')
        ))
    if to_file:
        SECTIONS_PATH.write_text(json.dumps({"sections":[i.__dict__ for i in sections]}))
    return sections
async def fetch_content(url:str, selector:str) -> str:
    browser = await launch(headless=True)
    page = await browser.newPage()
    await page.goto(url, timeout=30000)
    await page.waitForSelector(selector)
    html_content = await page.content()
    await page.close()
    await browser.close()
    return html_content
async def extract_protocol_link_list(sections: list[Section]) -> list[Tag]:
    protocol_link_list = []
    for section in tqdm(sections, desc = f'extracting protocol links from sections'):
        url = f"https://www.eviq.org.au/medical-oncology/{section.name.replace(' ','-')}"
        html_content = await fetch_content(url = url, selector = 'div.protocol-listing')
        if not html_content:
            print(f'skipping section: {section.name}')
            continue
        print(f"extracting section: {section.name}")
        soup = BeautifulSoup(html_content, 'html.parser')
        protocols = soup.find('div', class_='protocol-listing')
        p_list_items = protocols.find_all('li', class_='p-list-item')
        for item in p_list_items:
            list_items = item.find_all('li', class_='list-item flex')
            for list_item in list_items:
                protocol_link_list.append(list_item.find('a', href=True))
    return protocol_link_list
def extract_property_from_dl(soup: BeautifulSoup, dl_class: str, property_name:str)->str:
    for dl in soup.find_all('dl', class_=dl_class):
        for dt in dl:
            if dt.get_text(strip=True).lower() == property_name.lower():
                return dt.find_next_sibling('dd').get_text().replace('\n','').replace('\t','').replace('\xa0','').strip()
def extract_drug_sequence_from_treatment_schedual(soup: BeautifulSoup, url: str) -> DrugSequence:
    frequency =  extract_property_from_dl(soup=soup, dl_class = 'dl-horizontal', property_name = "Frequency:")
    cycles = extract_property_from_dl(soup=soup, dl_class = 'dl-horizontal', property_name = "Cycles:")
    drug_status = extract_property_from_dl(soup=soup, dl_class = 'dl-horizontal', property_name = "Drug status:")
    if not drug_status:
        is_neoadjuvant1 = False
        is_adjuvant1 = False
    else:
        is_neoadjuvant1 = True if 'neoadjuvant' in drug_status.lower() else False
        is_adjuvant1 = True if 'adjuvant' in drug_status.lower() and 'neoadjuvant' not in drug_status.lower() else False
    is_neoadjuvant2 = "-neoadjuvant" in url.split("/")[3:][-1]
    is_adjuvant2 = "-adjuvant" in url.split("/")[3:][-1]
    tables = soup.find_all('table', class_='table table-responsive summary')
    drug_sequence = DrugSequence(sequence=[])
    for table in tables:
        regiment = Regiment(regiment=[])
        try:
            tbody = table.find('tbody')
        except AttributeError:
            print(f'url: {url} Discontinued, skipping')
            continue
        
        drug_list = []
        for tr in tbody.find_all('tr'):
            # Initialize a dictionary to store the details of each drug
            drug_info = {}
            headers = ["name", "dose", "route","days"]
            for td in tr.find_all('td'):
                if td.get('class',[[]])[0] in headers:
                    drug_info[td.get('class')[0]] = td.text.strip()
            drug_list.append(drug_info)
        for drug in drug_list:
            drug = Drug(
                drug_name = drug.get('name',None),
                is_adjuvant=is_adjuvant1 or is_adjuvant2,
                is_neoadjuvant=is_neoadjuvant1 or is_neoadjuvant2,
                day=drug.get("days",None),
                frequency = frequency if frequency else None, 
                cycles=cycles if cycles else None,
                dose=drug.get('dose',None),
                route=drug.get('route',None),
            )
            regiment.regiment.append(drug)
        drug_sequence.sequence.append(regiment)
    return drug_sequence
def format_href_text(text: str) -> str:
    text = text.replace("(","")
    text = text.replace(")","")
    text = text.replace("\xa0"," ")
    return text
def extract_regiment_from_href(medications_list: list[str], href: Tag, frequency: list, cycles: list, url: str) -> Regiment:
    """
    text looks like this: 'Breast neoadjuvant/adjuvant AC (DOXOrubicin and CYCLOPHOSPHamide) dose dense'
    extract is_adjuvant, isneoadjuvant, drug_names, doses, 
    return regiment
    """
    href_text = format_href_text(href.text)
    drug_names = [drug for drug in set([w.lower().strip() for w in href_text.split(" ") if len(w)>3]) & set(medications_list)]
    is_neoadjuvant = True if re.compile(r"neoadjuvant").search(href_text, re.IGNORECASE) else False
    is_adjuvant = True if re.compile(r"\badjuvant\b").search(href_text,re.IGNORECASE) else False
    regiment = Regiment(regiment = [])
    if drug_names:
        for drug_name in drug_names:
            drug = Drug(
                drug_name = drug_name, 
                is_adjuvant = is_adjuvant,
                is_neoadjuvant = is_neoadjuvant,
                frequency = frequency if frequency else None,
                cycles = cycles if cycles else None, 
                dose = ""
            )
            regiment.regiment.append(drug)
    else:
        print(f'failed to match a single drug match, probably not correct dose regex')
        breakpoint()
    return regiment
def extract_drug_sequence_from_treatment_overview(medications_list: list[str], soup: BeautifulSoup, url: str) -> DrugSequence:
    treatment_overview = soup.find("div", class_='panel panel-default')
    drug_sequence = DrugSequence(sequence=[])
    for table in treatment_overview.find_all("table"):
        #frequency = [dt.find_next_sibling('dd').get_text() for dl in table.find_all('dl', class_='dl-horizontal m-b-0') for dt in dl if dt.get_text(strip=True) == "Frequency:"]
        #cycles = [dt.find_next_sibling('dd').get_text() for dl in table.find_all('dl', class_='dl-horizontal m-b-0') for dt in dl if dt.get_text(strip=True) == "Cycles:"]
        frequency = extract_property_from_dl(soup=soup, dl_class="dl-horizontal m-b-0", property_name="Frequency:")
        cycles = extract_property_from_dl(soup=soup, dl_class="dl-horizontal m-b-0", property_name="Cycles:")
        href = table.find('a')
        if href:
            regiment = extract_regiment_from_href(medications_list, href, frequency, cycles, url)
            drug_sequence.sequence.append(regiment)
    return drug_sequence
async def extract_drug_sequence_from_url(medications_list: list[str], url: str, protocol_link_name:str = None) -> tuple[DrugSequence, BeautifulSoup]:
    #html_content = await fetch_content(url = url, selector = 'div#myTabContent') ##treatment schedual
    try:
        html_content = await fetch_content(url = url, selector = 'div#protocol') ##treatment overview
    except:
        print(f"url: {url} failed to fetch protocol div, skipping")
        return None, None
    print(f"extracting protocol: {protocol_link_name} from treatment schedual")
    soup = BeautifulSoup(html_content, 'html.parser')
    if re.compile(r"Treatment schedule", re.IGNORECASE).search(soup.get_text()):
        drug_sequence = extract_drug_sequence_from_treatment_schedual(soup, url)
    elif re.compile(r"Treatment overview", re.IGNORECASE).search(soup.get_text()):
        drug_sequence = extract_drug_sequence_from_treatment_overview(medications_list, soup, url)
    else:
        print(f'url: {url} has no treatment schedual or treatment overview, skipping url')
        return None, soup
    if not drug_sequence:
        return None, soup
    return drug_sequence, soup
def generate_protocol(soup: BeautifulSoup, drug_sequence: DrugSequence, url: str) -> Protocol:
    protocol_id_tag = soup.find('li', id='protocol-id')
    protocol_status_tag = protocol_id_tag.find_next_sibling('li')
    return  Protocol(
                protocol_id = protocol_id_tag.text.replace("\n","").replace("ID:","").strip(),
                protocol_status = protocol_status_tag.text.replace("\n","").strip(),
                drug_sequence=drug_sequence,
                section_name=url.split("/")[3:][0],
                category_name=url.split("/")[3:][1],
                url=url
            )
async def extract_protocols(medications_list: list[str], to_file = True) -> list[Protocol]:
    sections = extract_sections(to_file=False)
    #sections = sections[:1] ## for TESTING ONLY
    protocol_link_list = await extract_protocol_link_list(sections)
    #protocol_link_list =protocol_link_list[:20] ## for TESTING ONLY
    new_protocol_list = []
    for protocol_link in tqdm(protocol_link_list, desc="extracting drug and protocol from link"):
        url = f"https://www.eviq.org.au{protocol_link['href']}"
        drug_sequence, soup = await extract_drug_sequence_from_url(medications_list, url, protocol_link.text)
        if not drug_sequence:
            continue
        new_protocol_list.append(generate_protocol(soup, drug_sequence, url))
    return new_protocol_list
def write_protocols_to_file(protocols: list[Protocol]) -> None:
    protocols_json = []
    for protocol in protocols:
        protocols_json.append(
            {
                "protocol_id":protocol.protocol_id,
                "protocol_status": protocol.protocol_status,
                "drug_sequence":[[drug.__dict__ for drug in regiment.regiment] for regiment in protocol.drug_sequence.sequence],
                "section_name" : protocol.section_name, 
                "category_name": protocol.category_name,
                "url": protocol.url
            }
        )
    Path("scraper/data/protocols.json").write_text(json.dumps(protocols_json, indent=4))
    breakpoint()
def get_medications_list() -> list[str]:
    url = 'https://www.cancerresearchuk.org/about-cancer/treatment/drugs'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    medications_list = []
    for item in soup.find_all('li', class_='child-index-item'):
        drug_name = item.a.text.split('(')[0].strip().lower()
        medications_list.append(drug_name)
    return medications_list

if __name__ == "__main__":
    medications_list = get_medications_list()
    protocols = asyncio.run(extract_protocols(medications_list, to_file=True))
    write_protocols_to_file(protocols)
    #sections = extract_sections(to_file = True)


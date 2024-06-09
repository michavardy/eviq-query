import pytest
import pytest_asyncio
import sys
import os
sys.path.append(os.getcwd())
from eviq_scraper import extract_drug_sequence_from_url, get_medications_list

"""
cd ~/projects_mercury/eviq-query/scraper
pytest
"""


@pytest.mark.asyncio
async def test_url():
    url = "https://www.eviq.org.au/medical-oncology/breast/neoadjuvant-adjuvant/1969-breast-neoadjuvant-docetaxel-pertuzumab-and"
    protocol_link_name = url.split('/')[-1]
    medications_list = get_medications_list()
    drug_sequence, soup = await extract_drug_sequence_from_url(medications_list, url, protocol_link_name)
    assert drug_sequence is not None
    breakpoint()


if __name__ == "__main__":
    pytest.main()

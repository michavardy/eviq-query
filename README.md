# eviQ Query

## Overview

eviQ Query is a tool designed to make the vast resources of the eviQ website more accessible and user-friendly for oncology nurses and health professionals. It scrapes the eviQ website, which is a free resource offering evidence-based, consensus-driven cancer treatment protocols and information tailored for use at the point of care. Developed for the Australian context, eviQ supports health professionals in delivering cancer treatments.

## Features

### Searchable Database

- **By Drug Name**: Easily find information and protocols related to specific cancer treatment drugs.
- **By Category**: Browse and locate treatment protocols and information categorized for ease of use.

### Data Table with Links

- Provides a comprehensive data table containing relevant information and direct links to eviQ pages for more detailed guidance.

### Translation to Hebrew

- All information can be translated to Hebrew, making it accessible for Hebrew-speaking health professionals.

## How to Install

To install and run eviQ Query, use the following Docker command:

```bash
docker run -p 8000:8000 michav1/eviq:latest
```

## Connectivity
- Port 8000 must be open to all of the computers in the oncology dept, to access this endpoint

## How to Use

1. **Search**: Enter the drug name or category in the search bar.
2. **View Results**: The tool will display a data table with the relevant eviQ protocols and information.
3. **Access Detailed Information**: Click on the links in the data table to visit the corresponding eviQ pages.
4. **Translation**: Use the translation feature to convert the information into Hebrew if needed.

## Contact and Support

For any questions or support, please contact our team at michavardy@gmail.com


## Dev
```bash
npm run start #http://localhost:3000
uvicorn main:app --reload  #http://localhost:8000
```

## test Docker
```bash
docker build -t eviq .
docker run -p 8000:8000 eviq
docker exec -it <container-id> sh
```

## run docker
```bash
docker run -p 8000:8000 michav1/eviq:latest
```
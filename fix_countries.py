#!/usr/bin/env python3
import json

# Read existing (truncated) data
with open('countries.json', 'r') as f:
    content = f.read()

# Find where it ends (last complete object before truncation)
last_brace = content.rfind('}')
if last_brace > 0:
    content = content[:last_brace+1]

# Fix JSON
content = content.rstrip().rstrip(',') + ']'

data = json.loads(content)
print(f'Loaded {len(data)} countries')

# Add missing countries
missing = [
  {"id":"ZAF","name":"South Africa","normalizedName":"SOUTHAFRICA","lat":-30.6,"lon":22.9,"continent":"Africa","flag":"🇿🇦","funFact":"South Africa is the only country with three capital cities."},
  {"id":"SSD","name":"South Sudan","normalizedName":"SOUTHSUDAN","lat":6.9,"lon":31.3,"continent":"Africa","flag":"🇸🇸","funFact":"South Sudan became the newest country in the world in 2011."},
  {"id":"ESP","name":"Spain","normalizedName":"SPAIN","lat":40.5,"lon":-3.7,"continent":"Europe","flag":"🇪🇸","funFact":"Spain has the second-highest number of bars per capita in the world."},
  {"id":"SRI","name":"Sri Lanka","normalizedName":"SRILANKA","lat":7.9,"lon":80.8,"continent":"Asia","flag":"🇱🇰","funFact":"Sri Lanka was known as Ceylon until 1972."},
  {"id":"SDN","name":"Sudan","normalizedName":"SUDAN","lat":12.9,"lon":30.2,"continent":"Africa","flag":"🇸🇩","funFact":"Sudan was the largest country in Africa before South Sudan seceded."},
  {"id":"SUR","name":"Suriname","normalizedName":"SURINAME","lat":3.9,"lon":-56.0,"continent":"South America","flag":"🇸🇷","funFact":"Suriname is the smallest country in South America."},
  {"id":"SWE","name":"Sweden","normalizedName":"SWEDEN","lat":60.1,"lon":18.6,"continent":"Europe","flag":"🇸🇪","funFact":"Sweden has the most islands of any country."},
  {"id":"SUI","name":"Switzerland","normalizedName":"SWITZERLAND","lat":46.8,"lon":8.2,"continent":"Europe","flag":"🇨🇭","funFact":"Switzerland has no official capital."},
  {"id":"SYR","name":"Syria","normalizedName":"SYRIA","lat":34.8,"lon":39.0,"continent":"Asia","flag":"🇸🇾","funFact":"Syria is home to one of the oldest cities — Damascus."},
  {"id":"TWN","name":"Taiwan","normalizedName":"TAIWAN","lat":23.7,"lon":121.0,"continent":"Asia","flag":"🇹🇼","funFact":"Taiwan produces over 90% of the worlds semiconductor chips."},
  {"id":"TJK","name":"Tajikistan","normalizedName":"TAJIKISTAN","lat":38.9,"lon":71.0,"continent":"Asia","flag":"🇹🇯","funFact":"Tajikistan has over 90% of the groundwater in Central Asia."},
  {"id":"TAN","name":"Tanzania","normalizedName":"TANZANIA","lat":-6.4,"lon":34.9,"continent":"Africa","flag":"🇹🇿","funFact":"Tanzania is home to Mount Kilimanjaro."},
  {"id":"THA","name":"Thailand","normalizedName":"THAILAND","lat":15.9,"lon":100.9,"continent":"Asia","flag":"🇹🇭","funFact":"Thailand is the only Southeast Asian country never colonized."},
  {"id":"TLS","name":"Timor-Leste","normalizedName":"TIMORLESTE","lat":-8.9,"lon":125.9,"continent":"Asia","flag":"🇹🇱","funFact":"Timor-Leste is the newest country in Asia, gaining independence in 2002."},
  {"id":"TOG","name":"Togo","normalizedName":"TOGO","lat":8.6,"lon":1.0,"continent":"Africa","flag":"🇹🇬","funFact":"Togo is one of the longest thin countries in the world."},
  {"id":"TUN","name":"Tunisia","normalizedName":"TUNISIA","lat":33.9,"lon":9.5,"continent":"Africa","flag":"🇹🇳","funFact":"Tunisia is the northernmost country in Africa."},
  {"id":"TUR","name":"Turkey","normalizedName":"TURKEY","lat":38.9,"lon":35.2,"continent":"Asia","flag":"🇹🇷","funFact":"Turkey spans two continents — Europe and Asia."},
  {"id":"TKM","name":"Turkmenistan","normalizedName":"TURKMENISTAN","lat":40.0,"lon":59.0,"continent":"Asia","flag":"🇹🇲","funFact":"Turkmenistan has the Gates of Hell."},
  {"id":"UGA","name":"Uganda","normalizedName":"UGANDA","lat":1.4,"lon":32.3,"continent":"Africa","flag":"🇺🇬","funFact":"Uganda has the tallest mountain range in Africa."},
  {"id":"UKR","name":"Ukraine","normalizedName":"UKRAINE","lat":48.4,"lon":31.2,"continent":"Europe","flag":"🇺🇦","funFact":"Ukraine has the deepest metro station in the world."},
  {"id":"UAE","name":"UAE","normalizedName":"UNITEDARABEMIRATES","lat":23.4,"lon":53.8,"continent":"Asia","flag":"🇦🇪","funFact":"The UAE has no income tax."},
  {"id":"GBR","name":"UK","normalizedName":"UNITEDKINGDOM","lat":55.4,"lon":-3.4,"continent":"Europe","flag":"🇬🇧","funFact":"The UK has no written constitution."},
  {"id":"USA","name":"United States","normalizedName":"UNITEDSTATES","lat":37.1,"lon":-95.7,"continent":"North America","flag":"🇺🇸","funFact":"The US has no official language at the federal level."},
  {"id":"URU","name":"Uruguay","normalizedName":"URUGUAY","lat":-32.5,"lon":-55.8,"continent":"South America","flag":"🇺🇾","funFact":"Uruguay was the first country to host a FIFA World Cup."},
  {"id":"UZB","name":"Uzbekistan","normalizedName":"UZBEKISTAN","lat":41.4,"lon":64.6,"continent":"Asia","flag":"🇺🇿","funFact":"Uzbekistan has one of the oldest written languages."},
  {"id":"VEN","name":"Venezuela","normalizedName":"VENEZUELA","lat":6.4,"lon":-66.6,"continent":"South America","flag":"🇻🇪","funFact":"Venezuela has the largest proven oil reserves in the world."},
  {"id":"VIE","name":"Vietnam","normalizedName":"VIETNAM","lat":14.1,"lon":108.3,"continent":"Asia","flag":"🇻🇳","funFact":"Vietnam has the largest cave in the world."},
  {"id":"YEM","name":"Yemen","normalizedName":"YEMEN","lat":15.6,"lon":48.5,"continent":"Asia","flag":"🇾🇪","funFact":"Yemen has not had a drop of rain for years in some places."},
  {"id":"ZAM","name":"Zambia","normalizedName":"ZAMBIA","lat":-13.1,"lon":27.8,"continent":"Africa","flag":"🇿🇲","funFact":"Zambia was named after the Zambezi River."},
  {"id":"ZIM","name":"Zimbabwe","normalizedName":"ZIMBABWE","lat":-19.0,"lon":29.2,"continent":"Africa","flag":"🇿🇼","funFact":"Zimbabwe has Victoria Falls."},
]

# Remove duplicates by id
existing_ids = {c['id'] for c in data}
added = 0
for c in missing:
    if c['id'] not in existing_ids:
        data.append(c)
        added += 1

print(f'Added {added} new countries. Total: {len(data)}')

with open('countries.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Saved countries.json')

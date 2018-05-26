// Data
export const stateAbrvToName = {
  AK: 'Alaska',
  AL: 'Alabama',
  AR: 'Arkansas',
  AS: 'American Samoa',
  AZ: 'Arizona',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DC: 'District Of Columbia',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  IA: 'Iowa',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  MA: 'Massachusetts',
  MD: 'Maryland',
  ME: 'Maine',
  MI: 'Michigan',
  MN: 'Minnesota',
  MO: 'Missouri',
  MP: 'Northern Mariana Islands',
  MS: 'Mississippi',
  MT: 'Montana',
  NC: 'North Carolina',
  ND: 'North Dakota',
  NE: 'Nebraska',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NV: 'Nevada',
  NY: 'New York',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VA: 'Virginia',
  VI: 'Virgin Islands',
  VT: 'Vermont',
  WA: 'Washington',
  WI: 'Wisconsin',
  WV: 'West Virginia',
  WY: 'Wyoming',
};

export const stateNameToAbrv = Object.keys(stateAbrvToName).reduce((obj, key) => {
  obj[stateAbrvToName[key]] = key;
  return obj;
}, {});

export const officeDict = {
  Gov: 'Governor',
  Rep: 'Representative',
  Sen: 'Senator',
};

export const getTitle = key => (officeDict[key] ? officeDict[key] : key);

export const fips = {
  AK: '02',
  AL: '01',
  AR: '05',
  AS: '60',
  AZ: '04',
  CA: '06',
  CO: '08',
  CT: '09',
  DC: '11',
  DE: '10',
  FL: '12',
  GA: '13',
  GU: '66',
  HI: '15',
  IA: '19',
  ID: '16',
  IL: '17',
  IN: '18',
  KS: '20',
  KY: '21',
  LA: '22',
  MA: '25',
  MD: '24',
  ME: '23',
  MI: '26',
  MN: '27',
  MO: '29',
  MP: '69',
  MS: '28',
  MT: '30',
  NC: '37',
  ND: '38',
  NE: '31',
  NH: '33',
  NJ: '34',
  NM: '35',
  NV: '32',
  NY: '36',
  OH: '39',
  OK: '40',
  OR: '41',
  PA: '42',
  PR: '72',
  RI: '44',
  SC: '45',
  SD: '46',
  TN: '47',
  TX: '48',
  UT: '49',
  VA: '51',
  VI: '78',
  VT: '50',
  WA: '53',
  WI: '55',
  WV: '54',
  WY: '56',
};

export const numOfDistricts = {
  AK: '1',
  AL: '10',
  AR: '7',
  AZ: '9',
  CA: '53',
  CO: '7',
  CT: '6',
  DC: '1',
  DE: '1',
  FL: '27',
  GA: '14',
  HI: '2',
  IA: '11',
  ID: '2',
  IL: '26',
  IN: '13',
  KS: '8',
  KY: '13',
  LA: '8',
  MA: '25',
  MD: '8',
  ME: '8',
  MI: '19',
  MN: '10',
  MO: '16',
  MS: '8',
  MT: '2',
  NC: '13',
  ND: '3',
  NE: '6',
  NH: '4',
  NJ: '15',
  NM: '3',
  NV: '4',
  NY: '45',
  OH: '24',
  OK: '8',
  OR: '5',
  PA: '36',
  PR: '72',
  RI: '3',
  SC: '9',
  SD: '3',
  TN: '13',
  TX: '36',
  UT: '4',
  VA: '23',
  VT: '6',
  WA: '10',
  WI: '11',
  WV: '6',
  WY: '1',
};

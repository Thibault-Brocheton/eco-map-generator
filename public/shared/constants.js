const waterColorToName = {
  "#4682b4": "River",
  "#87cefa": "Lake",
};

const biomesConfiguration = {
  "DeepOcean": {
    min: -0.7,
    max: -0.2,
    minTemp: 0,
    maxTemp: 0.4,
    minMoisture: 0,
    maxMoisture: 1,
    color: '#4682b4',
  },
  "Ocean": {
    min: -0.15,
    max: -0.05,
    minTemp: 0.4,
    maxTemp: 1,
    minMoisture: 0,
    maxMoisture: 1,
    color: '#87cefa',
  },
  "Coast": {
    min: -0.05,
    max: 0.03,
    minTemp: 0,
    maxTemp: 1,
    minMoisture: 0,
    maxMoisture: 1,
    color: '#fafad2',
  },
  "Grasslands": {
    min: 0.03,
    max: 1,
    minTemp: 0.4,
    maxTemp: 0.8,
    minMoisture: 0.3,
    maxMoisture: 0.5,
    color: '#90ee90',
  },
  "WarmForest": {
    min: 0.03,
    max: 1,
    minTemp: 0.5,
    maxTemp: 0.8,
    minMoisture: 0.5,
    maxMoisture: 0.6,
    color: '#b8860b',
  },
  "Desert": {
    min: 0.03,
    max: 1,
    minTemp: 0.7,
    maxTemp: 1,
    minMoisture: 0,
    maxMoisture: 0.3,
    color: '#f4a460',
  },
  "RainForest": {
    min: 0.03,
    max: 1,
    minTemp: 0.6,
    maxTemp: 0.8,
    minMoisture: 0.7,
    maxMoisture: 1,
    color: '#20b2aa',
  },
  "Wetland": {
    min: 0.03,
    max: 1,
    minTemp: 0.4,
    maxTemp: 0.6,
    minMoisture: 0.6,
    maxMoisture: 0.8,
    color: '#006400',
  },
  "ColdForest": {
    min: 0.03,
    max: 1,
    minTemp: 0.2,
    maxTemp: 0.5,
    minMoisture: 0.5,
    maxMoisture: 0.6,
    color: '#228b22',
  },
  "Taiga": {
    min: 0.03,
    max: 1,
    minTemp: 0.2,
    maxTemp: 0.3,
    minMoisture: 0.2,
    maxMoisture: 0.5,
    color: '#6b8e23',
  },
  "Tundra": {
    min: 0.03,
    max: 1,
    minTemp: 0.1,
    maxTemp: 0.2,
    minMoisture: 0,
    maxMoisture: 0.6,
    color: '#bdb76b',
  },
  "Ice": {
    min: 0.03,
    max: 1,
    minTemp: 0,
    maxTemp: 0.1,
    minMoisture: 0,
    maxMoisture: 0.6,
    color: '#ffffff',
  },
};

const biomeColorToName = {};

for (const biomeConf in biomesConfiguration) {
  biomeColorToName[biomesConfiguration[biomeConf].color] = biomeConf;
}

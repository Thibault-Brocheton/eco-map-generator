const biomeColorToName = {
  "#4682b4": "DeepOcean",
  "#87cefa": "Ocean",
  "#fafad2": "Coast",
  "#90ee90": "Grasslands",
  "#b8860b": "WarmForest",
  "#f4a460": "Desert",
  "#20b2aa": "RainForest",
  "#006400": "Wetland",
  "#228b22": "ColdForest",
  "#6b8e23": "Taiga",
  "#bdb76b": "Tundra",
  "#ffffff": "Ice",
}

const waterColorToName = {
  "#4682b4": "River",
  "#87cefa": "Lake",
}

const biomeHeightAssoc = {
  "DeepOcean": {
    min: -1,
    max: -0.4,
  },
  "Ocean": {
    min: -0.2,
    max: -0.05,
  },
  "Coast": {
    min: 0.01,
    max: 0.01,
  },
  "Grasslands": {
    min: 0.02,
    max: 0.4,
  },
  "WarmForest": {
    min: 0.1,
    max: 0.5,
  },
  "Desert": {
    min: 0.02,
    max: 0.2,
  },
  "RainForest": {
    min: 0.1,
    max: 0.5,
  },
  "Wetland": {
    min: 0.02,
    max: 0.3,
  },
  "ColdForest": {
    min: 0.1,
    max: 0.7,
  },
  "Taiga": {
    min: 0.3,
    max: 1,
  },
  "Tundra": {
    min: 0.4,
    max: 1,
  },
  "Ice": {
    min: 0.6,
    max: 1,
  },
};
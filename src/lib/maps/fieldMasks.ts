export const FIELD_MASKS = {
  routes:
    'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.transitDetails,routes.legs.duration',
  routesDuration: 'routes.duration,routes.distanceMeters',
  matrix: 'originIndex,destinationIndex,duration,distanceMeters,condition',
  autocomplete: 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
  placeDetails: 'id,displayName,location,formattedAddress',
} as const

export const BANGKOK_BOUNDS = { south: 13.49, west: 100.32, north: 13.96, east: 100.94 } as const

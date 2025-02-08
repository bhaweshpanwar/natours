export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmhhd2VzaHBhbndhciIsImEiOiJjbTY4dmI4ZGkwNGhtMnFyOWhiM2hkaG1qIn0.j666PmZvjdYmXyCdsbGUew';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bhaweshpanwar/cm697zgdu000701sf2nxu9w7y',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([loc.longitude, loc.latitude])
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat([loc.longitude, loc.latitude])
      .setHTML(`<p>${loc.description}</p>`)
      .addTo(map);

    bounds.extend([loc.longitude, loc.latitude]);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

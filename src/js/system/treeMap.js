import { backendURL } from "../utils/utils.js";

// Load Google Maps API dynamically
function loadGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyB-ZLIPWC70d4HqdODaS1zopmod2YXUd94&map_ids=bbc70c6f1eb4afd9";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize map after API loads
async function initialize() {
  try {
    await loadGoogleMapsAPI();
    initMap(); // Call initMap only after API loads
  } catch (error) {
    console.error("Error loading Google Maps API:", error);
    alert("Failed to load Google Maps API.");
  }
}

function initMap() {
  try {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 8.956887002237504, lng: 125.59728591999158 },
      zoom: 17,
      draggable: true,
      styles: [
        { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });

    console.log("Map initialized:", map); // Log map object
    fetchTreesAndPlaceMarkers(map); // Fetch trees after map is created
  } catch (error) {
    console.error("Error initializing the map:", error);
    alert("Error initializing the map. Please try again.");
  }
}

initialize();

// Function to fetch trees and add markers
async function fetchTreesAndPlaceMarkers(map) {
  try {
    const treeResponse = await fetch(backendURL + "/api/trees", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!treeResponse.ok) {
      console.error("Failed to fetch tree data:", treeResponse.statusText);
      throw new Error("Failed to fetch tree data");
    }

    const treeData = await treeResponse.json();
    console.log("Fetched tree data:", treeData); // Log fetched data

    treeData.forEach((tree) => {
      if (tree.latitude && tree.longitude) {
        addTreeMarker(map, tree);
      } else {
        console.warn("Missing coordinates for tree:", tree);
      }
    });
  } catch (error) {
    alert("Error fetching tree data. Please refresh the page.");
    console.error("Error fetching trees:", error);
  }
}

// Function to add a marker for a tree
function addTreeMarker(map, tree) {
  const position = {
    lat: parseFloat(tree.latitude),
    lng: parseFloat(tree.longitude),
  };

  // Get marker color based on the tree family name or any condition you prefer
  const markerColor = getMarkerColor(tree.family_name); // e.g. #FF5733 for red

  const marker = new google.maps.Marker({
    position: position,
    map: map,
    icon: createCustomSVGIcon(markerColor), // Use custom SVG marker with hex color
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <h6>${tree.common_name}</h6>
      <span><i>${tree.scientific_name}</i></span>
      <p><strong>Family Name:</strong> ${tree.family_name || "N/A"}</p>
    `,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}

// Function to get the marker color based on the tree family name
function getMarkerColor(familyName) {
  if (!familyName || typeof familyName !== "string") {
    console.warn("Invalid family name provided.");
    return "#808080"; // Default to gray if no valid family name
  }

  const colorMapping = {
    fabaceae: "#4CAF50",      // Green
    meliaceae: "#F44336",     // Red
    anacardiaceae: "#FFEB3B", // Yellow
    dipterocarpaceae: "#2196F3", // Blue
    combretaceae: "#FF9800",  // Orange
    lamiaceae: "#9C27B0",     // Purple
    moraceae: "#E91E63",      // Pink
    lythraceae: "#795548",    // Brown
    myrtaceae: "#009688",     // Teal
    sapindaceae: "#FF5722",   // Deep Orange
    lauraceae: "#8BC34A",     // Light Green
    casuarinaceae: "#607D8B", // Blue Grey
    burseraceae: "#3F51B5",   // Indigo
    phyllanthaceae: "#CDDC39", // Lime
    rhizophoraceae: "#795548",// Brown
    solanaceae: "#FF9800",    // Orange
    rutaceae: "#FFEB3B",      // Yellow
    rosaceae: "#F44336",      // Red
    aceraceae: "#00BCD4",     // Cyan
    apocynaceae: "#673AB7",   // Deep Purple
    euphorbiaceae: "#00FF00", // Lime Green
    malvaceae: "#8B0000",     // Dark Red
  };

  const color = colorMapping[familyName.toLowerCase()]
  console.log(color)
  return color;
}

// Function to create a custom SVG marker icon with color
function createCustomSVGIcon(markerColor) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="50" height="50">
      <circle cx="50" cy="50" r="40" fill="${markerColor}" stroke="white" stroke-width="5"/>
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svg); // Encode the SVG string to use in the URL

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodedSvg}`,  // Use the encoded SVG URL
    scaledSize: new google.maps.Size(25, 25),  // Size of the marker
    anchor: new google.maps.Point(25, 25),     // Center the marker
  };
}

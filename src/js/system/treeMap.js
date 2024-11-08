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

  // Get marker color based on the tree common name
  const markerColor = getMarkerColor(tree.common_name);

  const marker = new google.maps.Marker({
    position: position,
    map: map,
    icon: {
      url: `http://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
      scaledSize: new google.maps.Size(27, 29),
      anchor: new google.maps.Point(20, 35),
    },
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <h5>${tree.tree_id}. ${tree.common_name}</h5>
      <span><strong>Scientific Name:</strong> ${tree.scientific_name}</span>
      <p><strong>Family Name:</strong> ${tree.family_name || "N/A"}</p>
    `,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}

// Function to get the marker color based on the tree common name
function getMarkerColor(commonName) {
  const colorMapping = {
    acacia: "green",
    mahogany: "red",
    mango: "yellow",
    narra: "blue",
    oak: "orange",
    pine: "purple",
    birch: "pink",
    maple: "brown",
  };

  return colorMapping[commonName.toLowerCase()] || "blue";
}

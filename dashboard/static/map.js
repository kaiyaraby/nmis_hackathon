// map.js

// The boxes variable is passed from Flask

const canvas = document.getElementById('map_canvas');
const context = canvas.getContext('2d');
const infoDiv = document.getElementById('box_info');
const showNamesCheckbox = document.getElementById('show-section-names');
const performance_indicators = document.getElementById("performance_indicators");

let boxeselected = null;

// Event listener for the "Show Names" checkbox
showNamesCheckbox.addEventListener('change', drawBoxes);


// Function to check if a point (x, y) is close to a line segment defined by (x1, y1) and (x2, y2)
function isPointNearLine(x, y, x1, y1, tolerance = 5) {
    const distance = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);

    return distance <= tolerance;
}

// Function to highlight the selected box
function highlightSelectedbox(box) {
    const centerPixel = convertLatLngToCanvasPixel(box.Lat, box.Long);
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoxes(); // Redraw all boxes

    // Draw dots
    const dotRadius = 5;
    context.fillStyle = 'cyan'; // Dot color
    context.beginPath();
    context.arc(centerPixel.x, centerPixel.y, dotRadius, 0, Math.PI * 2);
    context.fill();
}

// Function to handle canvas click event
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // Check if the click point is near any box
    for (const box of boxes) {
        const centerPixel = convertLatLngToCanvasPixel(box.Lat, box.Long);
        
        if (isPointNearLine(mouseX, mouseY, centerPixel.x, centerPixel.y, 10)) {
            console.log(`DEBUGGING - boxeselected - ${box.Section_Name}`);
            
            // Highlight the selected box
            highlightSelectedbox(box)
            
            // Display the box information
            displayboxInfo(box); 
            
            // Set the chart for the box
            setChart(box);
            
            boxeselected = box;
            break; // Stop checking if a box is found
        }
    }
});

// Function to handle mousemove events
function handleMouseMove(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // Check if the mouse is over any box
    let mouseOverbox = false;
    boxes.forEach((box) => {
        const centerPixel = convertLatLngToCanvasPixel(box.Lat, box.Long);
        if (isPointNearLine(mouseX, mouseY, centerPixel.x, centerPixel.y, 10)) {
            mouseOverbox = true;
        }
    });

    // Update the cursor style based on whether the mouse is over a box
    canvas.style.cursor = mouseOverbox ? 'pointer' : 'move';
}

// Add an event listener for the "keydown" event on the document
document.addEventListener('keydown', handleEscapeKey);

// Function to handle the "ESC" key press event
function handleEscapeKey(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        console.log('DEBUGGING - handleEscapeKey - Clear information');
        
        // Redraw the boxes
        drawBoxes();

        // Clear the info properties
        displayboxInfo({});
        
        // Clear the graph
        performance_indicators.innerHTML = "";
        createChart('performanceChart', [], [], 'Year', '', '');
    }
}


//function to display the names of the boxes on canvas
function displayboxesNames (context, box){
    const centerPixel = convertLatLngToCanvasPixel(box.Lat, box.Long);
    
    context.save();    
    
    
    context.translate(centerPixel.x, centerPixel.y);
    
    // Add box names as text labels aligned with the lines
    context.fillStyle = 'black';
    context.font = '10px Arial';
    context.textAlign = 'center';

    context.fillText(box.Box_Name, 0, 10);
    
    context.restore();
}

function convertLatLngToCanvasPixel (lat, lng){
    const LatLng = L.latLng(lat, lng);
    const Pixel = map.latLngToLayerPoint(LatLng);
    return Pixel;
}

// Function to draw boxes on the canvas
window.addEventListener('load', drawBoxes);
function drawBoxes() {
    console.log("DEBUGGING - drawBoxes");
    context.clearRect(0, 0, canvas.width, canvas.height);
    boxeselected = null 
    
    boxes.forEach((box, index) => {
        // Convert latitude and longitude to pixel coordinates
        const centerPixel = convertLatLngToCanvasPixel(box.Lat, box.Long);
        
        // Draw dots
        const dotRadius = 5;
        context.fillStyle = 'black'; // Dot color
        context.beginPath();
        context.arc(centerPixel.x, centerPixel.y, dotRadius, 0, Math.PI * 2);
        context.fill();
        
        if (showNamesCheckbox.checked){
            displayboxesNames(context, box);
        };
        
        // Add a single event listener for mousemove on the canvas
        canvas.addEventListener('mousemove', handleMouseMove);
    });
}

// Function to display box information in a table within the infoDiv
// window.addEventListener('load', displayboxInfo);
function displayboxInfo(box) {
    try {
        mode = getCurrentMode();
        if (mode === 'maintenance' || mode === 'optimization' ){
            return;
        }
    } catch{}
    
    console.log(`DEBUGGING - displayboxInfo - ${box.Section_Name}`);
    const table = document.createElement('table');
    
    let last_inspection = {}
    if (Array.isArray(box['inspections'])) {
        last_inspection = box['inspections'].slice(-1)[0];
        if (box['inspections'].length===0) {
            last_inspection = {'Date': '?', 'Global_ASFiNAG':'?'};
        };
    };
    
    
    

    table.innerHTML = `
        <tr>
            <th colspan="2">${box.Section_Name}</th>
        </tr>
        <tr>
            <th colspan="2">Properties</th>
        </tr>
        <tr>
            <th>Property</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>hasFOS</td>
            <td>${box.hasFOS}</td>
        </tr>
        <tr>
            <td>Category</td>
            <td>${box.box_Category}</td>
        </tr>
        <tr>
            <td>Construction type</td>
            <td>${box.Construction_Type}</td>
        </tr>
        <tr>
            <td>Construction date</td>
            <td>${box.Age}</td>
        </tr>
        <tr>
            <th colspan="2">Condition</th>
        </tr>
        <tr>
            <td>Date</td>
            <td>${last_inspection.Date}</td>
        </tr>
        <tr>
            <td>Grade</td>
            <td>${last_inspection.Global_ASFiNAG}</td>
        </tr>`;
        
    // Clear previous content and append the table to the infoDiv
    infoDiv.innerHTML = '';
    infoDiv.appendChild(table);
}


function setChart(box) {
    console.log(`DEBUGGING - setChart - ${box['Section_Name']}`);
    performance_indicators.innerHTML = "";
    
    setChartVizualizeMode(box);
    
}

// Call the function to create chart when the page loads
createChart('performanceChart', [], [], 'Year', '', '');
function createChart(canvas_name, data_x, data_y, x_label, y_label, data_title) {
    console.log(`DEBUGGING - createChart - ${data_title}`);
    
	// Create a Chart.js chart
	let myChart = Chart.getChart(canvas_name);
	if (myChart) {
		// If the chart already exists, update it with new data
		myChart.data.labels = data_x;
		myChart.data.datasets[0].data = data_y;
		myChart.data.datasets[0].label = data_title;
		myChart.options.scales.y.title.text = y_label;
		myChart.update();
	} else {
		// If the chart doesn't exist, create a new one
		const ctx = document.getElementById(canvas_name).getContext('2d');
		const myChart = new Chart(ctx, {
			type: 'line',
			data: {
			  labels: data_x,
			  datasets: [{
				label: data_title,
				data: data_y,
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1
			  }]
			},
			options: {
			  responsive: true,
			  scales: {
				x: {
				  title: {
					display: true,
					text: x_label,
				  }
				},
				y: {
				  title: {
					display: true,
					text: y_label,
				  }
				},
			  },
			  //maintainAspectRatio: false
			}
		}
	)};
}

function setChartVizualizeMode(box) {
    console.log(`DEBUGGING - setChartVizualizeMode - ${box['Section_Name']}`);
    performance_indicators.innerHTML = "";
    createChart('performanceChart', [], [], 'Year', '', box['Section_Name']);
    
    
    EDPList = Object.keys(box.inspections[0]);
    EDPList = EDPList.filter(function(item) {return item !== "Box_Name" })
    EDPList = EDPList.filter(function(item) {return item !== "Datetime"})
    
    
    if (performance_indicators.childElementCount > 1) {
        performance_indicators.removeChild(performance_indicators.lastChild);
    }
    
    const indicator = document.createElement("select");
    indicator.name = "indicator";
    indicator.id = "indicator";
    
    const option_ = document.createElement("option");
    option_.value = 'Select indicator';
    option_.text = 'Select indicator';
    indicator.add(option_);
    
    let lista = []
    
    lista = EDPList;
    
    for (let i = 0; i < lista.length; i++) {
        const option1 = document.createElement("option");
        option1.value = lista[i];
        option1.text = lista[i];
        indicator.add(option1);
        performance_indicators.appendChild(indicator);
    }
    indicator.addEventListener('change', () => {
        console.log(`DEBUGGING - change_PI - ${document.getElementById("indicator").value}`);
        
        const performance_indicator = document.getElementById("indicator").value;
        
        let dates =  box['inspections'].map(obj => obj.Datetime)//.map(date => new Date(date));
        let performance =  box['inspections'].map(obj => obj[performance_indicator]);
        console.log(dates);
        createChart('performanceChart', dates, performance, 'Year', performance_indicator, box['Section_Name']);
    });

};
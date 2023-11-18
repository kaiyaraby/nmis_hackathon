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
function isPointNearLine(x, y, x1, y1, x2, y2, tolerance = 5) {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (length === 0) return false;

    const t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (length ** 2);

    if (t < 0) return false; // Closest point is before the start of the segment
    if (t > 1) return false; // Closest point is after the end of the segment

    const closestX = x1 + t * (x2 - x1);
    const closestY = y1 + t * (y2 - y1);

    const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

    return distance <= tolerance;
}

// Function to highlight the selected box
function highlightSelectedbox(box) {
    const startPixel = convertLatLngToCanvasPixel(box.yi, box.xi);
    const endPixel = convertLatLngToCanvasPixel(box.yf, box.xf);
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoxes(); // Redraw all boxes
    context.strokeStyle = 'cyan';
    context.lineWidth = box.category === 'primary' ? 5 : 4; // Adjust line width for highlight
    context.beginPath();
    context.moveTo(startPixel.x, startPixel.y);
    context.lineTo(endPixel.x, endPixel.y);
    context.stroke();
}

// Function to handle canvas click event
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // Check if the click point is near any box
    for (const box of boxes) {
        const startPixel = convertLatLngToCanvasPixel(box.yi, box.xi);
        const endPixel = convertLatLngToCanvasPixel(box.yf, box.xf);
        if (isPointNearLine(mouseX, mouseY, startPixel.x, startPixel.y, endPixel.x, endPixel.y, 10)) {
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
        const startPixel = convertLatLngToCanvasPixel(box.yi, box.xi);
        const endPixel = convertLatLngToCanvasPixel(box.yf, box.xf);
        if (isPointNearLine(mouseX, mouseY, startPixel.x, startPixel.y, endPixel.x, endPixel.y, 10)) {
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
    const startPixel = convertLatLngToCanvasPixel(box.yi, box.xi);
    const endPixel = convertLatLngToCanvasPixel(box.yf, box.xf);
    
    context.save();    
    // Calculate the angle of the line
    let angle = Math.atan2((endPixel.y - startPixel.y), (endPixel.x - startPixel.x));
    
    if (Math.abs(angle) > 1.5) {
        angle = angle + 3.1415
    }
    
    context.translate((startPixel.x + endPixel.x)/ 2, (startPixel.y + endPixel.y)/ 2);
    context.rotate(angle);
    
    // Add box names as text labels aligned with the lines
    context.fillStyle = 'black';
    context.font = '10px Arial';
    context.textAlign = 'center';
    
    // Calculate the text position along the line
    const textX = 0//(startPixel.x * 50 + endPixel.x * 50) / 2 + Math.cos(angle) * 15; // Offset by 15 pixels along the line
    const textY = 0//(startPixel.y * 50 + endPixel.y * 50) / 2 + Math.sin(angle) * 15; // Offset by 15 pixels along the line
    
    context.fillText(box.Section_Name, 0, 10);
    
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
        const startPixel = convertLatLngToCanvasPixel(box.yi, box.xi);
        const endPixel = convertLatLngToCanvasPixel(box.yf, box.xf);
        
        context.beginPath();
        context.moveTo(startPixel.x, startPixel.y);
        context.lineTo(endPixel.x, endPixel.y);
        context.stroke();
        
        // Draw dots at the beginning and end
        const dotRadius = 5;
        context.fillStyle = 'black'; // Dot color
        context.beginPath();
        context.arc(startPixel.x, startPixel.y, dotRadius, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(endPixel.x, endPixel.y, dotRadius, 0, Math.PI * 2);
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



function setChartVizualizeMode(road) {
    console.log(`DEBUGGING - setChartVizualizeMode - ${road['Section_Name']}`);
    performance_indicators.innerHTML = "";
    createChart('performanceChart', [], [], 'Year', '', road['Section_Name']);
    
    EDP_PI_List = ['EDP', 'PI'];
    
    EDPList = ['Cracking', 'Surface_Defects', 'Transverse_Evenness', 'Longitudinal_Evenness', 'Skid_Resistance', 
              //'Macro_Texture', 'Bearing_Capacity'
              ];
    PIList = ['123', '123', '423'];
    
    PIList = ['Cracking_ASFiNAG', 'Surface_Defects_ASFiNAG', 'Transverse_Evenness_ASFiNAG', 'Longitudinal_Evenness_ASFiNAG', 'Skid_Resistance_ASFiNAG', 'Bearing_Capacity_ASFiNAG',
              'Safety_ASFiNAG',	'Comfort_ASFiNAG',	'Functional_ASFiNAG', 'Surface_Structural_ASFiNAG', 'Structural_ASFiNAG', 'Global_ASFiNAG'
              ];
    
    // Create a selection which the user can select if he wants to see the EDP or transformed indicators.
    const EDP_PI = document.createElement("select");
    EDP_PI.name = "EDP_PI";
    EDP_PI.id = "EDP_PI";
    
    const option_1 = document.createElement("option");
    option_1.value = 'Select';
    option_1.text = 'Select';
    EDP_PI.add(option_1);
    
    for (let i = 0; i < EDP_PI_List.length; i++) {
        const option1 = document.createElement("option");
        option1.value = EDP_PI_List[i];
        option1.text = EDP_PI_List[i];
        EDP_PI.add(option1);
        performance_indicators.appendChild(EDP_PI);
    }
    
    // based on the selection of the user, shows the EDP or PI list
    EDP_PI.addEventListener('change', () => {
        console.log(`DEBUGGING - change_EDP_PI - ${document.getElementById("EDP_PI").value}`);
        
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
        
        if (document.getElementById("EDP_PI").value == 'EDP') {
            lista = EDPList;
        };
        
        if (document.getElementById("EDP_PI").value == 'PI') {
            lista = PIList;
        };
        
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
            
            let dates =  road['inspections'].map(obj => obj.Date)//.map(date => new Date(date));
            let performance =  road['inspections'].map(obj => obj[performance_indicator]);
            
            createChart('performanceChart', dates, performance, 'Year', performance_indicator, road['Section_Name']);
        });
    });
};
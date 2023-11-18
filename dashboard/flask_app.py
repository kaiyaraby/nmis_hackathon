import uuid
import json

import pandas as pd

from pathlib import Path
THIS_FOLDER = Path(__file__).parent.resolve()

from functools import wraps

from flask import Flask, render_template, request, redirect, session, jsonify, send_file

from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key1'

@app.route('/')
@app.route('/home')
def index():
    return render_template('home.html')

@app.route('/manual')
def manual():
    return render_template('home.html')
    
@app.route('/map')
def show_maps():
    
    
    path_properties = THIS_FOLDER / './database/box_properties.csv'
    path_data = THIS_FOLDER / './database/box_data.csv'
    
    box_properties = pd.read_csv(path_properties).to_dict('records')
    box_inpections = pd.read_csv(path_data).to_dict('records')
    
    for box in box_properties:
        filtered_inspections = [r for r in box_inpections if r['Section_Name'] == box['Section_Name']]
        box['inspections'] = sorted(filtered_inspections, key=lambda d: datetime.strptime(d['Date'], "%d/%m/%Y"))
        
    
    return render_template('map.html', boxes=box_properties)

@app.route('/about')
def about():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)

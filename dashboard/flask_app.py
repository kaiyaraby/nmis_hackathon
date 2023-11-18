import uuid
import json
from datetime import datetime


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
    
@app.route('/map')
def show_maps():
    path_properties = THIS_FOLDER / './database/box_properties.csv'
    box_properties = pd.read_csv(path_properties).to_dict('records')
    return render_template('map.html', boxes=box_properties)

@app.route('/get_data/<box_id>', methods=['GET'])
def box_data(box_id):

    path_data = THIS_FOLDER / './database/box_data.csv'
    
    box_inpections = pd.read_csv(path_data).to_dict('records')

    filtered_inspections = [r for r in box_inpections if r['Box_Name'] == box_id]
    box_data = sorted(filtered_inspections, key=lambda d: datetime.strptime(d['Datetime'], "%b-%y"))
    
    return jsonify(box_data)

@app.route('/about')
def about():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)

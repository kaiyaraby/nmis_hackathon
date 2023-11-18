import uuid
import json

import pandas as pd

from pathlib import Path
THIS_FOLDER = Path(__file__).parent.resolve()

from functools import wraps

from flask import Flask, render_template, request, redirect, session, jsonify, send_file

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
def map():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)

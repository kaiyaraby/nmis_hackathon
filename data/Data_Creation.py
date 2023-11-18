#!/usr/bin/env python
# coding: utf-8

# In[20]:


import numpy as np
import pandas as pd
import xarray as xr
import os
import matplotlib.pyplot as plt
import scipy.stats as stats
import re
import zipfile as zf


# In[58]:


# Import hourly time series large data set across stations, dropping any null values
weather_data = pd.read_csv('station_hour.csv').dropna().reset_index(drop=True)

# Unzip folder with individual station data
files = zf.ZipFile("station_data.zip", 'r')
files.extractall('station_data')
files.close()


# In[152]:


data_gen_dict = {}
problem_Ids = []

factors = ['Temp (degree C)', 'WS (m/s)', 'WD (deg)', 'SR (W/mt2)', 'BP (mmHg)', 'RF (mm)']

# Gather a data pool of factor data by month for each station to draw from
for Id in weather_data.StationId.unique():
    try:
        id_dict = {}
        station_data = pd.read_csv('station_data/'+Id+'.csv') # read individual station data for station id
        for factor in factors:
            # Select time and factor data column 
            df = pd.DataFrame({'Time':station_data['From Date'], 'Values':station_data[factor]}).dropna()
            df['Time'] = pd.to_datetime(df['Time']) # convert time column to datetime format
            df['Month'] = df['Time'].dt.month # create a new column giving the month
            factor_dict = {} 
            # For each month extract the data for that factor and store in sub-dictionary
            for month in temps.Month.unique():
                factor_dict[month] = list(df[df['Month']==month].Values)
            id_dict[factor] = factor_dict
        data_gen_dict[Id] = id_dict
    except:
        problem_Ids.append(Id)


# In[100]:


weather_data = weather_data[~weather_data['StationId'].isin(problem_Ids)] # 
weather_data['Datetime'] = pd.to_datetime(weather_data['Datetime'])
weather_data['Month'] = weather_data['Datetime'].dt.month


# In[129]:


lengths = []
for station in df.StationId.unique():
    lengths.append(len(df[df['StationId']==station]))


# In[153]:


df = weather_data.copy().reset_index()
problem_selection = []
for factor in factors:
    values = np.zeros(len(df))
    for i in range(len(df)):
        select = data_gen_dict[df.StationId[i]][factor][df.Month[i]]
        try:
            values[i] = np.random.choice(select)
        except:
            problem_selection.append((df.StationId[i], factor, df.Month[i]))
    df[factor] = values
#     df[factor] = [np.random.choice(data_gen_dict[df.StationId[i]][factor][df.Month[i]]) for i in range(len(df))]


# In[154]:


new_df = pd.DataFrame(np.repeat(df.values, 3, axis=0))
new_df.columns = df.columns


# In[157]:


sensors = []
for i in range(3):
    for j in range(1,len(lengths)+1):
        sensors += [i*5+j]*lengths[j-1]


# In[160]:


new_df['Sensor'] = sensors


# In[159]:


len(sensors)


# In[142]:


location_dict = {1: {'Long':55.8611666,
                    'Lat': -4.255036,
                    'GS': 0.7,
                    'STN': 0.5,
                    'R':0.6},
                2: {'Long':55.8567839,
                    'Lat': -4.2542592,
                    'GS': 0.3,
                    'STN': 0.5,
                    'R':0.2},
                3: {'Long':55.8612746,
                    'Lat': -4.2607426,
                    'GS': 0.9,
                    'STN': 0.3,
                    'R':0.6},
                4: {'Long':55.8553413,
                    'Lat': -4.2579352,
                    'GS': 0.3,
                    'STN': 0.4,
                    'R':0.0534},
                5: {'Long':55.856962,
                    'Lat': -4.2508831,
                    'GS': 0.3,
                    'STN': 0.6,
                    'R':0.3},
                6: {'Long':55.8596991,
                    'Lat': -4.2510207,
                    'GS': 0.5,
                    'STN': 0.7,
                    'R':0.5},
                7: {'Long':55.8600017,
                    'Lat': -4.2565153,
                    'GS': 0.7,
                    'STN': 0.4,
                    'R':0.5},
                8: {'Long':55.858949,
                    'Lat': -4.2484797,
                    'GS': 0.4,
                    'STN': 0.7,
                    'R':0.5},
                9: {'Long':55.8567629,
                    'Lat': -4.2578129,
                    'GS': 0.4,
                    'STN': 0.4,
                    'R':0.2},
                10: {'Long':55.8584965,
                    'Lat': -4.2570707,
                    'GS': 0.6,
                    'STN': 0.3,
                    'R':0.4},
                11: {'Long':55.8575769,
                    'Lat': -4.2471082,
                    'GS': 0.3,
                    'STN': 0.7,
                    'R':0.5},
                12: {'Long':55.8560143,
                    'Lat': -4.24820727,
                    'GS': 0.2,
                    'STN': 0.7,
                    'R':0.4},
                13: {'Long':55.8543702,
                    'Lat': -4.2540772,
                    'GS': 0.2,
                    'STN': 0.6,
                    'R':0.1},
                14: {'Long':55.8584154,
                    'Lat': -4.2567481,
                    'GS': 0.5,
                    'STN': 0.5,
                    'R':0.3},
                15: {'Long':55.8545429,
                    'Lat': -4.2503437,
                    'GS': 0.0714,
                    'STN': 0.7,
                    'R':0.3}}


# In[161]:


df = new_df
for factor in ['Long', 'Lat', 'GS', 'STN', 'R']:
    df[factor] = [location_dict[df['Sensor'][i]][factor] for i in range(len(df))]


# In[170]:


df['Vib (m/s)'] = [0.1*(np.random.rand()+2*df['STN'][i]) for i in range(len(df))]
df['WS (m/s)'] = df['WS (m/s)']+df['GS']
df['CO'] = df['CO']-0.5*df['GS']-0.1*df['R']
df['Humidity (%)'] = 0.3+df['RF (mm)']/43.5+df['R']*0.5


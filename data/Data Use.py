#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import re
import collections
collections.Iterable = collections.abc.Iterable


# In[38]:


df = pd.read_csv('Data.csv')


# In[39]:


df['Time'] = pd.to_datetime(df['Datetime']) # convert time column to datetime format
df['Year'] = df['Time'].dt.year
df['Date'] = [str(df['Month'][i])+'/'+str(df['Year'][i]) for i in range(len(df))]


# In[40]:


df = df[['Sensor', 'Long', 'Lat', 'Date', 'GS', 'R', 'STN', 'Vib (m/s)', 'Humidity (%)', 'CO', 'Temp (degree C)', 'WS (m/s)', 'SR (W/mt2)', 'BP (mmHg)', 'RF (mm)']]


# In[61]:


factors = ['Sensor','Long', 'Lat', 'GS', 'R', 'STN', 'Vib (m/s)', 'Humidity (%)', 'CO', 'Temp (degree C)', 'WS (m/s)', 'SR (W/mt2)', 'BP (mmHg)', 'RF (mm)']
dataframes = []
for sensor in df.Sensor.unique():
    sensor_df = df[df['Sensor']==sensor]
    for factor in factors:
        if factor=='Sensor':
            means_df = sensor_df.groupby('Date')[factor].agg(Mean_Value='mean').reset_index()
            means_df[factor] = sensor_df.groupby('Date')[factor].agg(Mean_Value='mean').reset_index()['Mean_Value']
        else:
            means_df[factor] = sensor_df.groupby('Date')[factor].agg(Mean_Value='mean').reset_index()['Mean_Value']
    dataframes.append(means_df)


# In[66]:


data_extract = pd.concat(dataframes)


# In[65]:


data_extract.to_csv('data_extract.csv')

